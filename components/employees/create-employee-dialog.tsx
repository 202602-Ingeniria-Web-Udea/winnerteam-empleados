'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type * as z from 'zod';

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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { sendJson } from '@/lib/api-client';
import { employeeSchema, type EmployeeInput } from '@/lib/validation';

// Tipo de entrada del formulario (los inputs entregan texto; zod lo convierte).
type EmployeeForm = z.input<typeof employeeSchema>;

export function CreateEmployeeDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<EmployeeForm, unknown, EmployeeInput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: '', initialBalance: 0 },
  });

  function handleOpenChange(next: boolean) {
    if (loading) return; // no cerrar mientras se guarda
    setOpen(next);
    if (!next) form.reset();
  }

  async function onSubmit(data: EmployeeInput) {
    setLoading(true);
    const result = await sendJson('/api/empleados', 'POST', data);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Empleado creado correctamente');
    setOpen(false);
    form.reset();
    // Vuelve a renderizar la página en el servidor: la tabla muestra el nuevo empleado.
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <IconPlus />
            Agregar
          </Button>
        }
      />
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='grid gap-6'>
          <DialogHeader>
            <DialogTitle>Agregar empleado</DialogTitle>
            <DialogDescription>
              Registra un nuevo empleado y las horas con las que inicia su banco de horas.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='employee-name'>Nombre completo</FieldLabel>
                  <Input {...field} id='employee-name' autoComplete='off' aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name='initialBalance'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='employee-balance'>Saldo inicial (horas)</FieldLabel>
                  <Input
                    {...field}
                    value={field.value as string | number}
                    id='employee-balance'
                    type='number'
                    inputMode='numeric'
                    min={0}
                    step={1}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Horas acumuladas que el empleado ya tiene a favor.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type='button' variant='outline' disabled={loading} onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type='submit' disabled={loading}>
              {loading && <Spinner />}
              {loading ? 'Creando…' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
