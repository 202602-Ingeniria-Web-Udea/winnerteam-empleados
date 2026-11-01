import { IconArrowsExchange } from '@tabler/icons-react';
import { EmptyState } from '@/components/empty-state';
import { MovementBadge } from '@/components/movements/movement-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MovementType } from '@/lib/balance';
import { formatDate, formatSignedHours, shortId } from '@/lib/format';
import { reasonLabel, type MovementReason } from '@/lib/reasons';

export type MovementRow = {
  id: string;
  type: MovementType;
  quantity: number;
  reason: MovementReason;
  description: string;
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
            <TableHead>Motivo</TableHead>
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
                <TableCell className='max-w-72 whitespace-normal'>
                  <p className='font-medium'>{reasonLabel(movement.reason)}</p>
                  {movement.description && (
                    <p className='line-clamp-2 text-xs text-muted-foreground' title={movement.description}>
                      {movement.description}
                    </p>
                  )}
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
              <TableCell colSpan={6}>
                <EmptyState icon={<IconArrowsExchange />}>Este empleado aún no tiene movimientos.</EmptyState>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
