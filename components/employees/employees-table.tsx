import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatHours, shortId } from '@/lib/format';

export type EmployeeRow = {
  id: string;
  name: string;
  balance: number;
  createdAt: Date;
  createdBy: { name: string; lastName: string | null; email: string };
};

// Umbral de "saldo bajo", compartido con el dashboard.
export const LOW_BALANCE_HOURS = 8;

export function EmployeesTable({ employees }: { employees: EmployeeRow[] }) {
  return (
    <div className='overflow-x-auto rounded-xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className='text-right'>Saldo</TableHead>
            <TableHead>Creado por</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length ? (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className='font-mono text-xs text-muted-foreground' title={employee.id}>
                  {shortId(employee.id)}
                </TableCell>
                <TableCell className='font-medium'>{employee.name}</TableCell>
                <TableCell className='text-right tabular-nums'>
                  <span className='inline-flex items-center gap-2'>
                    {employee.balance < LOW_BALANCE_HOURS && <Badge variant='destructive'>Saldo bajo</Badge>}
                    {formatHours(employee.balance)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className='leading-tight'>
                    <p>{[employee.createdBy.name, employee.createdBy.lastName].filter(Boolean).join(' ')}</p>
                    <p className='text-xs text-muted-foreground'>{employee.createdBy.email}</p>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                Aún no hay empleados registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
