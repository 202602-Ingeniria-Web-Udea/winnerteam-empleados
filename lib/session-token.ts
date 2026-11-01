// Firma y verificación del JWT de sesión. No depende de Prisma ni de
// next/headers para poder usarse desde proxy.ts y desde las pruebas.
import { jwtVerify, SignJWT } from 'jose';
import type { Role } from '@/lib/balance';

export const SESSION_COOKIE = 'session';
// 3 días, en segundos (formato que usa la cookie).
export const SESSION_MAX_AGE = 60 * 60 * 24 * 3;

export type SessionPayload = { userId: string; role: Role };

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('Falta la variable de entorno SESSION_SECRET');
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

/**
 * Devuelve el contenido de la sesión o null si el token falta, está vencido,
 * fue manipulado o tiene un formato inesperado. Nunca lanza: para quien la
 * llama, cualquier token inválido equivale a "no hay sesión".
 */
export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] });
    if (!payload.sub || (payload.role !== 'ADMIN' && payload.role !== 'USER')) return null;
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}
