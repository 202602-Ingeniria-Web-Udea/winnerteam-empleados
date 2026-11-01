import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconClockHour4,
  IconUsersGroup,
} from '@tabler/icons-react';
import Link from 'next/link';
import { RecentMovements } from '@/components/dashboard/recent-movements';
import { StatCard } from '@/components/dashboard/stat-card';
import { LOW_BALANCE_HOURS } from '@/components/employees/employees-table';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { startOfBusinessDay } from '@/lib/balance';
import { formatHours } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

// Dashboard de inicio: indicadores generales del banco de horas.
export default async function InicioPage() {
  const user = await requireUser();

  // Consultas independientes en paralelo para no sumar latencias.
  const [employeeCount, totals, todayCount, lowBalance, recent] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.aggregate({ _sum: { balance: true } }),
    prisma.hourMovement.count({ where: { createdAt: { gte: startOfBusinessDay() } } }),
    prisma.employee.findMany({
      where: { balance: { lt: LOW_BALANCE_HOURS } },
      orderBy: { balance: 'asc' },
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
        <StatCard title='Empleados' value={String(employeeCount)} icon={<IconUsersGroup />} />
        <StatCard
          title='Horas acumuladas'
          value={formatHours(totals._sum.balance ?? 0)}
          description='Suma de los saldos de todos los empleados'
          icon={<IconClockHour4 />}
        />
        <StatCard title='Movimientos de hoy' value={String(todayCount)} icon={<IconArrowsExchange />} />
        <StatCard
          title={`Saldo bajo (< ${LOW_BALANCE_HOURS} h)`}
          value={String(lowBalance.length)}
          description='Empleados con pocas horas a favor'
          icon={<IconAlertTriangle />}
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Empleados con saldo bajo</CardTitle>
            <CardDescription>Tienen menos de {LOW_BALANCE_HOURS} horas acumuladas.</CardDescription>
          </CardHeader>
          <CardContent>
            {lowBalance.length === 0 ? (
              <p className='text-sm text-muted-foreground'>Ningún empleado tiene saldo bajo.</p>
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
                    <span className='font-medium tabular-nums text-destructive'>
                      {formatHours(employee.balance)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Últimos movimientos</CardTitle>
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
