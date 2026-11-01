import { ProblemAnimation } from '@/components/landing/problem-animation';

/**
 * Clip de video opcional que acompaña la animación. Con null solo se muestra
 * la animación. El actual se generó con IA (Veo 3.1) y se editó para que la
 * pantalla de la app sea una captura real (la IA había inventado texto con
 * errores de ortografía).
 */
export const PROBLEM_VIDEO_SRC: string | null = '/videos/problema-balance.mp4';
const PROBLEM_VIDEO_POSTER = '/videos/problema-poster.jpg';

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
            <figure className='space-y-2'>
              <video
                src={PROBLEM_VIDEO_SRC}
                poster={PROBLEM_VIDEO_POSTER}
                autoPlay
                muted
                loop
                playsInline
                preload='metadata'
                aria-label='Video: un empleado pregunta por sus horas a favor; la jefa de Recursos Humanos se agobia entre papeles y calculadora, consulta Balance y le responde con una sonrisa.'
                className='aspect-video w-full rounded-[2rem] bg-forest-deep object-cover shadow-2xl'
              />
              <figcaption className='text-center text-xs text-muted-foreground'>
                Video ilustrativo generado con IA. La pantalla de Balance que aparece es una captura real.
              </figcaption>
            </figure>
            <ProblemAnimation />
          </div>
        ) : (
          <ProblemAnimation />
        )}
      </div>
    </section>
  );
}
