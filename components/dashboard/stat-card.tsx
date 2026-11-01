import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Círculo de color del ícono según el tono de la marca.
const TONES = {
  forest: 'bg-secondary text-primary',
  clay: 'bg-clay/15 text-destructive',
  mustard: 'bg-mustard/30 text-[#7A5A12]',
  sage: 'bg-[#E3EDE6] text-[#3E6B55]',
} as const;

export function StatCard({
  title,
  value,
  description,
  icon,
  tone = 'forest',
}: {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <Card>
      <CardHeader className='gap-3'>
        <div className='flex items-center justify-between gap-2'>
          <CardDescription className='font-medium'>{title}</CardDescription>
          <span className={cn('flex size-9 items-center justify-center rounded-full [&_svg]:size-[1.15rem]', TONES[tone])}>
            {icon}
          </span>
        </div>
        <CardTitle className='font-heading text-4xl font-semibold tabular-nums'>{value}</CardTitle>
        {description && <p className='text-xs text-muted-foreground'>{description}</p>}
      </CardHeader>
    </Card>
  );
}
