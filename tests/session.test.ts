import { SignJWT } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { signSessionToken, verifySessionToken } from '@/lib/session-token';

const SECRET = 'clave-de-prueba-con-mas-de-32-caracteres!!';

beforeAll(() => {
  process.env.SESSION_SECRET = SECRET;
});

describe('verifySessionToken', () => {
  it('recupera el usuario y el rol de un token firmado', async () => {
    const token = await signSessionToken({ userId: 'u1', role: 'ADMIN' });
    expect(await verifySessionToken(token)).toEqual({ userId: 'u1', role: 'ADMIN' });
  });

  it('rechaza un token manipulado', async () => {
    const token = await signSessionToken({ userId: 'u1', role: 'USER' });
    const tampered = token.slice(0, -2) + (token.endsWith('xx') ? 'yy' : 'xx');
    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it('rechaza un token vencido', async () => {
    const expired = await new SignJWT({ role: 'ADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('u1')
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(new TextEncoder().encode(SECRET));
    expect(await verifySessionToken(expired)).toBeNull();
  });

  it('rechaza un token firmado con otra clave', async () => {
    const foreign = await new SignJWT({ role: 'ADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('u1')
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode('otra-clave-distinta-de-mas-de-32-caracteres'));
    expect(await verifySessionToken(foreign)).toBeNull();
  });

  it('rechaza un token con un rol desconocido', async () => {
    const weird = await new SignJWT({ role: 'ROOT' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('u1')
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(SECRET));
    expect(await verifySessionToken(weird)).toBeNull();
  });

  it('devuelve null sin token o con basura', async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken('basura')).toBeNull();
  });
});
