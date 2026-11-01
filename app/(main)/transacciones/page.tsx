import Link from 'next/link';
import { BalanceChart } from '@/components/movements/balance-chart';
import { CreateMovementDialog } from '@/components/movements/create-movement-dialog';
import { EmployeeSelect } from '@/components/movements/employee-select';
import { MovementsTable } from '@/components/movements/movements-table';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildDailyBalanceSeries } from '@/lib/balance';
import { formatHours } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

export default async function TransaccionesPage({
  searchParams,
}: {
  searchParams: Promise<{ empleado?: string | string[] }>;
}) {
  const user = await requireUser();
  const { empleado } = await searchParams;

  const employees = await prisma.employee.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, balance: true },
  });

  if (employees.length === 0) {
    return (
      <>
        <PageHeader title='Transacciones' description='Movimientos de horas por empleado.' />
        <Card>
          <CardContent className='flex flex-col items-start gap-3 py-6'>
            <p className='text-muted-foreground'>Aún no hay empleados registrados.</p>
            {user.role === 'ADMIN' && (
              <Button variant='outline' nativeButton={false} render={<Link href='/maestros' />}>
                Ir a Maestros
              </Button>
            )}
          </CardContent>
        </Card>
      </>
    );
  }

  // Si el parámetro falta o no corresponde a un empleado, se muestra el primero.
  const selected = employees.find((employee) => employee.id === empleado) ?? employees[0];

  const movements = await prisma.hourMovement.findMany({
    where: { employeeId: selected.id },
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { name: true, lastName: true, email: true } } },
  });
  const series = buildDailyBalanceSeries(movements);

  return (
    <>
      <PageHeader
        title='Transacciones'
        description='Movimientos de horas por empleado.'
        action={
          <>
            <EmployeeSelect
              employees={employees.map(({ id, name }) => ({ id, name }))}
              selectedId={selected.id}
            />
            <CreateMovementDialog employee={selected} />
          </>
        }
      />

      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]'>
        <Card className='min-w-0'>
          <CardHeader>
            <CardTitle>Evolución del saldo diario</CardTitle>
            <CardDescription>Horas acumuladas de {selected.name} al cierre de cada día.</CardDescription>
          </CardHeader>
          <CardContent>
            <BalanceChart data={series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Saldo actual</CardDescription>
            <CardTitle className='text-4xl tabular-nums'>{formatHours(selected.balance)}</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            {movements.length} {movements.length === 1 ? 'movimiento registrado' : 'movimientos registrados'}
          </CardContent>
        </Card>
      </div>

      <MovementsTable movements={movements} />
    </>
  );
}
