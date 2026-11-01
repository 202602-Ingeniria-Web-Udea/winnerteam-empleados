import {
  IconArrowRight,
  IconChartAreaLine,
  IconCircleCheck,
  IconClockPlus,
  IconShieldLock,
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/session';
import heroImage from '@/public/images/equipo-hero.jpg';

const steps = [
  {
    title: 'Registra a tu equipo',
    text: 'Crea a cada empleado con las horas que ya tiene a favor. Solo los administradores pueden hacerlo.',
  },
  {
    title: 'Anota cada movimiento',
    text: 'Suma jornadas y horas extra; descuenta ausencias y permisos. Cada registro queda firmado.',
  },
  {
    title: 'Sigue el saldo día a día',
    text: 'Consulta la gráfica de cada persona y detecta a tiempo a quién le quedan pocas horas.',
  },
];

const features = [
  {
    icon: IconClockPlus,
    tone: 'bg-secondary text-primary',
    title: 'Registro de horas',
    text: 'Entradas y salidas con responsable y fecha. Una salida nunca deja el saldo en negativo.',
  },
  {
    icon: IconChartAreaLine,
    tone: 'bg-clay/15 text-[#A34A28]',
    title: 'Saldos y gráficas',
    text: 'La evolución diaria del banco de horas de cada empleado, en una gráfica clara.',
  },
  {
    icon: IconShieldLock,
    tone: 'bg-mustard/25 text-[#7A5A12]',
    title: 'Roles y permisos',
    text: 'Los administradores gestionan empleados y usuarios; el resto del equipo registra movimientos.',
  },
];

const team = ['Juan Esteban Mosquera Perea', 'Maria Paula Mosquera Alvarez', 'Mateo Reyes Uribe'];

// Landing pública. Si ya hay sesión, los botones llevan directo al panel.
export default async function LandingPage() {
  const user = await getCurrentUser();
  const cta = user
    ? { href: '/inicio', label: 'Ir al panel' }
    : { href: '/login', label: 'Iniciar sesión' };

  return (
    <div className='flex min-h-svh flex-col overflow-x-hidden bg-background'>
      <header className='mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6'>
        <Link href='/' aria-label='Balance, inicio'>
          <Logo />
        </Link>
        <nav className='flex items-center gap-6 text-sm font-medium'>
          <a href='#como-funciona' className='hidden text-muted-foreground hover:text-foreground md:inline'>
            Cómo funciona
          </a>
          <a href='#funcionalidades' className='hidden text-muted-foreground hover:text-foreground md:inline'>
            Funcionalidades
          </a>
          <Button variant='outline' nativeButton={false} render={<Link href={cta.href} />}>
            {cta.label}
          </Button>
        </nav>
      </header>

      <main className='flex-1'>
        {/* Hero */}
        <section className='mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-14'>
          <div className='space-y-7'>
            <span className='inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground'>
              <span className='size-2 rounded-full bg-mustard' />
              Banco de horas para equipos de recursos humanos
            </span>
            <h1 className='font-heading text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl'>
              Cada hora de tu equipo, <em className='font-medium text-clay'>bien cuidada.</em>
            </h1>
            <p className='max-w-xl text-lg text-muted-foreground text-pretty'>
              Balance reúne jornadas, horas extra, ausencias y permisos en un solo lugar, para que
              sepas siempre cuántas horas tiene a favor cada persona.
            </p>
            <div className='flex flex-wrap items-center gap-3'>
              <Button size='lg' className='h-11 px-5' nativeButton={false} render={<Link href={cta.href} />}>
                {cta.label}
                <IconArrowRight />
              </Button>
              <Button
                size='lg'
                variant='ghost'
                className='h-11 px-4'
                nativeButton={false}
                render={<a href='#como-funciona' />}
              >
                Ver cómo funciona
              </Button>
            </div>
            <ul className='flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground'>
              {['Sin hojas de cálculo', 'Saldos siempre al día', 'Acceso por roles'].map((item) => (
                <li key={item} className='inline-flex items-center gap-1.5'>
                  <IconCircleCheck className='size-4 text-primary' />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className='relative mx-auto w-full max-w-lg lg:max-w-none'>
            <div aria-hidden className='absolute -top-6 -right-6 size-40 rounded-full bg-mustard/60 blur-2xl' />
            <div className='relative overflow-hidden rounded-[2rem] shadow-2xl shadow-forest-deep/20'>
              <Image
                src={heroImage}
                alt='Equipo de trabajo revisando información en un portátil'
                placeholder='blur'
                priority
                sizes='(min-width: 1024px) 50vw, 100vw'
                // Tratamiento cálido para integrar la foto con la paleta.
                className='aspect-[4/3] w-full object-cover sepia-[.2] saturate-[.9] lg:aspect-[5/6]'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-forest-deep/50 via-transparent to-transparent' />
            </div>

            {/* Tarjeta flotante: muestra el producto encima de la foto. */}
            <div className='absolute -bottom-12 left-3 w-44 rounded-2xl border bg-card p-3 shadow-xl sm:-bottom-8 sm:-left-6 sm:w-60 sm:p-4'>
              <p className='text-xs text-muted-foreground'>Saldo de Ana Gómez</p>
              <p className='font-heading text-2xl font-semibold text-primary sm:text-3xl'>+24 h</p>
              <svg viewBox='0 0 200 60' className='mt-2 w-full' aria-hidden='true'>
                <path
                  d='M0 50 H25 V42 H55 V46 H80 V30 H110 V34 H140 V16 H170 V20 H200 V60 H0 Z'
                  fill='#2F5D50'
                  fillOpacity='0.12'
                />
                <path
                  d='M0 50 H25 V42 H55 V46 H80 V30 H110 V34 H140 V16 H170 V20 H200'
                  fill='none'
                  stroke='#2F5D50'
                  strokeWidth='3'
                />
              </svg>
            </div>
            <div className='absolute top-6 -left-3 hidden rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-lg sm:block'>
              Entrada · +8 h
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id='como-funciona' className='border-y bg-card py-20'>
          <div className='mx-auto w-full max-w-6xl px-4 sm:px-6'>
            <h2 className='font-heading text-3xl font-semibold tracking-tight sm:text-4xl'>Cómo funciona</h2>
            <p className='mt-2 max-w-xl text-muted-foreground'>Tres pasos para tener el banco de horas en orden.</p>
            <ol className='mt-10 grid gap-6 md:grid-cols-3'>
              {steps.map((step, index) => (
                <li key={step.title} className='rounded-2xl bg-background p-6'>
                  <span className='font-heading text-5xl font-semibold text-clay'>{index + 1}</span>
                  <h3 className='mt-3 text-lg font-semibold'>{step.title}</h3>
                  <p className='mt-1 text-sm text-muted-foreground'>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Funcionalidades */}
        <section id='funcionalidades' className='mx-auto w-full max-w-6xl px-4 py-20 sm:px-6'>
          <h2 className='font-heading text-3xl font-semibold tracking-tight sm:text-4xl'>Todo lo que necesitas</h2>
          <div className='mt-10 grid gap-6 md:grid-cols-3'>
            {features.map(({ icon: Icon, tone, title, text }) => (
              <article key={title} className='rounded-2xl border bg-card p-6'>
                <span className={`inline-flex size-11 items-center justify-center rounded-full ${tone}`}>
                  <Icon className='size-5' />
                </span>
                <h3 className='mt-4 text-lg font-semibold'>{title}</h3>
                <p className='mt-1 text-sm text-muted-foreground'>{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Llamado a la acción */}
        <section className='px-4 pb-20 sm:px-6'>
          <div className='mx-auto flex w-full max-w-6xl flex-col items-start gap-6 rounded-[2rem] bg-forest-deep px-8 py-12 text-sand sm:px-12 md:flex-row md:items-center md:justify-between'>
            <h2 className='max-w-xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl'>
              Menos hojas de cálculo, más tiempo para tu gente.
            </h2>
            <Button
              size='lg'
              className='h-11 bg-clay px-5 text-white hover:bg-clay/90'
              nativeButton={false}
              render={<Link href={cta.href} />}
            >
              {cta.label}
              <IconArrowRight />
            </Button>
          </div>
        </section>
      </main>

      <footer className='border-t'>
        <div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-end md:justify-between'>
          <div className='space-y-3'>
            <Logo />
            <p>Ingeniería Web · Universidad de Antioquia · Winner Team</p>
          </div>
          <ul className='space-y-1 md:text-right'>
            {team.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}
