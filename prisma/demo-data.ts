// Generador de la empresa de demostración: 60 empleados con ~6 meses de
// historial coherente. Es una función pura y determinista (misma fecha →
// mismos datos) para poder probarla; prisma/seed.ts la escribe en la base.
//
// Reglas que modelan un banco de horas real:
// - ENTRADA: horas extra entre semana, turnos de sábado y festivos trabajados
//   (estos dos se registran el siguiente día hábil).
// - SALIDA: permisos, citas médicas y días compensatorios, solo si el saldo alcanza.
// - Recursos humanos registra en días hábiles y en horario de oficina.

export type DemoMovement = {
  type: 'ENTRADA' | 'SALIDA';
  quantity: number;
  createdAt: Date;
  createdByEmail: string;
};

export type DemoEmployee = {
  name: string;
  createdAt: Date;
  createdByEmail: string;
  balance: number;
  movements: DemoMovement[];
};

export type DemoStaff = {
  email: string;
  password: string;
  name: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
};

// Festivos de Colombia en 2026 (Ley Emiliani aplicada).
export const HOLIDAYS_2026 = [
  '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03', '2026-05-01',
  '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29', '2026-07-20', '2026-08-07',
  '2026-08-17', '2026-10-12', '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25',
];

type Profile = 'operaciones' | 'contabilidad' | 'comercial' | 'administrativo';

const EMPLOYEES: [string, Profile][] = [
  ['Ana María Gómez Restrepo', 'administrativo'], ['Luis Fernando Pérez Ochoa', 'operaciones'],
  ['Valentina Ríos Cardona', 'comercial'], ['Santiago Herrera Múnera', 'operaciones'],
  ['Juliana Castaño Vélez', 'contabilidad'], ['Carlos Andrés Zapata Gil', 'operaciones'],
  ['Daniela Londoño Arango', 'comercial'], ['Jorge Iván Osorio Ramírez', 'operaciones'],
  ['Mariana Jaramillo Toro', 'administrativo'], ['Felipe Cardona Echeverri', 'comercial'],
  ['Natalia Correa Mesa', 'contabilidad'], ['Andrés Felipe Montoya Duque', 'operaciones'],
  ['Laura Sofía Quintero Ruiz', 'administrativo'], ['Sebastián Salazar Hoyos', 'operaciones'],
  ['Isabella Muñoz Betancur', 'comercial'], ['Camilo Ernesto Vargas López', 'operaciones'],
  ['Paula Andrea Giraldo Ríos', 'administrativo'], ['Esteban Villa Marín', 'operaciones'],
  ['Catalina Agudelo Sánchez', 'contabilidad'], ['Mateo Bedoya Cano', 'operaciones'],
  ['Manuela Rendón Patiño', 'comercial'], ['Juan Pablo Henao Álvarez', 'operaciones'],
  ['Sara Lucía Escobar Uribe', 'administrativo'], ['Alejandro Mejía Posada', 'comercial'],
  ['Luisa Fernanda Arboleda', 'contabilidad'], ['David Santiago Ruiz Mora', 'operaciones'],
  ['María José Tobón Gaviria', 'administrativo'], ['Nicolás Restrepo Lopera', 'operaciones'],
  ['Gabriela Ospina Franco', 'comercial'], ['Julián David Serna Torres', 'operaciones'],
  ['Andrea Carolina Díaz Rojas', 'administrativo'], ['Tomás Echavarría Gallo', 'operaciones'],
  ['Melissa Taborda Quiroz', 'contabilidad'], ['Diego Alejandro Castro Vásquez', 'comercial'],
  ['Verónica Ocampo Zuluaga', 'administrativo'], ['Cristian Camilo Álvarez Pineda', 'operaciones'],
  ['Laura Valentina Moreno Ríos', 'comercial'], ['Óscar Iván Pulgarín Hernández', 'operaciones'],
  ['Diana Marcela Vélez Correa', 'administrativo'], ['Kevin Alexis Usuga Monsalve', 'operaciones'],
  ['Juliana Andrea Marín Gómez', 'contabilidad'], ['Ricardo Antonio Builes Ortiz', 'comercial'],
  ['Carolina Bustamante Mejía', 'administrativo'], ['Brayan Steven Higuita Rúa', 'operaciones'],
  ['Alejandra Sierra Valencia', 'comercial'], ['Hernán Darío Gallego Soto', 'operaciones'],
  ['Mónica Patricia Lopera Jiménez', 'administrativo'], ['Samuel Arango Cuartas', 'operaciones'],
  ['Luciana Pérez Montoya', 'comercial'], ['Johan Sebastián Durango Vélez', 'operaciones'],
  ['Estefanía Gil Restrepo', 'contabilidad'], ['Miguel Ángel Rúa Bedoya', 'operaciones'],
  ['Antonia Velásquez Giraldo', 'administrativo'], ['Emmanuel Cárdenas Ospina', 'comercial'],
  ['Yuliana Montoya Cardona', 'administrativo'], ['Simón Gutiérrez Arias', 'operaciones'],
  ['Mariana Isaza Londoño', 'comercial'], ['Jhon Fredy Holguín Castro', 'operaciones'],
  ['Silvana Echeverri Toro', 'administrativo'], ['Martín Lozano Agudelo', 'comercial'],
];

