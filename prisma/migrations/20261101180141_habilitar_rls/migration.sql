-- Supabase expone las tablas del esquema "public" a través de su Data API
-- (PostgREST). Con RLS activado y sin políticas, esa API no puede leer ni
-- escribir nada (por ejemplo, los hashes de contraseña de "User").
-- La aplicación no se ve afectada: Prisma se conecta como el dueño de las
-- tablas, que no está sujeto a RLS.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HourMovement" ENABLE ROW LEVEL SECURITY;
