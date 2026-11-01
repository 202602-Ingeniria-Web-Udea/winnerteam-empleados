import { describe, expect, it } from 'vitest';
import { employeeSchema, loginSchema, movementSchema, roleSchema } from '@/lib/validation';

// Movimiento válido de referencia; cada prueba cambia un solo campo.
const valid = { employeeId: 'x', type: 'SALIDA', quantity: '4', reason: 'CITA_MEDICA', description: 'Control en la EPS' };

describe('movementSchema', () => {
  it.each([0, -3, 1.5, 'abc', 1001])('rechaza la cantidad %s', (quantity) => {
    expect(movementSchema.safeParse({ ...valid, quantity }).success).toBe(false);
  });

  it('rechaza un tipo de movimiento desconocido', () => {
    expect(movementSchema.safeParse({ ...valid, type: 'OTRO' }).success).toBe(false);
  });

  it('rechaza un movimiento sin empleado', () => {
    expect(movementSchema.safeParse({ ...valid, employeeId: '' }).success).toBe(false);
  });

  it('acepta una cantidad en texto y la convierte a número', () => {
    const result = movementSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ ...valid, quantity: 4 });
  });

  it('exige un motivo', () => {
    const result = movementSchema.safeParse({ ...valid, reason: undefined });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Selecciona el motivo del movimiento');
  });

  it('rechaza un motivo que no corresponde al tipo', () => {
    const result = movementSchema.safeParse({ ...valid, type: 'ENTRADA', reason: 'CITA_MEDICA' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('El motivo no corresponde al tipo de movimiento');
  });

  it('no permite elegir "Saldo inicial" desde el formulario', () => {
    expect(movementSchema.safeParse({ ...valid, type: 'ENTRADA', reason: 'SALDO_INICIAL' }).success).toBe(false);
  });

  it.each(['', '  ', 'ab'])('exige una descripción de al menos 3 caracteres (%j)', (description) => {
    const result = movementSchema.safeParse({ ...valid, description });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Describe el movimiento (mínimo 3 caracteres)');
  });

  it('limita la descripción a 200 caracteres y recorta espacios', () => {
    expect(movementSchema.safeParse({ ...valid, description: 'x'.repeat(201) }).success).toBe(false);
    expect(movementSchema.safeParse({ ...valid, description: '  Control en la EPS  ' }).data?.description).toBe('Control en la EPS');
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

describe('cuerpo que no es un objeto', () => {
  it.each([
    ['loginSchema', loginSchema],
    ['employeeSchema', employeeSchema],
    ['movementSchema', movementSchema],
    ['roleSchema', roleSchema],
  ])('%s responde en español', (_name, schema) => {
    const result = schema.safeParse(null);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Datos inválidos');
  });
});

describe('campos faltantes', () => {
  it.each([
    ['movementSchema', movementSchema],
    ['employeeSchema', employeeSchema],
    ['loginSchema', loginSchema],
    ['roleSchema', roleSchema],
  ])('%s no responde en inglés cuando el cuerpo viene vacío', (_name, schema) => {
    const result = schema.safeParse({});
    expect(result.success).toBe(false);
    for (const issue of result.error!.issues) expect(issue.message).not.toMatch(/Invalid|expected|received/i);
  });
});
