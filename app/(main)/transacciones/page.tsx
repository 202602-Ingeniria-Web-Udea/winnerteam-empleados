import Link from 'next/link';
import { Pagination } from '@/components/list/pagination';
import { BalanceChart } from '@/components/movements/balance-chart';
import { CreateMovementDialog } from '@/components/movements/create-movement-dialog';
import { EmployeeSelect } from '@/components/movements/employee-select';
import { MovementsTable } from '@/components/movements/movements-table';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildDailyBalanceSeries } from '@/lib/balance';
import { formatHours } from '@/lib/format';
import { buildHref, PAGE_SIZE, paginate, parsePage, parseRange, seriesSince } from '@/lib/list-params';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { cn } from '@/lib/utils';

const RANGES = [
  { value: '30', label: '30 días' },
  { value: '90', label: '90 días' },
  { value: 'todo', label: 'Todo' },
];

export default async function TransaccionesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const raw = await searchParams;
  const range = parseRange(raw.rango);

  // Para el selector basta id y nombre, aunque haya cientos de empleados.
  const employees = await prisma.employee.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });

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
  const empleado = Array.isArray(raw.empleado) ? raw.empleado[0] : raw.empleado;
  const selectedId = employees.find((employee) => employee.id === empleado)?.id ?? employees[0].id;
  const selected = await prisma.employee.findUniqueOrThrow({
    where: { id: selectedId },
    select: { id: true, name: true, balance: true },
  });
  const params = { empleado: selected.id, rango: range === 90 ? undefined : String(range) };

  // La gráfica necesita todo el historial (el saldo es acumulado), pero solo
  // tres columnas; la tabla se pagina por separado.
  const [history, total] = await Promise.all([
    prisma.hourMovement.findMany({
      where: { employeeId: selected.id },
      orderBy: { createdAt: 'asc' },
      select: { type: true, quantity: true, createdAt: true },
    }),
    prisma.hourMovement.count({ where: { employeeId: selected.id } }),
  ]);
  const pagination = paginate(total, parsePage(raw.pagina));
  const movements = await prisma.hourMovement.findMany({
    where: { employeeId: selected.id },
    orderBy: { createdAt: 'desc' },
    skip: pagination.skip,
    take: pagination.take,
    include: { createdBy: { select: { name: true, lastName: true, email: true } } },
  });
  const series = seriesSince(buildDailyBalanceSeries(history), range);

  return (
    <>
      <PageHeader
        title='Transacciones'
        description='Movimientos de horas por empleado.'
        action={
          <>
            <EmployeeSelect employees={employees} selectedId={selected.id} params={params} />
            <CreateMovementDialog employee={selected} />
          </>
        }
      />

      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]'>
        <Card className='min-w-0'>
          <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div className='space-y-1.5'>
              <CardTitle className='font-heading text-xl'>Evolución del saldo diario</CardTitle>
              <CardDescription>Horas acumuladas de {selected.name} al cierre de cada día.</CardDescription>
            </div>
            {/* Rango de la gráfica: con meses de historial, ver todo a la vez es ilegible. */}
            <div role='group' aria-label='Rango de la gráfica' className='inline-flex shrink-0 rounded-lg bg-muted p-1'>
              {RANGES.map((option) => {
                const active = String(range) === option.value;
                return (
                  <Link
                    key={option.value}
                    href={buildHref('/transacciones', params, { rango: option.value === '90' ? null : option.value, pagina: null })}
                    scroll={false}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                      active && 'bg-card text-foreground shadow-sm'
                    )}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </CardHeader>
          <CardContent>
            <BalanceChart data={series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Saldo actual</CardDescription>
            <CardTitle className='font-heading text-5xl font-semibold tabular-nums text-primary'>
              {formatHours(selected.balance)}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            {total.toLocaleString('es-CO')} {total === 1 ? 'movimiento registrado' : 'movimientos registrados'}
          </CardContent>
        </Card>
      </div>

      <MovementsTable movements={movements} />
      <Pagination
        pathname='/transacciones'
        params={params}
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        noun={total === 1 ? 'movimiento' : 'movimientos'}
      />
    </>
  );
}
