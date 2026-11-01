import { IconArrowsExchange } from '@tabler/icons-react';
import { EmptyState } from '@/components/empty-state';
import { MovementBadge } from '@/components/movements/movement-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MovementType } from '@/lib/balance';
import { formatDate, formatSignedHours, shortId } from '@/lib/format';

export type MovementRow = {
  id: string;
  type: MovementType;
  quantity: number;
  createdAt: Date;
  createdBy: { name: string; lastName: string | null; email: string };
};

export function MovementsTable({ movements }: { movements: MovementRow[] }) {
  return (
    <div className='overflow-x-auto rounded-2xl border bg-card'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className='text-right'>Horas</TableHead>
            <TableHead>Responsable</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.length ? (
            movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className='font-mono text-xs text-muted-foreground' title={movement.id}>
                  {shortId(movement.id)}
                </TableCell>
                <TableCell className='whitespace-nowrap'>{formatDate(movement.createdAt)}</TableCell>
                <TableCell>
                  <MovementBadge type={movement.type} />
                </TableCell>
                <TableCell
                  className={`text-right font-medium tabular-nums ${movement.type === 'ENTRADA' ? 'text-primary' : 'text-destructive'}`}
                >
                  {formatSignedHours(movement.type, movement.quantity)}
                </TableCell>
                <TableCell>
                  <div className='leading-tight'>
                    <p>{[movement.createdBy.name, movement.createdBy.lastName].filter(Boolean).join(' ')}</p>
                    <p className='text-xs text-muted-foreground'>{movement.createdBy.email}</p>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>
                <EmptyState icon={<IconArrowsExchange />}>Este empleado aún no tiene movimientos.</EmptyState>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
