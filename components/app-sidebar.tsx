'use client';

import {
  IconArrowsExchange,
  IconClockHour4,
  IconLayoutDashboard,
  IconUsersGroup,
  IconUserShield,
} from '@tabler/icons-react';
import Link from 'next/link';
import { NavMain, type NavItem } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import type { CurrentUser } from '@/lib/session';

const baseItems: NavItem[] = [
  { title: 'Inicio', url: '/inicio', icon: <IconLayoutDashboard /> },
  { title: 'Transacciones', url: '/transacciones', icon: <IconArrowsExchange /> },
  { title: 'Maestros', url: '/maestros', icon: <IconUsersGroup /> },
];

// El enlace de Usuarios solo se muestra a administradores. Ocultarlo es solo
// una ayuda visual: la página y la API validan el rol en el servidor.
const adminItems: NavItem[] = [{ title: 'Usuarios', url: '/usuarios', icon: <IconUserShield /> }];

export function AppSidebar({ user, ...props }: { user: CurrentUser } & React.ComponentProps<typeof Sidebar>) {
  const items = user.role === 'ADMIN' ? [...baseItems, ...adminItems] : baseItems;

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' render={<Link href='/inicio' />}>
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                <IconClockHour4 className='size-4' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>Banco de horas</span>
                <span className='truncate text-xs text-muted-foreground'>Gestión de empleados</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
