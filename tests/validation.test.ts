import { describe, expect, it } from 'vitest';
import { employeeSchema, loginSchema, movementSchema, roleSchema } from '@/lib/validation';

describe('movementSchema', () => {
  it.each([0, -3, 1.5, 'abc', 1001])('rechaza la cantidad %s', (quantity) => {
    expect(movementSchema.safeParse({ employeeId: 'x', type: 'ENTRADA', quantity }).success).toBe(false);
  });

  it('rechaza un tipo de movimiento desconocido', () => {
    expect(movementSchema.safeParse({ employeeId: 'x', type: 'OTRO', quantity: 2 }).success).toBe(false);
  });

  it('rechaza un movimiento sin empleado', () => {
    expect(movementSchema.safeParse({ employeeId: '', type: 'ENTRADA', quantity: 2 }).success).toBe(false);
  });

  it('acepta una cantidad en texto y la convierte a número', () => {
    const result = movementSchema.safeParse({ employeeId: 'x', type: 'SALIDA', quantity: '4' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ employeeId: 'x', type: 'SALIDA', quantity: 4 });
  });
});

describe('employeeSchema', () => {
  it('rechaza un nombre de un solo carácter', () => {
    expect(employeeSchema.safeParse({ name: 'A', initialBalance: 0 }).success).toBe(false);
  });

  it('rechaza un saldo inicial negativo', () => {
    expect(employeeSchema.safeParse({ name: 'Ana Gómez', initialBalance: -1 }).success).toBe(false);
  });

  it('rechaza un saldo inicial mayor que 10000', () => {
    expect(employeeSchema.safeParse({ name: 'Ana Gómez', initialBalance: 10001 }).success).toBe(false);
  });

  it('acepta un empleado con saldo inicial cero y recorta espacios del nombre', () => {
    const result = employeeSchema.safeParse({ name: '  Ana Gómez ', initialBalance: 0 });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'Ana Gómez', initialBalance: 0 });
  });
});

describe('loginSchema', () => {
  it('rechaza un correo inválido', () => {
    expect(loginSchema.safeParse({ email: 'no-es-correo', password: 'x' }).success).toBe(false);
  });

  it('rechaza una contraseña vacía', () => {
    expect(loginSchema.safeParse({ email: 'admin@empresa.com', password: '' }).success).toBe(false);
  });

  it('acepta credenciales bien formadas', () => {
    expect(loginSchema.safeParse({ email: 'admin@empresa.com', password: 'Admin123*' }).success).toBe(true);
  });
});

describe('roleSchema', () => {
  it('acepta solo ADMIN o USER', () => {
    expect(roleSchema.safeParse({ role: 'ADMIN' }).success).toBe(true);
    expect(roleSchema.safeParse({ role: 'SUPERADMIN' }).success).toBe(false);
  });
});
