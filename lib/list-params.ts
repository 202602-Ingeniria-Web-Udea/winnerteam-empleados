// Lectura de parámetros de URL para listas grandes (búsqueda, paginación,
// orden, filtros) y utilidades relacionadas. Son funciones puras: la URL es la
// fuente de verdad, así los enlaces se pueden compartir y el botón "atrás" funciona.
import { BUSINESS_TIME_ZONE, startOfBusinessDay } from '@/lib/balance';

export const PAGE_SIZE = 20;
const MAX_QUERY_LENGTH = 80;

export type EmployeeSort = 'nombre' | 'saldo-asc' | 'saldo-desc';
export type ChartRange = 30 | 90 | 'todo';
type SearchParams = Record<string, string | string[] | undefined>;

const SORTS: EmployeeSort[] = ['nombre', 'saldo-asc', 'saldo-desc'];

/** Primer valor de un parámetro (Next entrega arreglos si se repite en la URL). */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Página como entero ≥ 1; cualquier otra cosa vuelve a la página 1. */
export function parsePage(value: string | string[] | undefined): number {
  const raw = first(value) ?? '';
  return /^\d+$/.test(raw) && Number(raw) >= 1 ? Number(raw) : 1;
}

export function parseEmployeeListParams(params: SearchParams): {
  q: string;
  page: number;
  sort: EmployeeSort;
  lowBalanceOnly: boolean;
} {
  const sort = first(params.orden) as EmployeeSort | undefined;
  return {
    q: (first(params.q) ?? '').trim().slice(0, MAX_QUERY_LENGTH),
    page: parsePage(params.pagina),
    sort: sort && SORTS.includes(sort) ? sort : 'nombre',
    lowBalanceOnly: first(params.filtro) === 'saldo-bajo',
  };
}

/** Ajusta la página al rango válido y calcula skip/take para Prisma. */
export function paginate(total: number, page: number, pageSize: number = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return { page: current, totalPages, skip: (current - 1) * pageSize, take: pageSize };
}

/** orderBy de Prisma; el nombre desempata para que la paginación sea estable. */
export function employeeOrderBy(sort: EmployeeSort) {
  if (sort === 'saldo-asc') return [{ balance: 'asc' as const }, { name: 'asc' as const }];
  if (sort === 'saldo-desc') return [{ balance: 'desc' as const }, { name: 'asc' as const }];
  return [{ name: 'asc' as const }];
}

export function parseRange(value: string | string[] | undefined): ChartRange {
  const raw = first(value);
  if (raw === '30') return 30;
  if (raw === 'todo') return 'todo';
  return 90;
}

/**
 * Recorta la serie de saldos diarios a los últimos `range` días. Si había
 * movimientos antes del rango, agrega un punto al inicio con el saldo vigente,
 * para que la gráfica no arranque en cero.
 */
export function seriesSince(
  series: { date: string; balance: number }[],
  range: ChartRange,
  now: Date = new Date()
): { date: string; balance: number }[] {
  if (range === 'todo') return series;
  const cutoffInstant = new Date(startOfBusinessDay(now).getTime() - range * 86_400_000);
  const cutoff = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(cutoffInstant);

  const before = series.filter((point) => point.date < cutoff);
  const inRange = series.filter((point) => point.date >= cutoff);
  const carried = before.at(-1);
  if (!carried || inRange[0]?.date === cutoff) return inRange;
  return [{ date: cutoff, balance: carried.balance }, ...inRange];
}

/** URL con los parámetros actuales más los cambios; '' o null eliminan el parámetro. */
export function buildHref(
  pathname: string,
  current: Record<string, string | undefined>,
  changes: Record<string, string | null>
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...current, ...changes })) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * Texto normalizado para búsquedas: minúsculas, sin tildes ni diéresis y sin
 * espacios sobrantes. Se guarda en Employee.nameSearch y se aplica a lo que
 * escribe el usuario, así "rios" encuentra a "Ríos".
 */
export function normalizeSearch(text: string): string {
  // NFD separa cada letra de su tilde (U+0300–U+036F) para poder quitarla.
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}
