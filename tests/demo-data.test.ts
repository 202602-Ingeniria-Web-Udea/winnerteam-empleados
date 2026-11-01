import { describe, expect, it } from 'vitest';
import { generateDemoData, HOLIDAYS_2026 } from '@/prisma/demo-data';
import { BUSINESS_TIME_ZONE } from '@/lib/balance';
import { isReasonValidFor } from '@/lib/reasons';

const NOW = new Date('2026-11-01T17:00:00Z'); // domingo 1 de noviembre, 12:00 en Bogotá
const data = generateDemoData(NOW);

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { timeZone: BUSINESS_TIME_ZONE, weekday: 'short' });
const hourFormatter = new Intl.DateTimeFormat('en-US', { timeZone: BUSINESS_TIME_ZONE, hour: 'numeric', hourCycle: 'h23' });

describe('generateDemoData', () => {
  it('genera unos 60 empleados con nombres únicos', () => {
    expect(data.employees).toHaveLength(60);
    expect(new Set(data.employees.map((e) => e.name)).size).toBe(60);
  });

  it('es determinista para la misma fecha', () => {
    expect(generateDemoData(NOW)).toEqual(data);
  });

  it('el saldo de cada empleado es la suma de sus movimientos y nunca fue negativo', () => {
    for (const employee of data.employees) {
      let balance = 0;
      for (const m of employee.movements) {
        balance += m.type === 'ENTRADA' ? m.quantity : -m.quantity;
        expect(balance, employee.name).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(m.quantity) && m.quantity >= 1).toBe(true);
      }
      expect(employee.balance, employee.name).toBe(balance);
    }
  });

  it('los movimientos están en orden cronológico, después del ingreso y antes de ahora', () => {
    for (const employee of data.employees) {
      let previous = employee.createdAt.getTime();
      for (const m of employee.movements) {
        expect(m.createdAt.getTime()).toBeGreaterThanOrEqual(previous);
        expect(m.createdAt.getTime()).toBeLessThanOrEqual(NOW.getTime());
        previous = m.createdAt.getTime();
      }
    }
  });

  it('se registran en días hábiles (no fines de semana ni festivos) y en horario de oficina', () => {
    for (const employee of data.employees) {
      for (const m of employee.movements) {
        expect(['Sat', 'Sun']).not.toContain(weekdayFormatter.format(m.createdAt));
        expect(HOLIDAYS_2026).not.toContain(dayFormatter.format(m.createdAt));
        const hour = Number(hourFormatter.format(m.createdAt));
        expect(hour).toBeGreaterThanOrEqual(7);
        expect(hour).toBeLessThan(18);
      }
    }
  });

  it('cada movimiento lo registra alguien del equipo que ya tenía usuario en esa fecha', () => {
    const since = new Map(data.staff.map((s) => [s.email, s.createdAt.getTime()]));
    for (const employee of data.employees) {
      for (const m of employee.movements) {
        expect(since.get(m.createdByEmail)!).toBeLessThanOrEqual(m.createdAt.getTime());
      }
    }
  });

  it('cubre unos 6 meses y deja una mezcla realista de saldos', () => {
    const all = data.employees.flatMap((e) => e.movements);
    const first = Math.min(...all.map((m) => m.createdAt.getTime()));
    expect((NOW.getTime() - first) / 86_400_000).toBeGreaterThan(170);
    expect(all.length).toBeGreaterThan(1500);
    const low = data.employees.filter((e) => e.balance < 8).length;
    expect(low).toBeGreaterThanOrEqual(4);
    expect(low).toBeLessThanOrEqual(12);
    expect(data.employees.some((e) => e.balance >= 40)).toBe(true);
    expect(all.some((m) => m.type === 'SALIDA' && m.quantity === 8)).toBe(true); // días compensatorios
  });

  it('el equipo de RR. HH. conserva las credenciales documentadas en el README', () => {
    const emails = data.staff.map((s) => s.email);
    expect(emails).toEqual(expect.arrayContaining(['admin@empresa.com', 'usuario@empresa.com', 'usuario2@empresa.com']));
    expect(data.staff.find((s) => s.email === 'admin@empresa.com')).toMatchObject({ password: 'Admin123*', role: 'ADMIN' });
    expect(data.staff.find((s) => s.email === 'usuario@empresa.com')).toMatchObject({ password: 'Usuario123*', role: 'USER' });
  });

  it('cada empleado fue creado por un administrador activo en esa fecha', () => {
    const admins = new Map(data.staff.filter((s) => s.role === 'ADMIN').map((s) => [s.email, s.createdAt.getTime()]));
    for (const employee of data.employees) {
      expect(admins.get(employee.createdByEmail)!).toBeLessThanOrEqual(employee.createdAt.getTime());
    }
  });

  it('incluye empleados que ingresaron durante el periodo', () => {
    const adoption = Math.min(...data.employees.map((e) => e.createdAt.getTime()));
    expect(data.employees.filter((e) => e.createdAt.getTime() > adoption + 7 * 86_400_000).length).toBeGreaterThanOrEqual(8);
  });

  it('cada movimiento tiene un motivo coherente con su tipo y una descripción', () => {
    for (const employee of data.employees) {
      employee.movements.forEach((m, index) => {
        const isInitial = index === 0 && m.createdAt.getTime() === employee.createdAt.getTime();
        if (isInitial) expect(m.reason).toBe('SALDO_INICIAL');
        else expect(isReasonValidFor(m.type, m.reason), `${m.type} ${m.reason}`).toBe(true);
        expect(m.description.length).toBeGreaterThanOrEqual(3);
        expect(m.description.length).toBeLessThanOrEqual(200);
      });
    }
  });

  it('usa todos los motivos del banco de horas y los compensatorios son de 8 h', () => {
    const all = data.employees.flatMap((e) => e.movements);
    const reasons = new Set(all.map((m) => m.reason));
    for (const reason of ['SALDO_INICIAL', 'HORAS_EXTRA', 'TURNO_SABADO', 'FESTIVO_TRABAJADO', 'PERMISO', 'CITA_MEDICA', 'DIA_COMPENSATORIO']) {
      expect(reasons.has(reason as never), reason).toBe(true);
    }
    expect(all.filter((m) => m.reason === 'DIA_COMPENSATORIO').every((m) => m.quantity === 8)).toBe(true);
    // Las descripciones varían: no es el mismo texto repetido.
    expect(new Set(all.map((m) => m.description)).size).toBeGreaterThan(40);
  });
});
