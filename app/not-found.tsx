import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center'>
      <p className='text-sm font-medium text-muted-foreground'>Error 404</p>
      <h1 className='text-3xl font-bold'>Página no encontrada</h1>
      <p className='max-w-sm text-muted-foreground'>La página que buscas no existe o fue movida.</p>
      <Button nativeButton={false} render={<Link href='/' />}>
        Volver al inicio
      </Button>
    </div>
  );
}
