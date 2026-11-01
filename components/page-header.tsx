export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>{title}</h1>
        {description && <p className='text-sm text-muted-foreground'>{description}</p>}
      </div>
      {action && <div className='flex flex-wrap items-center gap-2'>{action}</div>}
    </div>
  );
}
