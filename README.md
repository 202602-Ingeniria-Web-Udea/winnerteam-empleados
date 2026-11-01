# Balance · Banco de horas

**Sistema de Gestión de Empleados.**

**Balance** es una aplicación web de administración de recursos humanos para registrar las **horas trabajadas** de los
empleados de una empresa. Cada empleado tiene un *banco de horas*: las jornadas y horas extra suman
a su saldo y las ausencias o permisos lo descuentan. El sistema muestra el historial de movimientos,
una gráfica con la evolución diaria del saldo y un panel con indicadores generales.

Proyecto del curso **Ingeniería Web** (Universidad de Antioquia, 2026-2).

- **Despliegue:** <https://winnerteam-empleados.vercel.app>
- **Repositorio:** <https://github.com/202602-Ingeniria-Web-Udea/winnerteam-empleados>

## Integrantes · Winner Team

- Juan Esteban Mosquera Perea
- Maria Paula Mosquera Alvarez
- Mateo Reyes Uribe

## Identidad visual

Balance tiene una identidad propia, **cálida y humana**: el banco de horas trata del tiempo de las
personas, así que evita el azul corporativo genérico.

- **Logo:** monograma "b" de *Balance* cuya panza es un reloj, con un punto mostaza como sol
  (`components/brand/logo.tsx`, favicon en `app/icon.svg`).
- **Paleta "Bosque y arcilla":**

  | Color | Hex | Uso |
  |---|---|---|
  | Bosque | `#2F5D50` | Color principal, botones, gráfica |
  | Bosque profundo | `#22392F` | Sidebar y bandas oscuras |
  | Arcilla | `#D9784F` | Acento, ítem activo del menú |
  | Mostaza | `#E9C46A` | Alertas de saldo bajo |
  | Arena | `#F7F3EC` | Fondo |

  Los colores viven como variables CSS en `app/globals.css`, y una prueba automática
  (`tests/contrast.test.ts`) verifica que los textos cumplan el contraste WCAG AA.
- **Tipografía:** [Fraunces](https://fonts.google.com/specimen/Fraunces) en títulos y cifras,
  [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) en la interfaz.
- **Fotografías:** de [Unsplash](https://unsplash.com) (licencia Unsplash), con un tratamiento
  cálido para integrarlas a la paleta.

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@empresa.com` | `Admin123*` |
| Usuario | `usuario@empresa.com` | `Usuario123*` |
| Usuario | `usuario2@empresa.com` | `Usuario123*` |
| Administrador | `paula.henao@empresa.com` | `Admin123*` |
| Usuario | `diego.cardenas@empresa.com` | `Usuario123*` |

### Datos de demostración

La base de producción simula una empresa mediana que adoptó Balance hace seis meses
(`prisma/demo-data.ts`):

- **60 empleados** con perfiles de operaciones, contabilidad, comercial y administrativo; 12 de ellos
  ingresaron durante el periodo.
- **~1.500 movimientos** con sentido de negocio: horas extra entre semana, más en los cierres de mes
  para contabilidad y comercial; turnos de sábado y festivos trabajados en operaciones (registrados
  el siguiente día hábil), y salidas por permisos, citas médicas y días compensatorios.
- Se registran solo en días hábiles (respetando los festivos de Colombia de 2026) y en horario de
  oficina, por personas del equipo de RR. HH. que ya tenían usuario en esa fecha.
- Siempre se cumple que ningún saldo queda negativo y que el saldo de cada empleado es la suma de sus
  movimientos (lo verifica `tests/demo-data.test.ts`).

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
- **Inicio (dashboard):** total de empleados, horas acumuladas, movimientos de hoy, los 5 empleados
  con saldo más bajo (menos de 8 h, con enlace a la lista completa) y últimos movimientos.
- **Transacciones:** selector de empleado **con búsqueda**, tabla de movimientos paginada (id,
  fecha, tipo, horas, motivo y responsable), diálogo para agregar un movimiento y gráfica de la
  evolución del saldo diario con rango de 30 días, 90 días o todo. Una salida mayor que el saldo
  disponible se rechaza.
- **Justificación obligatoria de cada movimiento:** un **motivo** que depende del tipo (Entrada:
  horas extra, turno de sábado, festivo trabajado u otro; Salida: permiso, cita médica, día
  compensatorio u otro) y una **descripción** de 3 a 200 caracteres. El saldo inicial de un empleado
  se registra solo, con el motivo "Saldo inicial". La API rechaza motivos que no correspondan al tipo.
- **Maestros:** tabla de empleados (id, nombre, saldo y quién lo creó) con **buscador**, orden por
  nombre o saldo, filtro "Solo saldo bajo", paginación de 20 en 20 y enlace a los movimientos de
  cada empleado; diálogo para agregar un empleado con su saldo inicial.
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
- **Pensado para cientos de empleados.** Probado con 500 empleados y más de 20.000 movimientos:
  la búsqueda, la paginación y los filtros se resuelven en la base de datos, y la URL guarda el
  estado (se puede compartir un enlace a una búsqueda). La búsqueda ignora tildes y mayúsculas
  ("rios" encuentra a "Ríos") gracias a una columna con el nombre normalizado.
- **Un administrador no puede quitarse su propio rol**, para que el sistema no se quede sin
  administradores por accidente.
- **RLS activado en Supabase.** Las tablas tienen *Row Level Security* sin políticas, así la Data
  API pública de Supabase no puede leerlas (por ejemplo, los hashes de contraseña). La aplicación
  no se ve afectada porque Prisma se conecta como dueño de las tablas.

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
| `DATABASE_URL` | Conexión de la aplicación. En Supabase: *Transaction pooler* (puerto 6543) terminada en `?sslmode=require&uselibpqcompat=true`. |
| `DIRECT_URL` | Conexión para migraciones. En Supabase: *Session pooler* o conexión directa (puerto 5432). |
| `SESSION_SECRET` | Clave para firmar las sesiones. Generar con `openssl rand -base64 32`. |

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera el cliente de Prisma y compila para producción |
| `npm test` | Pruebas unitarias |
| `npm run lint` | Revisión de estilo con ESLint |
| `npm run db:seed` | Carga la empresa de demostración (**reemplaza todos los empleados y movimientos**) |

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

> **SSL:** con el driver `pg` instalado, `sslmode=require` por sí solo se interpreta como
> `verify-full` y falla con el certificado de Supabase. Por eso `DATABASE_URL` debe incluir
> `uselibpqcompat=true`, que conserva la conexión cifrada con el significado estándar de `require`.