// Probabilidad diaria de horas extra y rango de horas, por perfil.
const OVERTIME: Record<Profile, { p: number; closeP: number; min: number; max: number }> = {
  operaciones: { p: 0.16, closeP: 0.25, min: 1, max: 3 },
  contabilidad: { p: 0.05, closeP: 0.75, min: 2, max: 4 },
  comercial: { p: 0.07, closeP: 0.45, min: 1, max: 3 },
  administrativo: { p: 0.05, closeP: 0.15, min: 1, max: 2 },
};

const DAY = 86_400_000;
const BOGOTA_OFFSET_HOURS = 5; // Bogotá = UTC−5, sin horario de verano

// Generador pseudoaleatorio con semilla (mulberry32): reproducible.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fecha calendario de Bogotá como 'YYYY-MM-DD'. */
function bogotaDay(date: Date): string {
  return new Date(date.getTime() - BOGOTA_OFFSET_HOURS * 3_600_000).toISOString().slice(0, 10);
}

/** Instante UTC de una hora local de Bogotá en un día dado. */
function at(day: string, hour: number, minute = 0): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hour + BOGOTA_OFFSET_HOURS, minute));
}

function addDays(day: string, n: number): string {
  return new Date(at(day, 12).getTime() + n * DAY).toISOString().slice(0, 10);
}

function weekday(day: string): number {
  return at(day, 12).getUTCDay(); // 0 = domingo
}

function isBusinessDay(day: string): boolean {
  const w = weekday(day);
  return w !== 0 && w !== 6 && !HOLIDAYS_2026.includes(day);
}

function nextBusinessDay(day: string): string {
  let next = addDays(day, 1);
  while (!isBusinessDay(next)) next = addDays(next, 1);
  return next;
}

