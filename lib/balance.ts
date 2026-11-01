// Reglas de dominio del banco de horas. Son funciones puras (sin Prisma ni
// Next) para poder probarlas de forma aislada y reutilizarlas en la API y la UI.

export type MovementType = 'ENTRADA' | 'SALIDA';
export type Role = 'ADMIN' | 'USER';

export const INSUFFICIENT_HOURS_ERROR = 'El empleado no tiene suficientes horas acumuladas';
export const SELF_DEMOTION_ERROR = 'No puedes quitarte el rol de administrador';

// Zona horaria del negocio: define qué "día" le corresponde a cada movimiento.
export const BUSINESS_TIME_ZONE = 'America/Bogota';

/** Convierte una cantidad positiva en su efecto sobre el saldo (+ entrada, − salida). */
export function signedQuantity(type: MovementType, quantity: number): number {
  return type === 'ENTRADA' ? quantity : -quantity;
}

/**
 * Calcula el saldo resultante de aplicar un movimiento.
 * Una SALIDA no puede dejar el saldo en negativo: no se pueden descontar
 * horas que el empleado no ha acumulado.
 */
export function applyMovement(
  balance: number,
  type: MovementType,
  quantity: number
): { ok: true; balance: number } | { ok: false; error: string } {
  const next = balance + signedQuantity(type, quantity);
  if (next < 0) return { ok: false, error: INSUFFICIENT_HOURS_ERROR };
  return { ok: true, balance: next };
}

/**
 * Construye la serie para la gráfica de "saldos diarios": un punto por cada día
 * (en hora de Bogotá) que tenga movimientos, con el saldo acumulado al cierre
 * de ese día. Acepta los movimientos en cualquier orden.
 */
export function buildDailyBalanceSeries(
  movements: { type: MovementType; quantity: number; createdAt: Date }[],
  timeZone: string = BUSINESS_TIME_ZONE
): { date: string; balance: number }[] {
  // 'en-CA' formatea como YYYY-MM-DD, lo que permite ordenar fechas como texto.
  const dayFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const sorted = [...movements].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const series: { date: string; balance: number }[] = [];
  let balance = 0;

  for (const movement of sorted) {
    balance += signedQuantity(movement.type, movement.quantity);
    const date = dayFormatter.format(movement.createdAt);
    const last = series[series.length - 1];
    if (last && last.date === date) last.balance = balance;
    else series.push({ date, balance });
  }

  return series;
}

/**
 * Un administrador no puede quitarse a sí mismo el rol ADMIN; así el sistema
 * nunca se queda sin nadie capaz de gestionar usuarios por accidente.
 */
export function canChangeRole(
  actorId: string,
  targetId: string,
  newRole: Role
): { ok: true } | { ok: false; error: string } {
  if (actorId === targetId && newRole !== 'ADMIN') return { ok: false, error: SELF_DEMOTION_ERROR };
  return { ok: true };
}
