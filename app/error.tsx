'use client'; // Los error boundaries deben ser Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Se muestra si una página falla en el servidor (p. ej. la base de datos no
// responde). Reemplaza el mensaje genérico en inglés de Next.js.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center'>
      <p className='text-sm font-medium text-muted-foreground'>Algo salió mal</p>
      <h1 className='text-3xl font-bold'>No pudimos cargar esta página</h1>
      <p className='max-w-sm text-muted-foreground'>
        Ocurrió un error inesperado. Intenta de nuevo en unos segundos.
      </p>
      <Button onClick={() => retry()}>Intentar de nuevo</Button>
    </div>
  );
}
