import Image from 'next/image';
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
        <div className='relative flex h-full flex-col justify-between p-10 text-sand'>
          <Logo variant='dark' />
          <blockquote className='max-w-md space-y-3'>
            <p className='font-heading text-3xl leading-tight font-medium'>
              “El tiempo de las personas es lo más valioso de una empresa. Cuídalo con claridad.”
            </p>
            <footer className='text-sm text-sand/70'>Balance · Banco de horas</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex items-center justify-center p-6 md:p-10'>
        <LoginForm />
      </div>
    </div>
  );
}
