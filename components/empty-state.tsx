/** Mensaje para tablas o listas sin datos, con un ícono suave. */
export function EmptyState({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className='flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground'>
      <span className='flex size-10 items-center justify-center rounded-full bg-muted [&_svg]:size-5'>{icon}</span>
      {children}
    </div>
  );
}
