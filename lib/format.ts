// Formateo para la interfaz (español de Colombia, hora de Bogotá).
import { BUSINESS_TIME_ZONE, type MovementType } from '@/lib/balance';

const numberFormatter = new Intl.NumberFormat('es-CO');

// Se arma a mano a partir de las partes para obtener siempre "dd/mm/aaaa, hh:mm"
// sin depender de las variaciones de formato entre versiones de ICU.
const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function formatHours(hours: number): string {
  return `${numberFormatter.format(hours)} h`;
}

/** "+8 h" para entradas y "−4 h" (signo menos tipográfico) para salidas. */
export function formatSignedHours(type: MovementType, quantity: number): string {
  return `${type === 'ENTRADA' ? '+' : '−'}${formatHours(quantity)}`;
}

export function formatDate(date: Date | string): string {
  const parts = Object.fromEntries(
    dateTimeFormatter.formatToParts(new Date(date)).map((part) => [part.type, part.value])
  );
  return `${parts.day}/${parts.month}/${parts.year}, ${parts.hour}:${parts.minute}`;
}

/** Iniciales para el avatar cuando el usuario no tiene foto. */
export function initials(name: string, lastName?: string | null): string {
  const words = [...name.trim().split(/\s+/), ...(lastName ? [lastName.trim()] : [])].filter(Boolean);
  const picked = lastName ? [words[0], words[words.length - 1]] : words.slice(0, 2);
  return picked.map((word) => word[0].toUpperCase()).join('');
}

/**
 * Versión corta de un id para las tablas. Los cuid empiezan con una marca de
 * tiempo, así que el inicio se repite entre registros cercanos; el final no.
 */
export function shortId(id: string): string {
  return id.slice(-8);
}
