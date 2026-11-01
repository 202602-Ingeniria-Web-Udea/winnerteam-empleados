import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between gap-2'>
          <CardDescription>{title}</CardDescription>
          <span className='text-muted-foreground [&_svg]:size-5'>{icon}</span>
        </div>
        <CardTitle className='text-3xl tabular-nums'>{value}</CardTitle>
        {description && <p className='text-xs text-muted-foreground'>{description}</p>}
      </CardHeader>
    </Card>
  );
}
