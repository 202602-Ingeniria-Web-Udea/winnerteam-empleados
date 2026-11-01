// Carga la empresa de demostración (prisma/demo-data.ts): equipo de RR. HH.,
// 60 empleados y ~6 meses de movimientos que terminan hoy.
//
// ATENCIÓN: reemplaza TODOS los empleados y movimientos de la base. Los
// usuarios se actualizan por correo (upsert), así sus credenciales siguen
// funcionando.
import bcrypt from 'bcryptjs';
import { normalizeSearch } from '../lib/list-params';
import { prisma } from '../lib/prisma';
import { generateDemoData } from './demo-data';

async function main() {
  const { staff, employees } = generateDemoData(new Date());

  const userIds = new Map<string, string>();
  for (const [index, member] of staff.entries()) {
    const password = await bcrypt.hash(member.password, 10);
    const data = {
      password,
      name: member.name,
      lastName: member.lastName,
      role: member.role,
      enabled: true,
      deleted: false,
      createdAt: member.createdAt,
    };
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: data,
      create: { email: member.email, ...data },
    });
    const profile = {
      address: `Calle ${10 + index} # ${20 + index}-${30 + index}, Medellín`,
      phone: `300 555 00${10 + index}`,
      image: `https://i.pravatar.cc/150?u=${member.email}`,
    };
    await prisma.profile.upsert({ where: { userId: user.id }, update: profile, create: { ...profile, userId: user.id } });
    userIds.set(member.email, user.id);
  }

  await prisma.hourMovement.deleteMany();
  await prisma.employee.deleteMany();

  for (const employee of employees) {
    const created = await prisma.employee.create({
      data: {
        name: employee.name,
        nameSearch: normalizeSearch(employee.name),
        balance: employee.balance,
        createdAt: employee.createdAt,
        createdById: userIds.get(employee.createdByEmail)!,
      },
    });
    await prisma.hourMovement.createMany({
      data: employee.movements.map((movement) => ({
        type: movement.type,
        quantity: movement.quantity,
        createdAt: movement.createdAt,
        employeeId: created.id,
        createdById: userIds.get(movement.createdByEmail)!,
      })),
    });
  }

  const movements = employees.reduce((sum, employee) => sum + employee.movements.length, 0);
  console.log(`Seed listo: ${staff.length} usuarios, ${employees.length} empleados y ${movements} movimientos.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
