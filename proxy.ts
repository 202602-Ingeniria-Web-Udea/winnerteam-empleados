import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session-token';

/**
 * Comprobación optimista de sesión antes de renderizar (Next 16: "proxy",
 * antes "middleware"). Solo mira que el token sea válido para redirigir rápido;
 * la autorización real (usuario habilitado, rol) se hace en cada página y
 * endpoint con requireUser/requireAdmin/apiUser/apiAdmin.
 */
export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isLogin = request.nextUrl.pathname === '/login';

  if (!session && !isLogin) return NextResponse.redirect(new URL('/login', request.url));
  if (session && isLogin) return NextResponse.redirect(new URL('/inicio', request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/inicio/:path*', '/transacciones/:path*', '/maestros/:path*', '/usuarios/:path*', '/login'],
};
