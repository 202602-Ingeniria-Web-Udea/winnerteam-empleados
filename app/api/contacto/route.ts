import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactSchema, firstIssue } from '@/lib/validation';

/** Guarda una solicitud "Hablar con ventas". Es pública: no requiere sesión. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { name, company, email, teamSize, plan, message } = parsed.data;

  try {
    await prisma.contactRequest.create({
      data: { name, company, email: email.toLowerCase(), teamSize, plan, message: message || null },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Error al guardar la solicitud de contacto', error);
    return NextResponse.json({ error: 'No fue posible enviar la solicitud' }, { status: 500 });
  }
}
