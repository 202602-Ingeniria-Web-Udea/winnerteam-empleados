'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconClockHour4 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form className='p-6 md:p-8' onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <div className='flex flex-col items-center gap-2 text-center'>
                <h1 className='text-2xl font-bold'>Bienvenido de nuevo</h1>
                <p className='text-balance text-muted-foreground'>
                  Inicia sesión para gestionar el banco de horas
                </p>
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
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Field>
                <Button type='submit' disabled={loading}>
                  {loading && <Spinner />}
                  {loading ? 'Ingresando…' : 'Iniciar sesión'}
                </Button>
              </Field>
              <FieldDescription className='text-center'>
                ¿No tienes cuenta? Pídela al administrador de tu empresa.
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className='relative hidden flex-col justify-between bg-primary p-8 text-primary-foreground md:flex'>
            <IconClockHour4 className='size-10' />
            <div className='space-y-2'>
              <p className='text-2xl font-semibold'>Banco de horas</p>
              <p className='text-sm opacity-80'>
                Registra las horas trabajadas, controla los saldos de cada empleado y visualiza su
                evolución día a día.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
