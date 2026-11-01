import { describe, expect, it } from 'vitest';
import { formatDate, formatHours, formatSignedHours, initials, shortId } from '@/lib/format';

describe('formatHours', () => {
  it('agrega la unidad de horas', () => {
    expect(formatHours(12)).toBe('12 h');
    expect(formatHours(0)).toBe('0 h');
  });

  it('usa separador de miles colombiano', () => {
    expect(formatHours(1250)).toBe('1.250 h');
  });
});

describe('formatSignedHours', () => {
  it('muestra el signo según el tipo de movimiento', () => {
    expect(formatSignedHours('ENTRADA', 8)).toBe('+8 h');
    expect(formatSignedHours('SALIDA', 4)).toBe('−4 h');
  });
});

describe('formatDate', () => {
  it('muestra la fecha y hora en Bogotá', () => {
    // 2026-10-31T04:30Z = 30/10/2026 23:30 en Bogotá
    expect(formatDate(new Date('2026-10-31T04:30:00Z'))).toBe('30/10/2026, 23:30');
  });

  it('acepta fechas en texto ISO', () => {
    expect(formatDate('2026-10-29T15:05:00Z')).toBe('29/10/2026, 10:05');
  });
});

describe('initials', () => {
  it('toma la inicial del nombre y del apellido', () => {
    expect(initials('Laura', 'Restrepo')).toBe('LR');
  });

  it('usa las dos primeras palabras si no hay apellido', () => {
    expect(initials('Ana María Gómez')).toBe('AM');
    expect(initials('andrés', null)).toBe('A');
  });
});

describe('shortId', () => {
  it('muestra los últimos 8 caracteres, que son los que varían entre cuids', () => {
    expect(shortId('cmvy44ou0001abcdefgh')).toBe('abcdefgh');
    expect(shortId('abc')).toBe('abc');
  });
});
