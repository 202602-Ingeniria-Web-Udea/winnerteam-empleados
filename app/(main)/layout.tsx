import { AppSidebar } from '@/components/app-sidebar';
import { SectionBreadcrumb } from '@/components/section-breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { requireUser } from '@/lib/session';

// Layout del panel: toda ruta dentro de (main) exige sesión. requireUser corre
// en el servidor en cada solicitud, así que nadie ve el panel sin autenticarse.
export default async function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className='min-w-0'>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
            <SectionBreadcrumb />
          </div>
        </header>
        <main className='flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
