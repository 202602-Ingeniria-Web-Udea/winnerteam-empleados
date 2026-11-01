import { NextRequest, NextResponse } from 'next/server';
import { canChangeRole } from '@/lib/balance';
import { prisma } from '@/lib/prisma';
import { apiAdmin } from '@/lib/session';
import { firstIssue, roleSchema } from '@/lib/validation';

/** Cambia el rol de un usuario. Solo ADMIN. */
export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/usuarios/[id]'>): Promise<NextResponse> {
  const actor = await apiAdmin();
  if (actor instanceof NextResponse) return actor;

  const { id } = await ctx.params;
  const parsed = roleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const check = canChangeRole(actor.id, id, parsed.data.role);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

  try {
    const { count } = await prisma.user.updateMany({
      where: { id, deleted: false },
      data: { role: parsed.data.role },
    });
    if (count === 0) return NextResponse.json({ error: 'El usuario no existe' }, { status: 404 });

    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
      select: { id: true, email: true, role: true }, // nunca devolver el hash de la contraseña
    });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el rol', error);
    return NextResponse.json({ error: 'No fue posible actualizar el rol' }, { status: 500 });
  }
}
