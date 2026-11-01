import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

// POST: cierre de sesión desde el menú del usuario.
export async function POST(): Promise<NextResponse> {
  await clearSessionCookie();
  return NextResponse.json({ ok: true }, { status: 200 });
}

// GET: usado por requireUser cuando la cookie es válida pero el usuario ya no
// (deshabilitado o eliminado). Borra la cookie y lleva al login; sin esto,
// proxy.ts y la página se redirigirían mutuamente en bucle.
export async function GET(request: NextRequest): Promise<NextResponse> {
  await clearSessionCookie();
  return NextResponse.redirect(new URL('/login', request.url));
}
