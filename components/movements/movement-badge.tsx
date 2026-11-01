import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import type { MovementType } from '@/lib/balance';
import { cn } from '@/lib/utils';

/** Etiqueta del tipo de movimiento: Entrada en salvia, Salida en arcilla. */
export function MovementBadge({ type, children }: { type: MovementType; children?: React.ReactNode }) {
  const isEntrada = type === 'ENTRADA';
  return (
    <Badge
      className={cn(
        'tabular-nums',
        isEntrada ? 'bg-secondary text-secondary-foreground' : 'bg-[#F7DFD3] text-destructive'
      )}
    >
      {isEntrada ? <IconArrowUpRight /> : <IconArrowDownRight />}
      {children ?? (isEntrada ? 'Entrada' : 'Salida')}
    </Badge>
  );
}
