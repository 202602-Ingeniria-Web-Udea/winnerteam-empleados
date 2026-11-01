import { ProblemAnimation } from '@/components/landing/problem-animation';

/**
 * Clip de video opcional (p. ej. generado con IA) que acompaña la animación.
 * Para activarlo: guardar el archivo en public/videos/ y poner aquí su ruta,
 * por ejemplo '/videos/problema.mp4'. Con null solo se muestra la animación.
 */
export const PROBLEM_VIDEO_SRC: string | null = null;

export function ProblemSection() {
  return (
    <section id='problema' className='mx-auto w-full max-w-6xl px-4 py-20 sm:px-6'>
      <div className='grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]'>
        <div className='space-y-5'>
          <p className='text-sm font-semibold tracking-wide text-destructive uppercase'>El problema</p>
          <h2 className='font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl'>
            Las horas extra existen. Lo difícil es saber cuántas son.
          </h2>
          <p className='text-muted-foreground text-pretty'>
            Turnos de sábado, festivos trabajados, permisos y días compensatorios terminan en hojas de
            cálculo, correos y papelitos. Cuando alguien pregunta por su saldo, nadie puede responder
            con certeza, y la confianza entre la empresa y su gente se desgasta.
          </p>
        </div>
        {PROBLEM_VIDEO_SRC ? (
          <div className='grid gap-4'>
            <video
              src={PROBLEM_VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              aria-label='Video: una oficina de recursos humanos al cierre de mes'
              className='aspect-video w-full rounded-[2rem] object-cover shadow-2xl sepia-[.2] saturate-[.9]'
            />
            <ProblemAnimation />
          </div>
        ) : (
          <ProblemAnimation />
        )}
      </div>
    </section>
  );
}
