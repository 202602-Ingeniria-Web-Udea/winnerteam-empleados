import { describe, expect, it } from 'vitest';
import { isReasonValidFor, reasonLabel, reasonsFor } from '@/lib/reasons';

describe('motivos de movimiento', () => {
  it('ofrece los motivos de entrada en el formulario', () => {
    expect(reasonsFor('ENTRADA').map((r) => r.value)).toEqual(['HORAS_EXTRA', 'TURNO_SABADO', 'FESTIVO_TRABAJADO', 'OTRO']);
  });

  it('ofrece los motivos de salida en el formulario', () => {
    expect(reasonsFor('SALIDA').map((r) => r.value)).toEqual(['PERMISO', 'CITA_MEDICA', 'DIA_COMPENSATORIO', 'OTRO']);
  });

  it('valida que el motivo corresponda al tipo', () => {
    expect(isReasonValidFor('ENTRADA', 'TURNO_SABADO')).toBe(true);
    expect(isReasonValidFor('ENTRADA', 'CITA_MEDICA')).toBe(false);
    expect(isReasonValidFor('SALIDA', 'DIA_COMPENSATORIO')).toBe(true);
    expect(isReasonValidFor('SALIDA', 'HORAS_EXTRA')).toBe(false);
    expect(isReasonValidFor('SALIDA', 'OTRO')).toBe(true);
  });

  it('el saldo inicial solo lo asigna el sistema, no se elige en el formulario', () => {
    expect(isReasonValidFor('ENTRADA', 'SALDO_INICIAL')).toBe(false);
    expect(reasonLabel('SALDO_INICIAL')).toBe('Saldo inicial');
  });

  it('tiene etiquetas en español', () => {
    expect(reasonLabel('FESTIVO_TRABAJADO')).toBe('Festivo trabajado');
    expect(reasonLabel('CITA_MEDICA')).toBe('Cita médica');
    expect(reasonLabel('DIA_COMPENSATORIO')).toBe('Día compensatorio');
  });
});
