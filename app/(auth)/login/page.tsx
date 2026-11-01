import { IconArrowLeft } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/login-form';
import { Logo } from '@/components/brand/logo';
import loginImage from '@/public/images/equipo-login.jpg';

// Pantalla dividida: foto de marca a la izquierda (solo en pantallas grandes)
// y el formulario a la derecha.
export default function LoginPage() {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='relative hidden overflow-hidden bg-forest-deep lg:block'>
        <Image
          src={loginImage}
          alt='Dos colegas celebrando un logro en la oficina'
          placeholder='blur'
          fill
          priority
          sizes='50vw'
          className='object-cover opacity-80 sepia-[.2] saturate-[.9]'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/40 to-forest-deep/10' />
        {/* Sombra superior para que el logo y su subtítulo se lean sobre la foto. */}
        <div className='absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-forest-deep/70 to-transparent' />
        <div className='relative flex h-full flex-col justify-between p-10 text-sand'>
          <Link href='/' className='w-fit rounded-lg focus-visible:ring-2 focus-visible:ring-sand/70 focus-visible:outline-none'>
            <Logo variant='dark' />
          </Link>
          <blockquote className='max-w-md space-y-3'>
            <p className='font-heading text-3xl leading-tight font-medium'>
              “El tiempo de las personas es lo más valioso de una empresa. Cuídalo con claridad.”
            </p>
            <footer className='text-sm text-sand/70'>Balance · Banco de horas</footer>
          </blockquote>
        </div>
      </div>
      <div className='relative flex items-center justify-center p-6 pt-16 md:p-10 md:pt-16'>
        {/* Regreso a la landing, visible en cualquier tamaño de pantalla. */}
        <Link
          href='/'
          className='absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground md:top-8 md:left-10'
        >
          <IconArrowLeft className='size-4' />
          Volver al inicio
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
