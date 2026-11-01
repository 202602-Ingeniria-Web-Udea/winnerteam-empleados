'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { buildHref } from '@/lib/list-params';
import { cn } from '@/lib/utils';

type EmployeeOption = { id: string; name: string };

/**
 * Selector del maestro (empleado) con búsqueda: se escribe parte del nombre y
 * la lista se filtra (sin importar tildes ni mayúsculas). Pensado para cientos
 * de empleados. El seleccionado vive en la URL (?empleado=).
 */
export function EmployeeSelect({
  employees,
  selectedId,
  params,
}: {
  employees: EmployeeOption[];
  selectedId: string;
  params: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const selected = employees.find((employee) => employee.id === selectedId) ?? null;

  return (
    <Combobox
      items={employees}
      value={selected}
      itemToStringLabel={(employee: EmployeeOption) => employee.name}
      isItemEqualToValue={(a: EmployeeOption, b: EmployeeOption) => a.id === b.id}
      onValueChange={(employee: EmployeeOption | null) => {
        if (!employee || employee.id === selectedId) return;
        // Cambiar de empleado vuelve a la primera página de movimientos.
        startTransition(() =>
          router.push(buildHref('/transacciones', params, { empleado: employee.id, pagina: null }))
        );
      }}
    >
      <ComboboxInput
        placeholder='Buscar empleado…'
        aria-label='Empleado'
        className={cn('h-10 w-full bg-card sm:w-72', pending && 'opacity-60')}
      />
      <ComboboxContent>
        <ComboboxEmpty>No se encontró ningún empleado.</ComboboxEmpty>
        <ComboboxList>
          {(employee: EmployeeOption) => (
            <ComboboxItem key={employee.id} value={employee}>
              {employee.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
