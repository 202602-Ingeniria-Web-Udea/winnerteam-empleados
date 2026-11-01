import { NextRequest, NextResponse } from 'next/server';
import { INSUFFICIENT_HOURS_ERROR } from '@/lib/balance';
import { prisma } from '@/lib/prisma';
import { apiUser } from '@/lib/session';
import { firstIssue, movementSchema } from '@/lib/validation';

const NOT_FOUND = 'El empleado no existe';

// Errores de negocio que se lanzan dentro de la transacción para abortarla.
class MovementError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** Registra un movimiento de horas. ADMIN y USER pueden hacerlo. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await apiUser();
  if (user instanceof NextResponse) return user;

  const parsed = movementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { employeeId, type, quantity, reason, description } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (type === 'SALIDA') {
        // Decremento condicional en una sola sentencia: solo descuenta si el
        // saldo alcanza. Así dos salidas simultáneas no pueden dejar el saldo
        // en negativo (leer y luego escribir sí permitiría esa carrera).
        const { count } = await tx.employee.updateMany({
          where: { id: employeeId, balance: { gte: quantity } },
          data: { balance: { decrement: quantity } },
        });
        if (count === 0) {
          const exists = await tx.employee.count({ where: { id: employeeId } });
          throw exists
            ? new MovementError(INSUFFICIENT_HOURS_ERROR, 400)
            : new MovementError(NOT_FOUND, 404);
        }
      } else {
        const { count } = await tx.employee.updateMany({
          where: { id: employeeId },
          data: { balance: { increment: quantity } },
        });
        if (count === 0) throw new MovementError(NOT_FOUND, 404);
      }

      const movement = await tx.hourMovement.create({
        data: { type, quantity, reason, description, employeeId, createdById: user.id },
      });
      const { balance } = await tx.employee.findUniqueOrThrow({
        where: { id: employeeId },
        select: { balance: true },
      });
      return { movement, balance };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof MovementError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error al registrar el movimiento', error);
    return NextResponse.json({ error: 'No fue posible registrar el movimiento' }, { status: 500 });
  }
}
