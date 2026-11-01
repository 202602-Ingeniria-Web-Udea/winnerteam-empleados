import { PageHeader } from '@/components/page-header';
import { requireUser } from '@/lib/session';

export default async function InicioPage() {
  const user = await requireUser();
  return <PageHeader title={`Hola, ${user.name}`} description='Resumen del banco de horas' />;
}
