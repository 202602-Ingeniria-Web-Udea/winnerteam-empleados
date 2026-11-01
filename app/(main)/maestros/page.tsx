import { CreateEmployeeDialog } from '@/components/employees/create-employee-dialog';
import { EmployeesTable } from '@/components/employees/employees-table';
import { PageHeader } from '@/components/page-header';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

export default async function MaestrosPage() {
  const user = await requireUser();
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' },
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
      <EmployeesTable employees={employees} />
    </>
  );
}
