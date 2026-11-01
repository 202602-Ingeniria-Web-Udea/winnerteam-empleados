'use client';

import { IconLogout, IconSelector } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { initials } from '@/lib/format';
import type { CurrentUser } from '@/lib/session';

const ROLE_LABEL = { ADMIN: 'Administrador', USER: 'Usuario' } as const;

function UserSummary({ user }: { user: CurrentUser }) {
  const fullName = [user.name, user.lastName].filter(Boolean).join(' ');
  return (
    <>
      <Avatar className='size-8 rounded-lg'>
        {user.image && <AvatarImage src={user.image} alt={fullName} />}
        <AvatarFallback className='rounded-lg'>{initials(user.name, user.lastName)}</AvatarFallback>
      </Avatar>
      <div className='grid flex-1 text-left text-sm leading-tight'>
        <span className='truncate font-medium'>{fullName}</span>
        <span className='truncate text-xs opacity-70'>{user.email}</span>
      </div>
    </>
  );
}

export function NavUser({ user }: { user: CurrentUser }) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
      router.refresh();
    } catch {
      toast.error('No fue posible cerrar la sesión');
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size='lg' className='aria-expanded:bg-muted' />}
          >
            <UserSummary user={user} />
            <IconSelector className='ml-auto size-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='min-w-56'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                  <UserSummary user={user} />
                </div>
                <p className='px-1 pb-1 text-xs text-muted-foreground'>Rol: {ROLE_LABEL[user.role]}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <IconLogout />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
