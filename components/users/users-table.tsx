import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditRoleDialog } from '@/components/users/edit-role-dialog';
import type { Role } from '@/lib/balance';
import { formatDate, shortId } from '@/lib/format';

export type UserRow = { id: string; email: string; role: Role; createdAt: Date };

export function UsersTable({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  return (
    <div className='overflow-x-auto rounded-2xl border bg-card'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Fecha de creación</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className='text-right'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className='font-mono text-xs text-muted-foreground' title={user.id}>
                {shortId(user.id)}
              </TableCell>
              <TableCell className='whitespace-nowrap'>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                {user.email}
                {user.id === currentUserId && <span className='ml-2 text-xs text-muted-foreground'>(tú)</span>}
              </TableCell>
              <TableCell>
                <Badge className={user.role === 'ADMIN' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}>
                  {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                </Badge>
              </TableCell>
              <TableCell className='text-right'>
                <EditRoleDialog user={user} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
