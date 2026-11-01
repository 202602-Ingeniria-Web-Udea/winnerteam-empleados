import { describe, expect, it } from 'vitest';
import {
  buildHref,
  employeeOrderBy,
  normalizeSearch,
  paginate,
  parseEmployeeListParams,
  parseRange,
  seriesSince,
} from '@/lib/list-params';

describe('parseEmployeeListParams', () => {
  it('usa valores por defecto si no hay parámetros', () => {
    expect(parseEmployeeListParams({})).toEqual({ q: '', page: 1, sort: 'nombre', lowBalanceOnly: false });
  });

  it('lee búsqueda, página, orden y filtro de saldo bajo', () => {
    expect(
      parseEmployeeListParams({ q: '  Ríos ', pagina: '3', orden: 'saldo-desc', filtro: 'saldo-bajo' })
    ).toEqual({ q: 'Ríos', page: 3, sort: 'saldo-desc', lowBalanceOnly: true });
  });

  it('ignora valores inválidos o repetidos', () => {
    expect(parseEmployeeListParams({ pagina: '-2', orden: 'hackeo', filtro: 'otro', q: ['a', 'b'] })).toEqual({
      q: 'a',
      page: 1,
      sort: 'nombre',
      lowBalanceOnly: false,
    });
    expect(parseEmployeeListParams({ pagina: 'abc' }).page).toBe(1);
    expect(parseEmployeeListParams({ pagina: '2.5' }).page).toBe(1);
  });

  it('limita la búsqueda a 80 caracteres', () => {
    expect(parseEmployeeListParams({ q: 'x'.repeat(200) }).q).toHaveLength(80);
  });
});

describe('paginate', () => {
  it('calcula skip y take de la página pedida', () => {
    expect(paginate(508, 3, 20)).toEqual({ page: 3, totalPages: 26, skip: 40, take: 20 });
  });

  it('lleva una página fuera de rango a la última', () => {
    expect(paginate(45, 99, 20)).toEqual({ page: 3, totalPages: 3, skip: 40, take: 20 });
  });

  it('con cero resultados hay una sola página vacía', () => {
    expect(paginate(0, 1, 20)).toEqual({ page: 1, totalPages: 1, skip: 0, take: 20 });
  });
});

describe('employeeOrderBy', () => {
  it('ordena por nombre o por saldo, con el nombre como desempate', () => {
    expect(employeeOrderBy('nombre')).toEqual([{ name: 'asc' }]);
    expect(employeeOrderBy('saldo-asc')).toEqual([{ balance: 'asc' }, { name: 'asc' }]);
    expect(employeeOrderBy('saldo-desc')).toEqual([{ balance: 'desc' }, { name: 'asc' }]);
  });
});

describe('parseRange', () => {
  it('acepta 30, 90 o todo y usa 90 días por defecto', () => {
    expect(parseRange('30')).toBe(30);
    expect(parseRange('todo')).toBe('todo');
    expect(parseRange(undefined)).toBe(90);
    expect(parseRange('7')).toBe(90);
  });
});

describe('seriesSince', () => {
  const series = [
    { date: '2026-07-01', balance: 10 },
    { date: '2026-09-15', balance: 25 },
    { date: '2026-10-20', balance: 18 },
  ];

  it('conserva toda la serie con el rango "todo"', () => {
    expect(seriesSince(series, 'todo', new Date('2026-11-01T15:00:00Z'))).toEqual(series);
  });

  it('recorta al rango y arranca en el saldo que había al inicio del rango', () => {
    // 30 días antes del 2026-11-01 (Bogotá) es 2026-10-02; el saldo vigente ese día era 25.
    expect(seriesSince(series, 30, new Date('2026-11-01T15:00:00Z'))).toEqual([
      { date: '2026-10-02', balance: 25 },
      { date: '2026-10-20', balance: 18 },
    ]);
  });

  it('no agrega punto inicial si no había movimientos antes del rango', () => {
    expect(seriesSince([{ date: '2026-10-20', balance: 5 }], 30, new Date('2026-11-01T15:00:00Z'))).toEqual([
      { date: '2026-10-20', balance: 5 },
    ]);
  });
});

describe('buildHref', () => {
  it('conserva los parámetros actuales y aplica los cambios', () => {
    expect(buildHref('/maestros', { q: 'ana', pagina: '2', orden: 'nombre' }, { pagina: '3' })).toBe(
      '/maestros?q=ana&pagina=3&orden=nombre'
    );
  });

  it('elimina los parámetros vacíos o en null', () => {
    expect(buildHref('/maestros', { q: 'ana', pagina: '2' }, { q: '', pagina: null })).toBe('/maestros');
  });
});

describe('normalizeSearch', () => {
  it('quita tildes, diéresis y mayúsculas para buscar como lo escribe la gente', () => {
    expect(normalizeSearch('Valentina Ríos')).toBe('valentina rios');
    expect(normalizeSearch('  MUÑOZ Güiza ')).toBe('munoz guiza');
    expect(normalizeSearch('José')).toBe(normalizeSearch('jose'));
  });
});
