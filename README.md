# Sistema de Gestión de Empleados · Banco de horas

Aplicación web de administración de recursos humanos para registrar las **horas trabajadas** de los
empleados de una empresa. Cada empleado tiene un *banco de horas*: las jornadas y horas extra suman
a su saldo y las ausencias o permisos lo descuentan. El sistema muestra el historial de movimientos,
una gráfica con la evolución diaria del saldo y un panel con indicadores generales.

Proyecto del curso **Ingeniería Web** (Universidad de Antioquia, 2026-2).

- **Despliegue:** <https://winnerteam-empleados.vercel.app>
- **Repositorio:** <https://github.com/202602-Ingeniria-Web-Udea/winnerteam-empleados>

## Integrantes · Winner Team

| Nombre | Correo |
|---|---|
| _(pendiente)_ | |
| _(pendiente)_ | |
| _(pendiente)_ | |

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@empresa.com` | `Admin123*` |
| Usuario | `usuario@empresa.com` | `Usuario123*` |
| Usuario | `usuario2@empresa.com` | `Usuario123*` |

## Cómo se adaptó el enunciado

El enunciado define una aplicación genérica de *Maestros* con saldo y *Transacciones* de entrada y
salida. En este sistema:

| Enunciado | Gestión de empleados |
|---|---|
| Maestro | Empleado |
| Saldo del maestro | Horas acumuladas del empleado |
| Movimiento de entrada | Horas trabajadas o extra (suman) |
| Movimiento de salida | Ausencias o permisos (restan) |
| Gráfica de saldos diarios | Evolución del saldo de horas al cierre de cada día |

## Funcionalidades

- **Landing** pública con botón para iniciar sesión (o ir al panel si ya hay sesión).
- **Autenticación** con correo y contraseña: contraseñas con hash bcrypt y sesión en una cookie
  `httpOnly` con un JWT firmado (válida por 3 días). Cierre de sesión desde el menú del usuario.
- **Sidebar fijo** con la foto, el nombre y el correo del usuario, y enlaces según su rol.
- **Inicio (dashboard):** total de empleados, horas acumuladas, movimientos de hoy, empleados con
  saldo bajo (menos de 8 h) y últimos movimientos.
- **Transacciones:** selector de empleado, tabla de movimientos (id, fecha, tipo, horas y
  responsable), diálogo para agregar un movimiento y gráfica de la evolución del saldo diario.
  Una salida mayor que el saldo disponible se rechaza.
- **Maestros:** tabla de empleados (id, nombre, saldo y quién lo creó) y diálogo para agregar un
  empleado con su saldo inicial.
- **Usuarios:** tabla de usuarios (id, fecha de creación, correo y rol) y diálogo para cambiar el rol.

### Roles y permisos

| Acción | ADMIN | USER |
|---|:-:|:-:|
| Ver inicio, transacciones y maestros | ✓ | ✓ |
| Registrar movimientos de horas | ✓ | ✓ |
| Crear empleados (maestros) | ✓ | ✗ |
| Ver y editar usuarios | ✓ | ✗ |

Los permisos se validan **en el servidor** (páginas y API). Ocultar botones o enlaces en la interfaz
es solo una ayuda visual: un USER que llame directamente a la API recibe `403`.

## Tecnologías

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) ·
Prisma 7 con PostgreSQL (Supabase) · react-hook-form + zod · Recharts · jose · bcryptjs · Vitest.

## Estructura del proyecto

```
app/
  page.tsx                 Landing pública
  (auth)/login/            Inicio de sesión
  (main)/                  Panel (exige sesión): inicio, transacciones, maestros, usuarios
  api/                     Endpoints: auth/login, auth/logout, empleados, movimientos, usuarios/[id]
components/                Sidebar, tablas y diálogos de cada sección; components/ui = shadcn
lib/
  balance.ts               Reglas de negocio puras (saldo, serie diaria, cambio de rol)
  validation.ts            Esquemas zod compartidos entre formularios y API
  session.ts               Sesión del usuario y guardas de autorización
  session-token.ts         Firma y verificación del JWT
  prisma.ts                Cliente de base de datos
prisma/                    Esquema, migración inicial y datos de prueba (seed)
proxy.ts                   Redirección rápida a /login si no hay sesión
tests/                     Pruebas unitarias (Vitest)
```

### Decisiones de diseño

- **Lecturas en el servidor, escrituras por API.** Las páginas consultan la base de datos con Prisma
  desde Server Components; los formularios llaman a la API y luego refrescan la página, así la
  tabla y la gráfica se actualizan solas.
- **El saldo nunca queda negativo.** Las salidas descuentan con una actualización condicional en la
  base de datos (`balance >= cantidad`), de modo que dos solicitudes simultáneas no pueden gastar
  las mismas horas.
- **El saldo inicial es un movimiento.** Al crear un empleado se registra una entrada por su saldo
  inicial, para que el historial y la gráfica partan del valor correcto.
- **Zona horaria de Bogotá.** Los días de la gráfica y los "movimientos de hoy" se calculan en
  hora de Colombia, sin importar dónde corra el servidor.
- **Un administrador no puede quitarse su propio rol**, para que el sistema no se quede sin
  administradores por accidente.

## Ejecución local

Requisitos: Node.js 22 y una base de datos PostgreSQL (Docker o Supabase).

```bash
# 1. Dependencias (también genera el cliente de Prisma)
npm install

# 2. Base de datos local con Docker (opcional si se usa Supabase)
docker run -d --name empleados-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=empleados -p 5434:5432 postgres:16

# 3. Variables de entorno
cp .env.example .env        # y completar los valores

# 4. Tablas y datos de prueba
npx prisma migrate dev
npm run db:seed

# 5. Servidor de desarrollo → http://localhost:3000
npm run dev
```

### Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión de la aplicación. En Supabase: *Transaction pooler* (puerto 6543). |
| `DIRECT_URL` | Conexión para migraciones. En Supabase: *Session pooler* o conexión directa (puerto 5432). |
| `SESSION_SECRET` | Clave para firmar las sesiones. Generar con `openssl rand -base64 32`. |

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera el cliente de Prisma y compila para producción |
| `npm test` | Pruebas unitarias |
| `npm run lint` | Revisión de estilo con ESLint |
| `npm run db:seed` | Carga usuarios, empleados y movimientos de prueba |

## Despliegue (Supabase + Vercel)

1. Crear un proyecto en Supabase y copiar las cadenas de conexión (*Connect* → *ORMs*).
2. Aplicar la migración y cargar los datos de prueba contra Supabase:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
3. Importar el repositorio en Vercel con el nombre de proyecto `winnerteam-empleados` y definir
   `DATABASE_URL`, `DIRECT_URL` y `SESSION_SECRET` en *Settings → Environment Variables*.
4. Desplegar. Vercel ejecuta `npm install` (que genera el cliente de Prisma) y `npm run build`.
