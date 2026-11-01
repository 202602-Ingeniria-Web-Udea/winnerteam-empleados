import type { Metadata } from 'next';
import { Fraunces, Instrument_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import './globals.css';

// Identidad Balance: Fraunces (serif con carácter) para títulos y cifras,
// Instrument Sans para la interfaz.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  axes: ['opsz'],
});

const instrumentSans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Balance · Banco de horas',
  description: 'Gestión de horas trabajadas para equipos de recursos humanos',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='es' className={cn('h-full antialiased font-sans', fraunces.variable, instrumentSans.variable)}>
      <body className='min-h-full flex flex-col'>
        {children}
        {/* Toaster global: los avisos de éxito/error funcionan en login y en el panel. */}
        <Toaster richColors position='top-right' />
      </body>
    </html>
  );
}
