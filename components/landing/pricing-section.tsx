import { IconCheck, IconClockHour4 } from '@tabler/icons-react';
import Link from 'next/link';
import { ContactSalesDialog } from '@/components/landing/contact-sales-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Feature = { text: string; soon?: boolean };

// Lo que no está marcado como "Próximamente" ya funciona en la aplicación.
const PLANS: {
  id: 'ESENCIAL' | 'PROFESIONAL' | 'EMPRESARIAL';
  name: string;
  price: string;
  unit: string;
  pitch: string;
  features: Feature[];
  highlighted?: boolean;
}[] = [
  {
    id: 'ESENCIAL',
    name: 'Esencial',
    price: '$4.900',
    unit: 'COP por empleado al mes',
    pitch: 'Todo lo necesario para llevar el banco de horas en orden.',
    features: [
      { text: 'Registro de entradas y salidas con motivo y descripción' },
      { text: 'Saldo y gráfica diaria por empleado' },
      { text: 'Búsqueda, filtros y alertas de saldo bajo' },
      { text: 'Roles de administrador y usuario' },
    ],
  },
  {
    id: 'PROFESIONAL',
    name: 'Profesional',
    price: '$8.900',
    unit: 'COP por empleado al mes',
    pitch: 'Para equipos que quieren analizar y anticiparse.',
    highlighted: true,
    features: [
      { text: 'Todo lo del plan Esencial' },
      { text: 'Resumen mensual por empleado', soon: true },
      { text: 'Exportar a Excel y CSV', soon: true },
      { text: 'Alertas de saldo bajo por correo', soon: true },
    ],
  },
  {
    id: 'EMPRESARIAL',
    name: 'Empresarial',
    price: 'A la medida',
    unit: 'para más de 500 empleados',
    pitch: 'Gestión y análisis avanzados para organizaciones grandes.',
    features: [
      { text: 'Todo lo del plan Profesional' },
      { text: 'Análisis de tendencias por área', soon: true },
      { text: 'Integración con nómina', soon: true },
      { text: 'Varias sedes y soporte prioritario', soon: true },
    ],
  },
];

export function PricingSection({ cta }: { cta: { href: string; label: string } }) {
  return (
    <section id='planes' className='mx-auto w-full max-w-6xl px-4 py-20 sm:px-6'>
      <div className='max-w-2xl'>
        <h2 className='font-heading text-3xl font-semibold tracking-tight sm:text-4xl'>Planes para cada empresa</h2>
        <p className='mt-2 text-muted-foreground'>Empieza con lo esencial y crece hacia la gestión y el análisis avanzado.</p>
      </div>
      <div className='mt-10 grid gap-6 lg:grid-cols-3 lg:items-stretch'>
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              'relative flex flex-col rounded-[1.75rem] border bg-card p-7',
              plan.highlighted && 'border-forest-deep bg-forest-deep text-sand shadow-2xl shadow-forest-deep/25 lg:-my-4 lg:py-11'
            )}
          >
            {plan.highlighted && (
              <span className='absolute -top-3 left-7 rounded-full bg-clay-strong px-3 py-1 text-xs font-semibold text-white'>
                Recomendado
              </span>
            )}
            <h3 className='font-heading text-2xl font-semibold'>{plan.name}</h3>
            <p className={cn('mt-1 text-sm', plan.highlighted ? 'text-sand/75' : 'text-muted-foreground')}>{plan.pitch}</p>
            <p className='mt-6 font-heading text-4xl font-semibold'>{plan.price}</p>
            <p className={cn('text-sm', plan.highlighted ? 'text-sand/75' : 'text-muted-foreground')}>{plan.unit}</p>
            <ul className='mt-6 flex-1 space-y-3 text-sm'>
              {plan.features.map((feature) => (
                <li key={feature.text} className='flex items-start gap-2'>
                  {feature.soon ? (
                    <IconClockHour4 className={cn('mt-0.5 size-4 shrink-0', plan.highlighted ? 'text-mustard' : 'text-[#7A5A12]')} />
                  ) : (
                    <IconCheck className={cn('mt-0.5 size-4 shrink-0', plan.highlighted ? 'text-mustard' : 'text-primary')} />
                  )}
                  <span>
                    {feature.text}
                    {feature.soon && (
                      <Badge
                        className={cn(
                          'ml-2 align-middle',
                          plan.highlighted ? 'bg-sand/15 text-sand' : 'bg-mustard/30 text-[#6B4E0E]'
                        )}
                      >
                        Próximamente
                      </Badge>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className='mt-8'>
              {plan.id === 'ESENCIAL' ? (
                <Button size='lg' className='h-11 w-full' nativeButton={false} render={<Link href={cta.href} />}>
                  {cta.label === 'Ir al panel' ? 'Ir al panel' : 'Empezar'}
                </Button>
              ) : (
                <ContactSalesDialog
                  plan={plan.id}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  className={plan.highlighted ? 'bg-clay-strong text-white hover:bg-clay-strong/90' : undefined}
                />
              )}
            </div>
          </article>
        ))}
      </div>
      <p className='mt-8 text-center text-xs text-muted-foreground'>
        Precios ilustrativos de este proyecto académico. Las funciones marcadas como «Próximamente» están en la hoja de ruta.
      </p>
    </section>
  );
}
