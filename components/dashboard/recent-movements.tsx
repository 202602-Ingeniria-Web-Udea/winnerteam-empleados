import Link from 'next/link';
import { IconArrowsExchange } from '@tabler/icons-react';
import { EmptyState } from '@/components/empty-state';
import { MovementBadge } from '@/components/movements/movement-badge';
import type { MovementType } from '@/lib/balance';
import { formatDate, formatSignedHours } from '@/lib/format';

export type RecentMovement = {
  id: string;
  type: MovementType;
  quantity: number;
  createdAt: Date;
  employee: { id: string; name: string };
  createdBy: { name: string; lastName: string | null };
};

export function RecentMovements({ movements }: { movements: RecentMovement[] }) {
  if (movements.length === 0) {
    return <EmptyState icon={<IconArrowsExchange />}>Todavía no hay movimientos registrados.</EmptyState>;
  }

  return (
    <ul className='divide-y'>
      {movements.map((movement) => (
        <li key={movement.id} className='flex items-center justify-between gap-3 py-3'>
          <div className='min-w-0'>
            <Link
              href={`/transacciones?empleado=${movement.employee.id}`}
              className='block truncate font-medium hover:underline'
            >
              {movement.employee.name}
            </Link>
            <p className='truncate text-xs text-muted-foreground'>
              {formatDate(movement.createdAt)} · por{' '}
              {[movement.createdBy.name, movement.createdBy.lastName].filter(Boolean).join(' ')}
            </p>
          </div>
          <MovementBadge type={movement.type}>{formatSignedHours(movement.type, movement.quantity)}</MovementBadge>
        </li>
      ))}
    </ul>
  );
}
