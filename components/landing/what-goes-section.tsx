import { IconBuildingBank, IconCalendarTime } from '@tabler/icons-react';

// Semana de ejemplo de un operario: jornada normal + lo que va al banco de horas.
const WEEK = [
  { day: 'Lun', base: 8 },
  { day: 'Mar', base: 8 },
  { day: 'Mié', base: 8, extra: 2, note: '+2 h extra' },
  { day: 'Jue', base: 8 },
  { day: 'Vie', base: 5, leave: 3, note: '−3 h permiso' },
  { day: 'Sáb', base: 0, extra: 6, note: '+6 h turno' },
  { day: 'Dom', base: 0 },
];
const HOUR = 0.85; // rem de alto por hora en las barras

export function WhatGoesSection() {
  return (
    <section id='que-registra' className='border-y bg-card py-20'>
      <div className='mx-auto w-full max-w-6xl px-4 sm:px-6'>
        <h2 className='font-heading text-3xl font-semibold tracking-tight sm:text-4xl'>¿Qué registra Balance?</h2>
        <p className='mt-2 max-w-2xl text-muted-foreground'>
          Balance no reemplaza tu control de asistencia: lleva solo lo que sale de la jornada pactada.
        </p>

        <div className='mt-10 grid gap-6 md:grid-cols-2'>
          <article className='rounded-2xl border bg-background p-6'>
            <span className='inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground'>
              <IconCalendarTime className='size-5' />
            </span>
            <h3 className='mt-4 text-lg font-semibold'>Jornada normal</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Las 8 horas diarias pactadas en el contrato. Se registran en tu control de asistencia o
              en la nómina y ya están pagadas con el salario. <strong className='text-foreground'>Balance no las toca.</strong>
            </p>
          </article>
          <article className='rounded-2xl border border-primary/30 bg-secondary/50 p-6'>
            <span className='inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground'>
              <IconBuildingBank className='size-5' />
            </span>
            <h3 className='mt-4 text-lg font-semibold'>Banco de horas · aquí va en Balance</h3>
            <ul className='mt-2 space-y-1 text-sm text-muted-foreground'>
              <li>
                <strong className='text-primary'>Suman:</strong> horas extra, turnos de sábado y festivos trabajados.
              </li>
              <li>
                <strong className='text-destructive'>Restan:</strong> permisos, citas médicas y días compensatorios.
              </li>
              <li>Cada movimiento queda con su motivo, su descripción y quién lo registró.</li>
            </ul>
          </article>
        </div>

        {/* Ejemplo: la semana de un operario */}
        <figure className='mt-8 rounded-2xl border bg-background p-6'>
          <figcaption className='flex flex-wrap items-baseline justify-between gap-2'>
            <span className='font-semibold'>Ejemplo: la semana de un operario</span>
            <span className='text-sm text-muted-foreground'>
              Resultado en Balance: <strong className='font-heading text-lg text-primary'>+5 h</strong> al banco
            </span>
          </figcaption>
          <div className='mt-6 grid grid-cols-7 items-end gap-2 sm:gap-4' role='list'>
            {WEEK.map(({ day, base, extra = 0, leave = 0, note }) => (
              <div key={day} role='listitem' className='flex flex-col items-center gap-2 text-center'>
                <span className='h-9 text-[0.65rem] leading-tight font-semibold sm:text-xs'>
                  <span className={leave ? 'text-destructive' : 'text-primary'}>{note}</span>
                </span>
                <div className='flex w-full max-w-12 flex-col justify-end' style={{ height: `${10 * HOUR}rem` }}>
                  {extra > 0 && (
                    <div className='rounded-t-md bg-primary' style={{ height: `${extra * HOUR}rem` }} title={`${extra} h al banco`} />
                  )}
                  {leave > 0 && (
                    <div
                      className='rounded-t-md border-2 border-dashed border-destructive/60 bg-[#F7DFD3]'
                      style={{ height: `${leave * HOUR}rem` }}
                      title={`${leave} h de permiso`}
                    />
                  )}
                  {base > 0 && (
                    <div
                      className={`bg-muted ${extra || leave ? '' : 'rounded-t-md'} rounded-b-md`}
                      style={{ height: `${base * HOUR}rem` }}
                      title={`${base} h de jornada normal`}
                    />
                  )}
                </div>
                <span className='text-xs font-medium text-muted-foreground'>{day}</span>
              </div>
            ))}
          </div>
          <div className='mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground'>
            <span className='inline-flex items-center gap-1.5'><span className='size-3 rounded-sm bg-muted' />Jornada normal (nómina)</span>
            <span className='inline-flex items-center gap-1.5'><span className='size-3 rounded-sm bg-primary' />Suma al banco</span>
            <span className='inline-flex items-center gap-1.5'><span className='size-3 rounded-sm border-2 border-dashed border-destructive/60 bg-[#F7DFD3]' />Resta del banco</span>
          </div>
        </figure>
      </div>
    </section>
  );
}
