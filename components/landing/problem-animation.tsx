import { IconCircleCheck } from '@tabler/icons-react';
import { LogoMark } from '@/components/brand/logo';

const CHAOTIC_CELLS = ['8', '8', '+3?', '8', '??', '8', '#¡REF!', '+2', '8', '−4?', '8', '??', '8', '+6', '8', '¿8?', '+1', '8'];
const TABS = ['Horas_2025', 'Horas_FINAL', 'FINAL_v3', 'NO BORRAR', 'Copia de…'];

/**
 * Historia animada del problema en tres escenas (CSS puro, ver globals.css):
 * la pregunta del empleado → la hoja de cálculo caótica → la respuesta con Balance.
 */
export function ProblemAnimation() {
  return (
    <div
      role='img'
      aria-label='Animación: un empleado pregunta cuántas horas tiene a favor; Recursos Humanos busca en una hoja de cálculo caótica sin encontrar la respuesta; con Balance la responde en segundos y aprueba su día compensatorio.'
      className='relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-forest-deep text-sand shadow-2xl shadow-forest-deep/20 sm:aspect-video'
    >
      <div aria-hidden className='absolute -top-16 -right-16 size-56 rounded-full bg-clay/25 blur-3xl' />

      {/* Escena 1: la pregunta */}
      <div aria-hidden className='story-scene absolute inset-0 flex flex-col items-center justify-center gap-5 p-6'>
        <span className='rounded-full bg-sand/10 px-3 py-1 text-xs font-medium tracking-wide uppercase'>
          Viernes · 5:40 p. m.
        </span>
        <div className='flex max-w-sm items-end gap-3'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-clay font-semibold text-white'>A</span>
          <div className='rounded-2xl rounded-bl-sm bg-card p-4 text-foreground shadow-lg'>
            <p className='text-xs font-semibold text-muted-foreground'>Andrés · Operaciones</p>
            <p className='mt-1 font-heading text-lg leading-snug sm:text-xl'>
              ¿Cuántas horas tengo a favor? Necesito el lunes libre.
            </p>
          </div>
        </div>
      </div>

      {/* Escena 2: la hoja de cálculo */}
      <div aria-hidden className='story-scene story-scene-2 absolute inset-0 flex flex-col items-center justify-center gap-4 p-6'>
        <div className='story-shake w-full max-w-md overflow-hidden rounded-xl bg-white text-[0.7rem] text-neutral-700 shadow-lg'>
          <div className='grid grid-cols-6 border-b bg-neutral-100 font-semibold'>
            {['Empleado', 'L', 'M', 'X', 'J', 'V'].map((h) => (
              <span key={h} className='border-r px-2 py-1'>{h}</span>
            ))}
          </div>
          {[0, 1, 2].map((row) => (
            <div key={row} className='grid grid-cols-6 border-b'>
              <span className='border-r px-2 py-1 text-neutral-400'>Empleado {row + 7}</span>
              {CHAOTIC_CELLS.slice(row * 5, row * 5 + 5).map((cell, i) => (
                <span
                  key={i}
                  className={`border-r px-2 py-1 ${cell.includes('?') || cell.includes('REF') ? 'bg-red-50 font-semibold text-red-700' : ''}`}
                >
                  {cell}
                </span>
              ))}
            </div>
          ))}
          <div className='flex gap-1 overflow-hidden bg-neutral-100 px-2 py-1'>
            {TABS.map((tab) => (
              <span key={tab} className='shrink-0 rounded-t bg-white px-2 py-0.5 text-neutral-500'>{tab}</span>
            ))}
          </div>
        </div>
        <p className='max-w-md text-center font-heading text-lg sm:text-xl'>
          60 pestañas, sumas a mano… y nadie sabe el saldo real.
        </p>
      </div>

      {/* Escena 3: la respuesta con Balance */}
      <div aria-hidden className='story-scene story-scene-3 absolute inset-0 flex flex-col items-center justify-center gap-4 p-6'>
        <div className='w-full max-w-sm rounded-2xl bg-card p-5 text-foreground shadow-lg'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <LogoMark className='size-7' />
              <span className='text-sm font-semibold'>Andrés · Operaciones</span>
            </div>
            <span className='font-heading text-3xl font-semibold text-primary'>35 h</span>
          </div>
          <svg viewBox='0 0 200 50' className='mt-3 w-full'>
            <path d='M0 42 H30 V34 H60 V38 H90 V24 H120 V28 H150 V12 H200 V50 H0 Z' fill='#2F5D50' fillOpacity='0.12' />
            <path d='M0 42 H30 V34 H60 V38 H90 V24 H120 V28 H150 V12 H200' fill='none' stroke='#2F5D50' strokeWidth='3' />
          </svg>
          <p className='mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground'>
            <IconCircleCheck className='size-4' />
            Día compensatorio aprobado · −8 h
          </p>
        </div>
        <p className='text-center font-heading text-lg sm:text-xl'>Con Balance: la respuesta en 10 segundos.</p>
      </div>

      {/* Indicador de escena */}
      <div aria-hidden className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5'>
        {[1, 2, 3].map((n) => (
          <span key={n} className={`story-dot story-dot-${n} h-2 rounded-full`} />
        ))}
      </div>
    </div>
  );
}
