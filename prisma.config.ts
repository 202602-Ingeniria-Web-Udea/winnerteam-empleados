// Configuración de la CLI de Prisma 7 (migraciones y seed).
// La CLI usa DIRECT_URL: en Supabase las migraciones deben ir por la conexión
// directa, no por el pooler que usa la aplicación (DATABASE_URL).
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DIRECT_URL'],
  },
});
