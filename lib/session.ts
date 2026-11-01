// Sesión del usuario en el servidor: lectura de la cookie, carga del usuario y
// guardas de autorización para páginas (redirigen) y para la API (responden 401/403).
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Role } from '@/lib/balance';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSessionToken,
  verifySessionToken,
} from '@/lib/session-token';

export { SESSION_COOKIE, SESSION_MAX_AGE, signSessionToken, verifySessionToken };

export type CurrentUser = {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
  role: Role;
  image: string | null;
};

/**
 * Usuario de la sesión actual o null. El rol se lee de la base de datos y no
 * del token, así un cambio de rol o una deshabilitación aplican de inmediato.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findFirst({
    where: { id: session.userId, enabled: true, deleted: false },
    select: { id: true, name: true, lastName: true, email: true, role: true, profile: { select: { image: true } } },
  });
  if (!user) return null;

  const { profile, ...rest } = user;
  return { ...rest, image: profile?.image ?? null };
}

/** Para páginas del panel: exige sesión o redirige al login. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    // Si queda una cookie (usuario deshabilitado), hay que borrarla antes de ir
    // al login; una página no puede modificar cookies, el route handler sí.
    const hasCookie = (await cookies()).has(SESSION_COOKIE);
    redirect(hasCookie ? '/api/auth/logout' : '/login');
  }
  return user;
}

/** Para páginas solo de administrador: un USER es enviado al inicio. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== 'ADMIN') redirect('/inicio');
  return user;
}

/** Para route handlers: devuelve el usuario o una respuesta 401 lista para retornar. */
export async function apiUser(): Promise<CurrentUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 });
  return user;
}

/** Para route handlers solo de administrador: 401 sin sesión, 403 si no es ADMIN. */
export async function apiAdmin(): Promise<CurrentUser | NextResponse> {
  const user = await apiUser();
  if (user instanceof NextResponse) return user;
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No tienes permisos para realizar esta acción' }, { status: 403 });
  }
  return user;
}

/** Guarda el token de sesión en una cookie httpOnly (inaccesible desde JavaScript). */
export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}
