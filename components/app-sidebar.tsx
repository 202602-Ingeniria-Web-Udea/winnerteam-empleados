'use client';

import {
  IconArrowsExchange,
  IconLayoutDashboard,
  IconUsersGroup,
  IconUserShield,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
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
            <SidebarMenuButton
              size='lg'
              // El botón del sidebar fuerza los SVG a 16 px; el logo va a 32 px salvo con el sidebar colapsado.
              className='hover:bg-transparent active:bg-transparent [&_svg]:size-8! group-data-[collapsible=icon]:[&_svg]:size-4!'
              render={<Link href='/inicio' aria-label='Balance, inicio' />}
            >
              <Logo variant='dark' />
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
