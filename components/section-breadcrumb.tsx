'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const SECTION_TITLES: Record<string, string> = {
  inicio: 'Inicio',
  transacciones: 'Transacciones',
  maestros: 'Maestros',
  usuarios: 'Usuarios',
};

export function SectionBreadcrumb() {
  const section = usePathname().split('/')[1] ?? '';
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className='hidden md:block'>Panel</BreadcrumbItem>
        <BreadcrumbSeparator className='hidden md:block' />
        <BreadcrumbItem>
          <BreadcrumbPage>{SECTION_TITLES[section] ?? 'Panel'}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
