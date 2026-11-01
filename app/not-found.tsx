import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center'>
      <LogoMark className='mb-2 size-12' />
      <p className='text-sm font-semibold tracking-wide text-destructive uppercase'>Error 404</p>
      <h1 className='font-heading text-4xl font-semibold tracking-tight'>Página no encontrada</h1>
      <p className='max-w-sm text-muted-foreground'>La página que buscas no existe o fue movida.</p>
      <Button nativeButton={false} render={<Link href='/' />}>
        Volver al inicio
      </Button>
    </div>
  );
}
