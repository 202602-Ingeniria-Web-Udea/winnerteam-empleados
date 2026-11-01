// Motivos con los que se justifica cada movimiento del banco de horas.
// Mismos valores que el enum Enum_MovementReason de prisma/schema.prisma.
import type { MovementType } from '@/lib/balance';

export const MOVEMENT_REASONS = [
  { value: 'HORAS_EXTRA', label: 'Horas extra', type: 'ENTRADA' },
  { value: 'TURNO_SABADO', label: 'Turno de sábado', type: 'ENTRADA' },
  { value: 'FESTIVO_TRABAJADO', label: 'Festivo trabajado', type: 'ENTRADA' },
  { value: 'PERMISO', label: 'Permiso', type: 'SALIDA' },
  { value: 'CITA_MEDICA', label: 'Cita médica', type: 'SALIDA' },
  { value: 'DIA_COMPENSATORIO', label: 'Día compensatorio', type: 'SALIDA' },
  { value: 'OTRO', label: 'Otro', type: 'AMBOS' },
  // Lo asigna el sistema al crear un empleado con saldo; no se elige en el formulario.
  { value: 'SALDO_INICIAL', label: 'Saldo inicial', type: 'SISTEMA' },
] as const;

export type MovementReason = (typeof MOVEMENT_REASONS)[number]['value'];
export const REASON_VALUES = MOVEMENT_REASONS.map((r) => r.value) as [MovementReason, ...MovementReason[]];

/** Motivos que se pueden elegir para un tipo de movimiento, en el orden del formulario. */
export function reasonsFor(type: MovementType) {
  const own = MOVEMENT_REASONS.filter((reason) => reason.type === type);
  return [...own, MOVEMENT_REASONS.find((reason) => reason.value === 'OTRO')!];
}

export function isReasonValidFor(type: MovementType, reason: string): boolean {
  return reasonsFor(type).some((option) => option.value === reason);
}

export function reasonLabel(reason: MovementReason): string {
  return MOVEMENT_REASONS.find((option) => option.value === reason)?.label ?? reason;
}
