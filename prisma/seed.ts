// Datos de demostración: 1 ADMIN, 2 USER, 5 empleados con ~30 días de movimientos.
// Es idempotente: los usuarios se hacen upsert por correo y los empleados demo
// se borran y recrean en cada ejecución.
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

const users = [
  { email: 'admin@empresa.com', password: 'Admin123*', name: 'Laura', lastName: 'Restrepo', role: 'ADMIN' as const },
  { email: 'usuario@empresa.com', password: 'Usuario123*', name: 'Andrés', lastName: 'Mejía', role: 'USER' as const },
  { email: 'usuario2@empresa.com', password: 'Usuario123*', name: 'Camila', lastName: 'Ortiz', role: 'USER' as const },
];

const employeeNames = [
  'Ana María Gómez',
  'Luis Fernando Pérez',
  'Valentina Ríos',
  'Santiago Herrera',
  'Juliana Castaño',
];

// Generador pseudoaleatorio con semilla fija para que el seed sea reproducible.
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

async function main() {
  const createdUsers = [];
  for (const [index, u] of users.entries()) {
    const password = await bcrypt.hash(u.password, 10);
    const profile = {
      address: `Calle ${10 + index} # ${20 + index}-${30 + index}, Medellín`,
      phone: `300 555 00${10 + index}`,
      image: `https://i.pravatar.cc/150?u=${u.email}`,
    };
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password, name: u.name, lastName: u.lastName, role: u.role, enabled: true, deleted: false },
      create: { email: u.email, password, name: u.name, lastName: u.lastName, role: u.role },
    });
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: profile,
      create: { ...profile, userId: user.id },
    });
    createdUsers.push(user);
  }

  const admin = createdUsers[0];

  await prisma.hourMovement.deleteMany({ where: { employee: { name: { in: employeeNames } } } });
  await prisma.employee.deleteMany({ where: { name: { in: employeeNames } } });

  const random = seededRandom(42);
  const now = new Date();

  for (const name of employeeNames) {
    const movements: { type: 'ENTRADA' | 'SALIDA'; quantity: number; createdAt: Date; createdById: string }[] = [];
    const initial = 8 + Math.floor(random() * 32);
    let balance = initial;
    movements.push({ type: 'ENTRADA', quantity: initial, createdAt: daysAgo(now, 30, 8), createdById: admin.id });

    const count = 10 + Math.floor(random() * 11);
    for (let i = 0; i < count; i++) {
      const day = 29 - Math.floor((i * 29) / count);
      const responsible = createdUsers[Math.floor(random() * createdUsers.length)];
      const wantsSalida = random() < 0.35;
      const quantity = 1 + Math.floor(random() * 8);
      // Una SALIDA nunca puede dejar el saldo en negativo (misma regla que la API).
      const type = wantsSalida && quantity <= balance ? 'SALIDA' : 'ENTRADA';
      balance += type === 'ENTRADA' ? quantity : -quantity;
      movements.push({ type, quantity, createdAt: daysAgo(now, day, 9 + Math.floor(random() * 9)), createdById: responsible.id });
    }

    await prisma.employee.create({
      data: {
        name,
        balance,
        createdById: admin.id,
        createdAt: movements[0].createdAt,
        movements: { create: movements },
      },
    });
  }

  console.log(`Seed listo: ${createdUsers.length} usuarios y ${employeeNames.length} empleados.`);
}

function daysAgo(from: Date, days: number, hour: number) {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
