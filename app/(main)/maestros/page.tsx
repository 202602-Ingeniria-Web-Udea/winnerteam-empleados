import { IconAlertTriangle } from '@tabler/icons-react';
import Link from 'next/link';
import { CreateEmployeeDialog } from '@/components/employees/create-employee-dialog';
import { EmployeesTable, LOW_BALANCE_HOURS } from '@/components/employees/employees-table';
import { Pagination } from '@/components/list/pagination';
import { SearchInput } from '@/components/list/search-input';
import { UrlSelect } from '@/components/list/url-select';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  buildHref,
  employeeOrderBy,
  normalizeSearch,
  PAGE_SIZE,
  paginate,
  parseEmployeeListParams,
} from '@/lib/list-params';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { cn } from '@/lib/utils';

const SORT_ITEMS = [
  { value: 'nombre', label: 'Nombre (A–Z)' },
  { value: 'saldo-asc', label: 'Saldo: menor primero' },
  { value: 'saldo-desc', label: 'Saldo: mayor primero' },
];

export default async function MaestrosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const { q, page, sort, lowBalanceOnly } = parseEmployeeListParams(await searchParams);
  // Parámetros normalizados que conservan los enlaces de paginación y filtros.
  const params = {
    q: q || undefined,
    orden: sort === 'nombre' ? undefined : sort,
    filtro: lowBalanceOnly ? 'saldo-bajo' : undefined,
  };

  // Búsqueda y filtros en la base de datos: la página nunca carga todos los empleados.
  const where = {
    ...(q ? { nameSearch: { contains: normalizeSearch(q) } } : {}),
    ...(lowBalanceOnly ? { balance: { lt: LOW_BALANCE_HOURS } } : {}),
  };
  const total = await prisma.employee.count({ where });
  const pagination = paginate(total, page);
  const employees = await prisma.employee.findMany({
    where,
    orderBy: employeeOrderBy(sort),
    skip: pagination.skip,
    take: pagination.take,
    include: { createdBy: { select: { name: true, lastName: true, email: true } } },
  });

  return (
    <>
      <PageHeader
        title='Maestros de empleados'
        description='Empleados registrados y su saldo actual de horas.'
        // Solo ADMIN ve el botón; la API además rechaza con 403 a cualquier otro rol.
        action={user.role === 'ADMIN' ? <CreateEmployeeDialog /> : undefined}
      />

      <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
        <SearchInput params={params} placeholder='Buscar por nombre…' label='Buscar empleado' />
        <UrlSelect name='orden' value={sort} items={SORT_ITEMS} params={params} label='Ordenar empleados' />
        <Button
          variant='outline'
          className={cn('h-10 bg-card', lowBalanceOnly && 'border-mustard bg-mustard/25 hover:bg-mustard/35')}
          aria-pressed={lowBalanceOnly}
          nativeButton={false}
          render={
            <Link href={buildHref('/maestros', params, { filtro: lowBalanceOnly ? null : 'saldo-bajo' })} scroll={false} />
          }
        >
          <IconAlertTriangle />
          Solo saldo bajo
        </Button>
      </div>

      <EmployeesTable employees={employees} emptyMessage={q || lowBalanceOnly ? 'Ningún empleado coincide con la búsqueda.' : undefined} />
      <Pagination
        pathname='/maestros'
        params={params}
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        noun={total === 1 ? 'empleado' : 'empleados'}
      />
    </>
  );
}
