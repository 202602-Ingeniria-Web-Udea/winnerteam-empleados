import { describe, expect, it } from 'vitest';
import { contactSchema } from '@/lib/validation';

const valid = {
  name: 'Laura Restrepo',
  company: 'Confecciones Andinas S. A. S.',
  email: 'laura@andinas.com',
  teamSize: '26-100',
  plan: 'PROFESIONAL',
  message: 'Queremos probarlo en la planta de Itagüí.',
  website: '',
};

describe('contactSchema', () => {
  it('acepta una solicitud completa y recorta espacios', () => {
    const result = contactSchema.safeParse({ ...valid, name: '  Laura Restrepo ' });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Laura Restrepo');
  });

  it('el mensaje es opcional', () => {
    expect(contactSchema.safeParse({ ...valid, message: '' }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, message: undefined }).success).toBe(true);
  });

  it.each([
    ['name', 'L', 'Escribe tu nombre (mínimo 2 caracteres)'],
    ['company', '', 'Escribe el nombre de tu empresa'],
    ['email', 'laura@', 'Ingresa un correo electrónico válido'],
    ['teamSize', '3', 'Selecciona el tamaño de tu equipo'],
    ['plan', 'GRATIS', 'Selecciona un plan'],
  ])('rechaza %s inválido', (field, value, message) => {
    const result = contactSchema.safeParse({ ...valid, [field]: value });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(message);
  });

  it('limita el mensaje a 500 caracteres', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'x'.repeat(501) }).success).toBe(false);
  });

  it('rechaza envíos automáticos que llenan el campo trampa', () => {
    expect(contactSchema.safeParse({ ...valid, website: 'http://spam.example' }).success).toBe(false);
  });
});
