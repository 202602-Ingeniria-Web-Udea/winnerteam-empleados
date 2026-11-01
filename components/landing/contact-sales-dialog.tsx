'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { sendJson } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { contactSchema, type ContactInput } from '@/lib/validation';

const TEAM_ITEMS = [
  { value: '1-25', label: '1 a 25 empleados' },
  { value: '26-100', label: '26 a 100 empleados' },
  { value: '101-500', label: '101 a 500 empleados' },
  { value: '500+', label: 'Más de 500 empleados' },
];
const PLAN_ITEMS = [
  { value: 'ESENCIAL', label: 'Esencial' },
  { value: 'PROFESIONAL', label: 'Profesional' },
  { value: 'EMPRESARIAL', label: 'Empresarial' },
];

/** Formulario "Hablar con ventas": guarda la solicitud en la base de datos. */
export function ContactSalesDialog({
  plan,
  label = 'Hablar con ventas',
  variant = 'outline',
  className,
}: {
  plan: ContactInput['plan'];
  label?: string;
  variant?: 'default' | 'outline';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const defaults: ContactInput = { name: '', company: '', email: '', teamSize: '26-100', plan, message: '', website: '' };
  const form = useForm<ContactInput>({ resolver: zodResolver(contactSchema), defaultValues: defaults });

  function handleOpenChange(next: boolean) {
    if (loading) return;
    setOpen(next);
    if (!next) form.reset(defaults);
  }

  async function onSubmit(data: ContactInput) {
    setLoading(true);
    const result = await sendJson('/api/contacto', 'POST', data);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Recibimos tu solicitud. Te escribiremos pronto.');
    setOpen(false);
    form.reset(defaults);
  }

  const text = (name: 'name' | 'company' | 'email', fieldLabel: string, type = 'text', autoComplete?: string) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`contact-${name}-${plan}`}>{fieldLabel}</FieldLabel>
          <Input {...field} id={`contact-${name}-${plan}`} type={type} autoComplete={autoComplete} aria-invalid={fieldState.invalid} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );

  const select = (name: 'teamSize' | 'plan', fieldLabel: string, items: { value: string; label: string }[]) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`contact-${name}-${plan}`}>{fieldLabel}</FieldLabel>
          <Select items={items} value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={`contact-${name}-${plan}`} className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant={variant} size='lg' className={cn('h-11 w-full', className)}>{label}</Button>} />
      <DialogContent className='max-h-[90svh] overflow-y-auto sm:max-w-lg'>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='grid gap-6'>
          <DialogHeader>
            <DialogTitle className='font-heading text-2xl'>Hablemos de tu equipo</DialogTitle>
            <DialogDescription>Déjanos tus datos y te contamos cómo Balance se adapta a tu empresa.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {text('name', 'Nombre', 'text', 'name')}
            {text('company', 'Empresa', 'text', 'organization')}
            {text('email', 'Correo de trabajo', 'email', 'email')}
            <div className='grid gap-4 sm:grid-cols-2'>
              {select('teamSize', 'Tamaño del equipo', TEAM_ITEMS)}
              {select('plan', 'Plan de interés', PLAN_ITEMS)}
            </div>
            <Controller
              name='message'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`contact-message-${plan}`}>Mensaje (opcional)</FieldLabel>
                  <Textarea {...field} id={`contact-message-${plan}`} rows={3} maxLength={500} className='resize-none' />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {/* Campo trampa: invisible para personas; los bots suelen llenarlo. */}
            <input
              {...form.register('website')}
              type='text'
              tabIndex={-1}
              autoComplete='off'
              aria-hidden='true'
              className='absolute -left-[9999px] h-0 w-0 opacity-0'
            />
          </FieldGroup>
          <DialogFooter>
            <Button type='button' variant='outline' disabled={loading} onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type='submit' disabled={loading}>
              {loading && <Spinner />}
              {loading ? 'Enviando…' : 'Enviar solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
