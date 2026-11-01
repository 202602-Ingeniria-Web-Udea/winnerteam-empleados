import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie, signSessionToken } from '@/lib/session';
import { firstIssue, loginSchema } from '@/lib/validation';

// Mismo mensaje para correo inexistente y contraseña errada: no revelamos
// qué correos están registrados.
const INVALID_CREDENTIALS = 'Correo o contraseña incorrectos';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: parsed.data.email.toLowerCase(), enabled: true, deleted: false },
      select: { id: true, role: true, password: true },
    });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    await setSessionCookie(await signSessionToken({ userId: user.id, role: user.role }));
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Error al iniciar sesión', error);
    return NextResponse.json({ error: 'No fue posible iniciar sesión' }, { status: 500 });
  }
}
