'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/** Dropdown del maestro (empleado) a visualizar; el seleccionado vive en la URL (?empleado=). */
export function EmployeeSelect({
  employees,
  selectedId,
}: {
  employees: { id: string; name: string }[];
  selectedId: string;
}) {
  const router = useRouter();
  const items = employees.map((employee) => ({ value: employee.id, label: employee.name }));

  return (
    <Select
      items={items}
      value={selectedId}
      onValueChange={(value) => {
        if (value) router.push(`/transacciones?empleado=${value}`);
      }}
    >
      <SelectTrigger className='w-full sm:w-64' aria-label='Empleado'>
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
  );
}
