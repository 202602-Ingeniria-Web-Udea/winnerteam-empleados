import { PageHeader } from '@/components/page-header';
import { UsersTable } from '@/components/users/users-table';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/session';

// Solo ADMIN: un USER que escriba la URL es redirigido al inicio.
export default async function UsuariosPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({
    where: { deleted: false },
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return (
    <>
      <PageHeader title='Usuarios' description='Usuarios del sistema y su rol asignado.' />
      <UsersTable users={users} currentUserId={admin.id} />
    </>
  );
}
