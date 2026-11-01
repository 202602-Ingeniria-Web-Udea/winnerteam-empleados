import { NextRequest, NextResponse } from 'next/server';
import { normalizeSearch } from '@/lib/list-params';
import { prisma } from '@/lib/prisma';
import { apiAdmin } from '@/lib/session';
import { employeeSchema, firstIssue } from '@/lib/validation';

/** Crea un empleado (maestro). Solo ADMIN. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await apiAdmin();
  if (user instanceof NextResponse) return user;

  const parsed = employeeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { name, initialBalance } = parsed.data;

  try {
    // El saldo inicial se registra también como un movimiento ENTRADA para que
    // el historial y la gráfica de saldos diarios partan del valor correcto.
    const employee = await prisma.$transaction(async (tx) => {
      const created = await tx.employee.create({
        data: { name, nameSearch: normalizeSearch(name), balance: initialBalance, createdById: user.id },
      });
      if (initialBalance > 0) {
        await tx.hourMovement.create({
          data: {
            type: 'ENTRADA',
            quantity: initialBalance,
            reason: 'SALDO_INICIAL',
            description: 'Saldo inicial al registrar al empleado',
            employeeId: created.id,
            createdById: user.id,
          },
        });
      }
      return created;
    });
    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el empleado', error);
    return NextResponse.json({ error: 'No fue posible crear el empleado' }, { status: 500 });
  }
}
