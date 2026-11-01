import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
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
    return <p className='text-sm text-muted-foreground'>Todavía no hay movimientos registrados.</p>;
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
          <Badge variant={movement.type === 'ENTRADA' ? 'secondary' : 'destructive'} className='tabular-nums'>
            {formatSignedHours(movement.type, movement.quantity)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
