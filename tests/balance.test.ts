import { describe, expect, it } from 'vitest';
import {
  applyMovement,
  buildDailyBalanceSeries,
  canChangeRole,
  INSUFFICIENT_HOURS_ERROR,
  SELF_DEMOTION_ERROR,
  signedQuantity,
} from '@/lib/balance';

describe('signedQuantity', () => {
  it('ENTRADA suma y SALIDA resta', () => {
    expect(signedQuantity('ENTRADA', 8)).toBe(8);
    expect(signedQuantity('SALIDA', 4)).toBe(-4);
  });
});

describe('applyMovement', () => {
  it('una ENTRADA aumenta el saldo', () => {
    expect(applyMovement(10, 'ENTRADA', 8)).toEqual({ ok: true, balance: 18 });
  });

  it('una SALIDA puede dejar el saldo exactamente en cero', () => {
    expect(applyMovement(10, 'SALIDA', 10)).toEqual({ ok: true, balance: 0 });
  });

  it('rechaza una SALIDA mayor que el saldo', () => {
    expect(applyMovement(10, 'SALIDA', 11)).toEqual({ ok: false, error: INSUFFICIENT_HOURS_ERROR });
  });
});

describe('buildDailyBalanceSeries', () => {
  it('agrupa por día en hora de Bogotá y acumula el saldo al cierre de cada día', () => {
    const series = buildDailyBalanceSeries([
      // 2026-10-31T04:30Z es 2026-10-30 23:30 en Bogotá
      { type: 'ENTRADA', quantity: 8, createdAt: new Date('2026-10-31T04:30:00Z') },
      { type: 'ENTRADA', quantity: 4, createdAt: new Date('2026-10-29T15:00:00Z') },
      { type: 'SALIDA', quantity: 2, createdAt: new Date('2026-10-31T15:00:00Z') },
    ]);
    expect(series).toEqual([
      { date: '2026-10-29', balance: 4 },
      { date: '2026-10-30', balance: 12 },
      { date: '2026-10-31', balance: 10 },
    ]);
  });

  it('combina varios movimientos del mismo día en un solo punto', () => {
    const series = buildDailyBalanceSeries([
      { type: 'ENTRADA', quantity: 8, createdAt: new Date('2026-10-29T13:00:00Z') },
      { type: 'SALIDA', quantity: 3, createdAt: new Date('2026-10-29T20:00:00Z') },
    ]);
    expect(series).toEqual([{ date: '2026-10-29', balance: 5 }]);
  });

  it('devuelve una serie vacía si no hay movimientos', () => {
    expect(buildDailyBalanceSeries([])).toEqual([]);
  });
});

describe('canChangeRole', () => {
  it('impide que un administrador se quite su propio rol', () => {
    expect(canChangeRole('a', 'a', 'USER')).toEqual({ ok: false, error: SELF_DEMOTION_ERROR });
  });

  it('permite mantener el propio rol de administrador', () => {
    expect(canChangeRole('a', 'a', 'ADMIN')).toEqual({ ok: true });
  });

  it('permite cambiar el rol de otro usuario', () => {
    expect(canChangeRole('a', 'b', 'USER')).toEqual({ ok: true });
  });
});
