'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconPencil } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { sendJson } from '@/lib/api-client';
import type { Role } from '@/lib/balance';
import { roleSchema, type RoleInput } from '@/lib/validation';

export const ROLE_ITEMS: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'USER', label: 'Usuario' },
];

export function EditRoleDialog({ user }: { user: { id: string; email: string; role: Role } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // `values` mantiene el rol actual como valor por defecto, también tras un refresh.
  const form = useForm<RoleInput>({
    resolver: zodResolver(roleSchema),
    values: { role: user.role },
  });

  function handleOpenChange(next: boolean) {
    if (loading) return;
    setOpen(next);
    if (!next) form.reset();
  }

  async function onSubmit(data: RoleInput) {
    setLoading(true);
    const result = await sendJson(`/api/usuarios/${user.id}`, 'PATCH', data);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Rol actualizado correctamente');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant='outline' size='sm'>
            <IconPencil />
            Editar usuario
          </Button>
        }
      />
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='grid gap-6'>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Usuario: <span className='font-medium text-foreground'>{user.email}</span>
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name='role'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`role-${user.id}`}>Rol</FieldLabel>
                  <Select items={ROLE_ITEMS} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={`role-${user.id}`} className='w-full' aria-invalid={fieldState.invalid}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_ITEMS.map((item) => (
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
          </FieldGroup>
          <DialogFooter>
            <Button type='button' variant='outline' disabled={loading} onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type='submit' disabled={loading}>
              {loading && <Spinner />}
              {loading ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