export function generateDemoData(now: Date = new Date()): { staff: DemoStaff[]; employees: DemoEmployee[] } {
  const random = createRandom(20261101);
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const chance = (p: number) => random() < p;

  // La empresa adoptó Balance ~6 meses antes de hoy, el primer día hábil desde entonces.
  let adoption = bogotaDay(new Date(now.getTime() - 182 * DAY));
  while (!isBusinessDay(adoption)) adoption = addDays(adoption, 1);
  const today = bogotaDay(now);

  // Equipo de recursos humanos que usa el sistema. Ingresan en distintos momentos.
  const staff: DemoStaff[] = [
    { email: 'admin@empresa.com', password: 'Admin123*', name: 'Laura', lastName: 'Restrepo', role: 'ADMIN', createdAt: at(addDays(adoption, -10), 9, 12) },
    { email: 'usuario@empresa.com', password: 'Usuario123*', name: 'Andrés', lastName: 'Mejía', role: 'USER', createdAt: at(addDays(adoption, -3), 10, 40) },
    { email: 'usuario2@empresa.com', password: 'Usuario123*', name: 'Camila', lastName: 'Ortiz', role: 'USER', createdAt: at(nextBusinessDay(addDays(adoption, 40)), 8, 30) },
    { email: 'paula.henao@empresa.com', password: 'Admin123*', name: 'Paula', lastName: 'Henao', role: 'ADMIN', createdAt: at(nextBusinessDay(addDays(adoption, 88)), 11, 5) },
    { email: 'diego.cardenas@empresa.com', password: 'Usuario123*', name: 'Diego', lastName: 'Cárdenas', role: 'USER', createdAt: at(nextBusinessDay(addDays(adoption, 130)), 14, 20) },
  ];
  const activeStaff = (instant: Date, adminsOnly = false) =>
    staff.filter((s) => s.createdAt.getTime() <= instant.getTime() && (!adminsOnly || s.role === 'ADMIN'));
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];

  // Días hábiles del periodo y los 3 últimos de cada mes (cierres).
  const businessDays: string[] = [];
  for (let day = adoption; day < today; day = addDays(day, 1)) if (isBusinessDay(day)) businessDays.push(day);
  const monthClose = new Set<string>();
  for (let i = 0; i < businessDays.length; i++) {
    const month = businessDays[i].slice(0, 7);
    const remaining = businessDays.slice(i).filter((d) => d.slice(0, 7) === month).length;
    if (remaining <= 3) monthClose.add(businessDays[i]);
  }

  // 12 de los 60 ingresan durante el periodo (uno cada ~2 semanas desde el día 20).
  const hiredLater = new Set([7, 13, 19, 24, 30, 36, 41, 45, 49, 53, 56, 59]);

  const employees: DemoEmployee[] = EMPLOYEES.map(([name, profile], index) => {
    const rules = OVERTIME[profile];
    let createdAt: Date;
    let balance = 0;
    const movements: DemoMovement[] = [];

    if (hiredLater.has(index)) {
      const order = [...hiredLater].indexOf(index);
      const hireDay = businessDays[Math.min(20 + order * 9, businessDays.length - 10)];
      createdAt = at(hireDay, int(9, 15), int(0, 59));
    } else {
      // Registro masivo el día de adopción, con las horas que cada uno ya traía.
      createdAt = at(adoption, 8, index * 2);
      const initial = profile === 'operaciones' ? int(6, 34) : int(4, 24);
      if (initial > 0) {
        balance = initial;
        movements.push({ type: 'ENTRADA', quantity: initial, createdAt, createdByEmail: 'admin@empresa.com' });
      }
    }
    const createdByEmail = pick(activeStaff(createdAt, true)).email;
    if (movements[0]) movements[0].createdByEmail = createdByEmail;

    // Turnos de sábado y festivos trabajados, pendientes de registrar el siguiente día hábil.
    const pendingByDay = new Map<string, number[]>();
    for (let day = bogotaDay(createdAt); day < today; day = addDays(day, 1)) {
      if (profile !== 'operaciones') continue;
      const worked = weekday(day) === 6 ? chance(0.26) : HOLIDAYS_2026.includes(day) ? chance(0.35) : false;
      if (worked && day > bogotaDay(createdAt)) {
        const registerOn = nextBusinessDay(day);
        if (registerOn < today) {
          pendingByDay.set(registerOn, [...(pendingByDay.get(registerOn) ?? []), weekday(day) === 6 ? int(4, 8) : 8]);
        }
      }
    }

    for (const day of businessDays) {
      if (day <= bogotaDay(createdAt)) continue;
      const events: { type: 'ENTRADA' | 'SALIDA'; quantity: number; hour: number }[] = [];

      for (const hours of pendingByDay.get(day) ?? []) events.push({ type: 'ENTRADA', quantity: hours, hour: int(7, 9) });
      if (chance(monthClose.has(day) ? rules.closeP : rules.p)) {
        events.push({ type: 'ENTRADA', quantity: int(rules.min, monthClose.has(day) ? rules.max + 1 : rules.max), hour: int(15, 17) });
      }
      // Salidas: con más saldo, más probable que tome tiempo compensatorio.
      const compensatory = balance >= 50 ? 0.14 : balance >= 30 ? 0.05 : balance >= 14 ? 0.02 : 0;
      if (chance(compensatory)) events.push({ type: 'SALIDA', quantity: 8, hour: int(8, 11) });
      // Con pocas horas a favor, el empleado pide menos permisos.
      else if (chance(balance < 8 ? 0.008 : 0.028)) events.push({ type: 'SALIDA', quantity: int(2, 4), hour: int(8, 16) });
      else if (chance(0.012)) events.push({ type: 'SALIDA', quantity: int(2, 3), hour: int(7, 12) });

      events.sort((a, b) => a.hour - b.hour);
      for (const event of events) {
        if (event.type === 'SALIDA' && event.quantity > balance) continue; // nunca saldo negativo
        const createdAtMovement = at(day, event.hour, int(0, 59));
        balance += event.type === 'ENTRADA' ? event.quantity : -event.quantity;
        movements.push({
          type: event.type,
          quantity: event.quantity,
          createdAt: createdAtMovement,
          createdByEmail: pick(activeStaff(createdAtMovement)).email,
        });
      }
    }

    movements.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return { name, createdAt, createdByEmail, balance, movements };
  });

  return { staff, employees };
}
