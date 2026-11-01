import type { Metadata } from 'next';
import { Geist_Mono, Roboto } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import './globals.css';

const roboto = Roboto({ subsets: ['latin'], variable: '--font-sans' });

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Gestión de Empleados · Banco de horas',
  description: 'Registro de horas trabajadas y administración de empleados',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='es' className={cn('h-full antialiased font-sans', geistMono.variable, roboto.variable)}>
      <body className='min-h-full flex flex-col'>
        {children}
        {/* Toaster global: los avisos de éxito/error funcionan en login y en el panel. */}
        <Toaster richColors position='top-right' />
      </body>
    </html>
  );
}
