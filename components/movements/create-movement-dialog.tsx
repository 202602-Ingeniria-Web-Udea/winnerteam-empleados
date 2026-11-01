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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { sendJson } from '@/lib/api-client';
import { formatHours } from '@/lib/format';
import { movementSchema, type MovementInput } from '@/lib/validation';

type MovementForm = z.input<typeof movementSchema>;

const TYPE_ITEMS = [
  { value: 'ENTRADA', label: 'Entrada — horas trabajadas o extra' },
  { value: 'SALIDA', label: 'Salida — ausencias o permisos' },
];

export function CreateMovementDialog({
  employee,
}: {
  employee: { id: string; name: string; balance: number };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<MovementForm, unknown, MovementInput>({
    resolver: zodResolver(movementSchema),
    values: { employeeId: employee.id, type: 'ENTRADA', quantity: '' },
  });

  function handleOpenChange(next: boolean) {
    if (loading) return;
    setOpen(next);
    if (!next) form.reset();
  }

  async function onSubmit(data: MovementInput) {
    setLoading(true);
    const result = await sendJson('/api/movimientos', 'POST', data);
    setLoading(false);
    if (!result.ok) {
      // Ej.: saldo insuficiente. El diálogo queda abierto para corregir la cantidad.
      toast.error(result.error);
      return;
    }
    toast.success('Movimiento registrado correctamente');
    setOpen(false);
    form.reset();
    // Re-renderiza en el servidor: tabla, saldo y gráfica se actualizan juntos.
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <IconPlus />
            Agregar movimiento
          </Button>
        }
      />
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='grid gap-6'>
          <DialogHeader>
            <DialogTitle>Agregar movimiento · {employee.name}</DialogTitle>
            <DialogDescription>Saldo actual: {formatHours(employee.balance)}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name='type'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='movement-type'>Tipo de movimiento</FieldLabel>
                  <Select items={TYPE_ITEMS} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id='movement-type' className='w-full' aria-invalid={fieldState.invalid}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_ITEMS.map((item) => (
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
            <Controller
              name='quantity'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='movement-quantity'>Cantidad de horas</FieldLabel>
                  <Input
                    {...field}
                    value={field.value as string | number}
                    id='movement-quantity'
                    type='number'
                    inputMode='numeric'
                    min={1}
                    step={1}
                    aria-invalid={fieldState.invalid}
                  />
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
