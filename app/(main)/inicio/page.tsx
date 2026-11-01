import {
  IconAlertTriangle,
  IconArrowRight,
  IconArrowsExchange,
  IconCircleCheck,
  IconClockHour4,
  IconUsersGroup,
} from '@tabler/icons-react';
import Link from 'next/link';
import { RecentMovements } from '@/components/dashboard/recent-movements';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/empty-state';
import { LOW_BALANCE_HOURS } from '@/components/employees/employees-table';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { startOfBusinessDay } from '@/lib/balance';
import { formatHours } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

// Dashboard de inicio: indicadores generales del banco de horas.
export default async function InicioPage() {
  const user = await requireUser();

  // Consultas independientes en paralelo para no sumar latencias.
  const [employeeCount, totals, todayCount, lowBalanceCount, lowBalance, recent] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.aggregate({ _sum: { balance: true } }),
    prisma.hourMovement.count({ where: { createdAt: { gte: startOfBusinessDay() } } }),
    prisma.employee.count({ where: { balance: { lt: LOW_BALANCE_HOURS } } }),
    // Solo los 5 más críticos: con cientos de empleados la lista completa vive en Maestros.
    prisma.employee.findMany({
      where: { balance: { lt: LOW_BALANCE_HOURS } },
      orderBy: [{ balance: 'asc' }, { name: 'asc' }],
      take: 5,
      select: { id: true, name: true, balance: true },
    }),
    prisma.hourMovement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: { select: { id: true, name: true } },
        createdBy: { select: { name: true, lastName: true } },
      },
    }),
  ]);

  return (
    <>
      <PageHeader title={`Hola, ${user.name}`} description='Este es el resumen del banco de horas de hoy.' />

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard title='Empleados' value={employeeCount.toLocaleString('es-CO')} icon={<IconUsersGroup />} tone='forest' />
        <StatCard
          title='Horas acumuladas'
          value={formatHours(totals._sum.balance ?? 0)}
          description='Suma de los saldos de todos los empleados'
          icon={<IconClockHour4 />}
          tone='sage'
        />
        <StatCard title='Movimientos de hoy' value={todayCount.toLocaleString('es-CO')} icon={<IconArrowsExchange />} tone='clay' />
        <StatCard
          title={`Saldo bajo (< ${LOW_BALANCE_HOURS} h)`}
          value={lowBalanceCount.toLocaleString('es-CO')}
          description='Empleados con pocas horas a favor'
          icon={<IconAlertTriangle />}
          tone='mustard'
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='font-heading text-xl'>Empleados con saldo bajo</CardTitle>
            <CardDescription>
              {lowBalanceCount > lowBalance.length
                ? `Los ${lowBalance.length} más críticos de ${lowBalanceCount.toLocaleString('es-CO')} con menos de ${LOW_BALANCE_HOURS} horas.`
                : `Tienen menos de ${LOW_BALANCE_HOURS} horas acumuladas.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowBalance.length === 0 ? (
              <EmptyState icon={<IconCircleCheck />}>Ningún empleado tiene saldo bajo.</EmptyState>
            ) : (
              <ul className='divide-y'>
                {lowBalance.map((employee) => (
                  <li key={employee.id} className='flex items-center justify-between gap-3 py-3'>
                    <Link
                      href={`/transacciones?empleado=${employee.id}`}
                      className='truncate font-medium hover:underline'
                    >
                      {employee.name}
                    </Link>
                    <span className='rounded-full bg-mustard/30 px-2 py-0.5 text-sm font-semibold tabular-nums text-[#6B4E0E]'>
                      {formatHours(employee.balance)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {lowBalanceCount > lowBalance.length && (
              <Button
                variant='outline'
                size='sm'
                className='mt-3'
                nativeButton={false}
                render={<Link href='/maestros?filtro=saldo-bajo&orden=saldo-asc' />}
              >
                Ver los {lowBalanceCount.toLocaleString('es-CO')} empleados
                <IconArrowRight />
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='font-heading text-xl'>Últimos movimientos</CardTitle>
            <CardDescription>Los cinco registros más recientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentMovements movements={recent} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
