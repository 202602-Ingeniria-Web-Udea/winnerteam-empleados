import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { buildHref } from '@/lib/list-params';

/** Pie de una tabla paginada: "Mostrando 21–40 de 508" y botones Anterior/Siguiente. */
export function Pagination({
  pathname,
  params,
  page,
  totalPages,
  total,
  pageSize,
  noun,
}: {
  pathname: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  noun: string;
}) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const href = (target: number) => buildHref(pathname, params, { pagina: target === 1 ? null : String(target) });

  return (
    <nav aria-label='Paginación' className='flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row'>
      <p>
        Mostrando <span className='font-medium text-foreground tabular-nums'>{from}–{to}</span> de{' '}
        <span className='font-medium text-foreground tabular-nums'>{total.toLocaleString('es-CO')}</span> {noun}
      </p>
      {totalPages > 1 && (
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={page <= 1}
            nativeButton={false}
            render={page > 1 ? <Link href={href(page - 1)} scroll={false} /> : <span />}
          >
            <IconChevronLeft />
            Anterior
          </Button>
          <span className='tabular-nums'>
            Página {page} de {totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            disabled={page >= totalPages}
            nativeButton={false}
            render={page < totalPages ? <Link href={href(page + 1)} scroll={false} /> : <span />}
          >
            Siguiente
            <IconChevronRight />
          </Button>
        </div>
      )}
    </nav>
  );
}
