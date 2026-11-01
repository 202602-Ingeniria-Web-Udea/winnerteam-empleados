import {
  IconArrowRight,
  IconChartAreaLine,
  IconClockHour4,
  IconClockPlus,
  IconShieldLock,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/session';

const features = [
  {
    icon: IconClockPlus,
    title: 'Registro de horas',
    text: 'Suma jornadas y horas extra, descuenta ausencias y permisos. Cada movimiento queda firmado por quien lo registró.',
  },
  {
    icon: IconChartAreaLine,
    title: 'Saldos y gráficas',
    text: 'Consulta el saldo de horas de cada empleado y su evolución día a día en una gráfica clara.',
  },
  {
    icon: IconShieldLock,
    title: 'Roles y permisos',
    text: 'Los administradores gestionan empleados y usuarios; el resto del equipo registra movimientos.',
  },
];

// Landing pública. Si ya hay sesión, el botón lleva directo al panel.
export default async function LandingPage() {
  const user = await getCurrentUser();
  const cta = user
    ? { href: '/inicio', label: 'Ir al panel' }
    : { href: '/login', label: 'Iniciar sesión' };

  return (
    <div className='flex min-h-svh flex-col bg-background'>
      <header className='mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6'>
        <div className='flex items-center gap-2 font-semibold'>
          <span className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <IconClockHour4 className='size-4' />
          </span>
          Banco de horas
        </div>
        <Button variant='outline' nativeButton={false} render={<Link href={cta.href} />}>
          {cta.label}
        </Button>
      </header>

      <main className='mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-16 px-4 py-12 sm:px-6'>
        <section className='max-w-3xl space-y-6'>
          <p className='text-sm font-medium uppercase tracking-widest text-muted-foreground'>
            Sistema de gestión de empleados
          </p>
          <h1 className='text-4xl font-bold tracking-tight text-balance sm:text-6xl'>
            Cada hora trabajada, registrada y a la vista.
          </h1>
          <p className='max-w-2xl text-lg text-muted-foreground text-pretty'>
            Lleva el banco de horas de tu equipo: registra entradas y salidas de horas, controla el
            saldo de cada empleado y detecta a tiempo quién se está quedando sin horas acumuladas.
          </p>
          <Button size='lg' nativeButton={false} render={<Link href={cta.href} />}>
            {cta.label}
            <IconArrowRight />
          </Button>
        </section>

        <section className='grid gap-4 sm:grid-cols-3'>
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className='rounded-xl border bg-card p-6'>
              <Icon className='mb-4 size-6 text-primary' />
              <h2 className='mb-2 font-semibold'>{title}</h2>
              <p className='text-sm text-muted-foreground'>{text}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className='mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted-foreground sm:px-6'>
        Ingeniería Web · Universidad de Antioquia · Winner Team
      </footer>
    </div>
  );
}
