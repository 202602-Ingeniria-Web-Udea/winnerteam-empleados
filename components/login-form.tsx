'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginInput } from '@/lib/validation';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        toast.error(body.error ?? 'No fue posible iniciar sesión');
        return;
      }
      // replace: el login no debe quedar en el historial; refresh: el layout
      // del panel se vuelve a renderizar ya con la cookie de sesión.
      router.replace('/inicio');
      router.refresh();
    } catch {
      toast.error('No fue posible conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn('flex w-full max-w-sm flex-col gap-8', className)} {...props}>
      <Logo className='lg:hidden' />
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <div className='space-y-2'>
            <h1 className='font-heading text-3xl font-semibold tracking-tight'>Bienvenido de nuevo</h1>
            <p className='text-muted-foreground'>Inicia sesión para gestionar el banco de horas.</p>
          </div>
          <Controller
            name='email'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='email'>Correo electrónico</FieldLabel>
                <Input
                  {...field}
                  id='email'
                  type='email'
                  autoComplete='email'
                  placeholder='nombre@empresa.com'
                  className='h-11 bg-card'
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name='password'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='password'>Contraseña</FieldLabel>
                <Input
                  {...field}
                  id='password'
                  type='password'
                  autoComplete='current-password'
                  className='h-11 bg-card'
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Field>
            <Button type='submit' size='lg' className='h-11' disabled={loading}>
              {loading && <Spinner />}
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </Field>
          <FieldDescription className='text-center'>
            ¿No tienes cuenta? Pídela al administrador de tu empresa.
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
