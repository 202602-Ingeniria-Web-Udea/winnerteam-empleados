import { cn } from '@/lib/utils';

// Paleta de la marca (mismos valores que app/globals.css).
const FOREST = '#2F5D50';
const FOREST_DEEP = '#22392F';
const CLAY = '#D9784F';
const MUSTARD = '#E9C46A';
const SAND = '#F7F3EC';

/**
 * Monograma de Balance: una "b" cuya panza es un reloj. Variante "light" para
 * fondos claros (cuadro bosque) y "dark" para el sidebar (cuadro arcilla).
 */
export function LogoMark({ variant = 'light', className }: { variant?: 'light' | 'dark'; className?: string }) {
  const box = variant === 'light' ? FOREST : CLAY;
  const stroke = variant === 'light' ? SAND : '#FFFFFF';
  const hands = variant === 'light' ? CLAY : FOREST_DEEP;
  return (
    <svg viewBox='0 0 64 64' aria-hidden='true' className={cn('size-8 shrink-0', className)}>
      <rect width='64' height='64' rx='16' fill={box} />
      <path d='M22 12 V42' stroke={stroke} strokeWidth='5' strokeLinecap='round' />
      <circle cx='33' cy='40' r='11' fill='none' stroke={stroke} strokeWidth='5' />
      <path d='M33 40 L33 34 M33 40 L37.5 42.5' stroke={hands} strokeWidth='3' strokeLinecap='round' />
      <circle cx='46' cy='18' r='4' fill={variant === 'light' ? MUSTARD : SAND} />
    </svg>
  );
}

/** Marca completa: monograma + "Balance" y, opcionalmente, el subtítulo. */
export function Logo({
  variant = 'light',
  showTagline = true,
  className,
}: {
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark variant={variant} />
      <span className='grid leading-none'>
        <span className='font-heading text-xl font-semibold tracking-tight'>Balance</span>
        {showTagline && (
          <span
            className={cn(
              'mt-1 text-[0.65rem] font-medium uppercase tracking-[0.12em]',
              variant === 'light' ? 'text-muted-foreground' : 'text-sidebar-foreground/70'
            )}
          >
            Banco de horas
          </span>
        )}
      </span>
    </span>
  );
}
