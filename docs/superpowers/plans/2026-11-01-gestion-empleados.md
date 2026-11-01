# Sistema de Gestión de Empleados — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir la base de clase en un sistema de banco de horas de empleados con autenticación JWT, roles ADMIN/USER, Maestros (empleados), Transacciones (movimientos de horas con gráfica), Usuarios y dashboard, listo para Vercel + Supabase.

**Architecture:** Lecturas en Server Components con Prisma directo; escrituras por Route Handlers bajo `app/api/**` seguidas de `router.refresh()`. Sesión en cookie httpOnly con JWT (`jose`), verificación optimista en `proxy.ts` y autorización real en cada página/endpoint vía `lib/session.ts`. Reglas de dominio puras en `lib/` probadas con Vitest.

**Tech Stack:** Next.js 16.3.4 (App Router, `proxy.ts`), React 19.2, Prisma 7.10 + `@prisma/adapter-pg`, PostgreSQL (Docker local → Supabase), shadcn/base-ui, Tailwind 4, react-hook-form + zod 4, sonner, Recharts (shadcn `chart`), `jose`, `bcryptjs`, Vitest, `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-01-gestion-empleados-design.md`

## Global Constraints

- Toda la interfaz en español con ortografía revisada (tildes: "sesión", "Contraseña", "Información", "Gestión", "Días"). Cada error cuesta 0.05 de nota.
- Antes de usar una API de Next, leer su guía en `node_modules/next/dist/docs/` (AGENTS.md). Confirmado: `proxy.ts` en la raíz exporta `proxy(request)` y `config.matcher`; corre en Node.js; `cookies()`, `params` y `searchParams` son promesas.
- Prisma solo detecta `prisma.config.ts` (no `prisma7.config.ts`). Cliente generado en `generated/prisma` (en `.gitignore`), importar desde `@/generated/prisma/client`.
- Variables de entorno: `DATABASE_URL` (app; en Supabase el pooler), `DIRECT_URL` (migraciones), `SESSION_SECRET` (≥ 32 caracteres).
- Respuestas de error de la API: `{ error: string }` con 400/401/403/404/500; mensajes en español.
- Zona horaria de negocio y de presentación: `America/Bogota`; fechas mostradas con `Intl.DateTimeFormat('es-CO', …)`.
- Horas como enteros. Cantidad de movimiento `1..1000`; saldo inicial `0..10000`; nombre de empleado 2–80 caracteres.
- Comentarios en español explicando lógica y decisiones (requisito de documentación), sin comentar lo obvio.
- Commits sin trailer `Co-Authored-By` ni atribución a Claude.
- Rutas del panel: `/inicio`, `/transacciones`, `/maestros`, `/usuarios`. Públicas: `/`, `/login`.

## Review Focus

1. **SALIDA mayor al saldo, incluida la carrera entre dos solicitudes simultáneas** → se rechaza con 400 "El empleado no tiene suficientes horas acumuladas" y el saldo nunca queda negativo. (Task 2: `applyMovement`; Task 6: decremento condicional dentro de la transacción.)
2. **Movimiento a las 23:30 hora Bogotá** (04:30 UTC del día siguiente) → cuenta para el día de Bogotá en la gráfica. (Task 2: prueba de zona horaria.)
3. **Cantidad `0`, negativa, decimal o texto enviada directo a la API** → 400 por zod, sin tocar la base. (Task 2: pruebas de esquemas.)
4. **USER que llama `POST /api/empleados` o `PATCH /api/usuarios/:id` con curl** → 403, aunque el botón esté oculto. (Task 5 y Task 7: verificación con curl.)
5. **Cookie manipulada o vencida, o usuario deshabilitado después de iniciar sesión** → tratado como sin sesión y redirigido a `/login`. (Task 3: pruebas de `verifySessionToken`; `getCurrentUser` filtra `enabled`/`deleted`.)
6. **ADMIN que se quita a sí mismo el rol ADMIN** → 400 "No puedes quitarte el rol de administrador". (Task 2: `canChangeRole`.)

---

## Estructura de archivos

```
prisma.config.ts                 (renombrado de prisma7.config.ts; DIRECT_URL, seed)
prisma/schema.prisma             (User, Profile, Employee, HourMovement)
prisma/migrations/<ts>_migracion-inicial/migration.sql (única migración)
prisma/seed.ts                   (usuarios, empleados y movimientos demo)
proxy.ts                         (redirecciones optimistas)
lib/prisma.ts                    (singleton, sin schema 'dev')
lib/balance.ts                   (dominio puro: saldo, serie diaria, cambio de rol)
lib/validation.ts                (esquemas zod compartidos cliente/servidor)
lib/session.ts                   (JWT, cookie, getCurrentUser, requireUser, requireAdmin)
lib/format.ts                    (formateo de fechas/horas es-CO)
app/page.tsx                     (landing)
app/layout.tsx                   (lang es, metadata, Toaster)
app/(auth)/login/page.tsx
app/(main)/layout.tsx            (sidebar real, breadcrumb, guarda de sesión)
app/(main)/inicio/page.tsx
app/(main)/transacciones/page.tsx
app/(main)/maestros/page.tsx
app/(main)/usuarios/page.tsx
app/api/auth/login/route.ts, app/api/auth/logout/route.ts
app/api/empleados/route.ts, app/api/movimientos/route.ts, app/api/usuarios/[id]/route.ts
components/login-form.tsx        (reescrito)
components/app-sidebar.tsx, components/nav-main.tsx, components/nav-user.tsx (reescritos)
components/page-header.tsx       (título + acción)
components/employees/{employees-table,create-employee-dialog}.tsx
components/movements/{employee-select,movements-table,create-movement-dialog,balance-chart}.tsx
components/users/{users-table,edit-role-dialog}.tsx
components/dashboard/{stat-card,recent-movements}.tsx
tests/balance.test.ts, tests/validation.test.ts, tests/session.test.ts
```

Se eliminan: `prisma7.config.ts`, migraciones antiguas, `app/(main)/home`, `app/(main)/users`, `app/api/{login,user,users}`, `components/users/{dialog,selectRole,table}`, `components/{team-switcher,nav-projects}.tsx`, `example.tsx`.

---

### Task 1: Base de datos, configuración y seed

**Files:**
- Create: `prisma.config.ts`, `prisma/seed.ts`, `.env.example`, `vitest.config.ts`, `prisma/migrations/<timestamp>_migracion-inicial/migration.sql`
- Modify: `prisma/schema.prisma`, `lib/prisma.ts`, `package.json`, `.gitignore`
- Delete: `prisma7.config.ts`, `prisma/migrations/20260910115247_inicial/`, `prisma/migrations/20260915115109_modelo_tienda/`

**Interfaces:**
- Produces: `prisma` (exportado de `lib/prisma.ts`); modelos `User`, `Profile`, `Employee { id, name, balance: Int, createdById, createdAt, updatedAt }`, `HourMovement { id, type: Enum_MovementType, quantity: Int, employeeId, createdById, createdAt }`; enums `Enum_Role { ADMIN USER }`, `Enum_MovementType { ENTRADA SALIDA }`. Relaciones con nombre: `User.employeesCreated`, `User.movementsCreated`, `Employee.movements`. Índice `@@index([employeeId, createdAt])` en `HourMovement`.
- Scripts npm: `dev`, `build` (`prisma generate && next build`), `postinstall` (`prisma generate`), `lint`, `test` (`vitest run`), `db:seed` (`tsx prisma/seed.ts`).

- [ ] **Step 1: Postgres local para desarrollo**

```bash
docker run -d --name empleados-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=empleados -p 5433:5432 postgres:16
```
Crear `.env` (no se versiona) con `DATABASE_URL` y `DIRECT_URL` = `postgresql://postgres:postgres@localhost:5433/empleados` y `SESSION_SECRET` generado con `openssl rand -base64 32`. Crear `.env.example` con las tres claves y comentarios que expliquen pooler vs. conexión directa de Supabase. Añadir `!.env.example` al `.gitignore` (hoy `.env*` lo ignora).

- [ ] **Step 2: Dependencias**

```bash
npm install jose bcryptjs
npm install -D vitest tsx @types/bcryptjs
npx shadcn@latest add chart badge
```
Expected: `recharts` aparece en `package.json` y existen `components/ui/chart.tsx` y `components/ui/badge.tsx`.

- [ ] **Step 3: Esquema y configuración**

`prisma/schema.prisma`: conservar `generator` y `datasource`; dejar solo `Enum_Role`, `Enum_MovementType`, `User` (más relaciones), `Profile`, `Employee`, `HourMovement` según la sección 3 del spec. `prisma.config.ts`: mismo contenido que `prisma7.config.ts` pero `datasource.url = process.env['DIRECT_URL']` y `migrations.seed = 'tsx prisma/seed.ts'`. `lib/prisma.ts`: `new PrismaPg({ connectionString })` sin opción `schema`; reutilizar la instancia vía `globalThis` fuera de producción.

- [ ] **Step 4: Migración única**

```bash
rm -rf prisma/migrations/2026091*
npx prisma migrate dev --name migracion-inicial
```
Expected: se crea una sola carpeta `*_migracion-inicial` con `CREATE TABLE "Employee"` y `"HourMovement"`; ninguna tabla de tienda.

- [ ] **Step 5: Seed**

`prisma/seed.ts` (idempotente: `upsert` por correo; borra y recrea empleados/movimientos demo):
- `admin@empresa.com` / `Admin123*` (ADMIN, "Laura Restrepo"), `usuario@empresa.com` / `Usuario123*` (USER, "Andrés Mejía"), `usuario2@empresa.com` / `Usuario123*` (USER, "Camila Ortiz"); contraseñas con `bcrypt.hash(pwd, 10)`; cada uno con `Profile` (`image` = `https://i.pravatar.cc/150?u=<correo>`, dirección y teléfono ficticios).
- 5 empleados creados por el admin, con 10–20 movimientos cada uno repartidos en los últimos 30 días, alternando responsables; `balance` = suma real de sus movimientos (nunca negativo en ningún punto).

Run: `npm run db:seed` → Expected: sin errores; `npx prisma studio` muestra 3 usuarios y 5 empleados.

- [ ] **Step 6: Verificar y commit**

Run: `npx prisma validate && npx tsc --noEmit` → Expected: sin errores (las páginas viejas que importan modelos borrados se eliminan en tareas siguientes; si `tsc` falla solo por `app/page.tsx` o `app/(main)/users`, borrar ya esos archivos).

```bash
git add -A ':!Proyecto 2.pdf'
git commit -m "feat: esquema de banco de horas, migración inicial y seed"
```

---

### Task 2: Reglas de dominio y validación (TDD)

**Files:**
- Create: `lib/balance.ts`, `lib/validation.ts`, `tests/balance.test.ts`, `tests/validation.test.ts`

**Interfaces:**
- Produces:
  - `type MovementType = 'ENTRADA' | 'SALIDA'`
  - `signedQuantity(type: MovementType, quantity: number): number`
  - `applyMovement(balance: number, type: MovementType, quantity: number): { ok: true; balance: number } | { ok: false; error: string }`
  - `buildDailyBalanceSeries(movements: { type: MovementType; quantity: number; createdAt: Date }[], timeZone = 'America/Bogota'): { date: string; balance: number }[]` — fechas `YYYY-MM-DD`, un punto por día con movimientos, saldo al cierre del día, entrada en cualquier orden.
  - `canChangeRole(actorId: string, targetId: string, newRole: 'ADMIN' | 'USER'): { ok: true } | { ok: false; error: string }`
  - `INSUFFICIENT_HOURS_ERROR = 'El empleado no tiene suficientes horas acumuladas'`, `SELF_DEMOTION_ERROR = 'No puedes quitarte el rol de administrador'`
  - `loginSchema { email, password }`, `employeeSchema { name, initialBalance }`, `movementSchema { employeeId, type, quantity }`, `roleSchema { role }` con sus tipos inferidos `LoginInput`, `EmployeeInput`, `MovementInput`, `RoleInput`. Números con `z.coerce.number().int()`.

- [ ] **Step 1: Pruebas que fallan**

`tests/balance.test.ts`:
```ts
expect(applyMovement(10, 'ENTRADA', 8)).toEqual({ ok: true, balance: 18 });
expect(applyMovement(10, 'SALIDA', 10)).toEqual({ ok: true, balance: 0 });
expect(applyMovement(10, 'SALIDA', 11)).toEqual({ ok: false, error: INSUFFICIENT_HOURS_ERROR });

// zona horaria: 2026-10-31T04:30Z es 2026-10-30 23:30 en Bogotá
expect(buildDailyBalanceSeries([
  { type: 'ENTRADA', quantity: 8, createdAt: new Date('2026-10-31T04:30:00Z') },
  { type: 'ENTRADA', quantity: 4, createdAt: new Date('2026-10-29T15:00:00Z') },
  { type: 'SALIDA',  quantity: 2, createdAt: new Date('2026-10-31T15:00:00Z') },
])).toEqual([
  { date: '2026-10-29', balance: 4 },
  { date: '2026-10-30', balance: 12 },
  { date: '2026-10-31', balance: 10 },
]);
expect(buildDailyBalanceSeries([])).toEqual([]);

expect(canChangeRole('a', 'a', 'USER')).toEqual({ ok: false, error: SELF_DEMOTION_ERROR });
expect(canChangeRole('a', 'a', 'ADMIN')).toEqual({ ok: true });
expect(canChangeRole('a', 'b', 'USER')).toEqual({ ok: true });
```

`tests/validation.test.ts`: `movementSchema.safeParse` falla con `quantity` `0`, `-3`, `1.5`, `'abc'`, `1001` y con `type: 'OTRO'`; acepta `{ employeeId: 'x', type: 'SALIDA', quantity: '4' }` y lo convierte a `4`. `employeeSchema` falla con `name: 'A'`, `initialBalance: -1`; acepta `{ name: 'Ana Gómez', initialBalance: 0 }`. `loginSchema` falla con correo inválido o contraseña vacía.

- [ ] **Step 2: Verificar que fallan**

Run: `npm test` → Expected: FAIL (módulos `@/lib/balance` y `@/lib/validation` no existen). `vitest.config.ts` debe resolver el alias `@` a la raíz.

- [ ] **Step 3: Implementar `lib/balance.ts` y `lib/validation.ts`**

Fecha local con `new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)` (produce `YYYY-MM-DD`). Mensajes zod en español ("La cantidad debe ser un número entero mayor que cero", etc.).

- [ ] **Step 4: Verificar que pasan**

Run: `npm test` → Expected: PASS, todas.

- [ ] **Step 5: Commit**

```bash
git add lib/balance.ts lib/validation.ts tests vitest.config.ts
git commit -m "feat: reglas de saldo, serie diaria y validaciones"
```

---

### Task 3: Autenticación (sesión, login, logout, proxy)

**Files:**
- Create: `lib/session.ts`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `proxy.ts`, `tests/session.test.ts`
- Modify: `components/login-form.tsx` (reescritura), `app/(auth)/login/page.tsx`
- Delete: `app/api/login/`, `app/api/user/`, `app/api/users/`

**Interfaces:**
- Consumes: `loginSchema` (Task 2), `prisma` (Task 1).
- Produces (`lib/session.ts`):
  - `SESSION_COOKIE = 'session'`, `SESSION_MAX_AGE = 60 * 60 * 24 * 3`
  - `signSessionToken(payload: { userId: string; role: 'ADMIN' | 'USER' }): Promise<string>`
  - `verifySessionToken(token: string | undefined): Promise<{ userId: string; role: 'ADMIN' | 'USER' } | null>` — nunca lanza.
  - `type CurrentUser = { id: string; name: string; lastName: string | null; email: string; role: 'ADMIN' | 'USER'; image: string | null }`
  - `getCurrentUser(): Promise<CurrentUser | null>` — lee cookie, verifica, consulta la BD (`enabled: true, deleted: false`).
  - `requireUser(): Promise<CurrentUser>` — para páginas: `redirect('/login')` si no hay sesión.
  - `requireAdmin(): Promise<CurrentUser>` — para páginas: `redirect('/inicio')` si no es ADMIN.
  - `apiUser(): Promise<CurrentUser | NextResponse>` y `apiAdmin(): Promise<CurrentUser | NextResponse>` — para route handlers: devuelven `NextResponse` 401/403 que el handler retorna tal cual.

- [ ] **Step 1: Pruebas que fallan** (`tests/session.test.ts`, con `process.env.SESSION_SECRET` fijado en la prueba)

```ts
const token = await signSessionToken({ userId: 'u1', role: 'ADMIN' });
expect(await verifySessionToken(token)).toEqual({ userId: 'u1', role: 'ADMIN' });
expect(await verifySessionToken(token.slice(0, -2) + 'xx')).toBeNull(); // manipulado
expect(await verifySessionToken(undefined)).toBeNull();
expect(await verifySessionToken('basura')).toBeNull();
// vencido: firmar con exp en el pasado usando SignJWT directamente → null
```

- [ ] **Step 2: Verificar que fallan** — Run: `npm test -- session` → Expected: FAIL.

- [ ] **Step 3: Implementar `lib/session.ts`**

HS256 con `jose` (`SignJWT`, `jwtVerify`), clave `new TextEncoder().encode(process.env.SESSION_SECRET)`, `sub` = userId, claim `role`, `setExpirationTime('3d')`. Importar `server-only` no es necesario; las funciones que usan `cookies()`/`prisma` se importan solo desde servidor.

- [ ] **Step 4: Verificar que pasan** — Run: `npm test` → Expected: PASS.

- [ ] **Step 5: Endpoints**

- `POST /api/auth/login`: valida con `loginSchema` (400), busca usuario habilitado y no eliminado, `bcrypt.compare`; si falla → 401 `{ error: 'Correo o contraseña incorrectos' }`; si funciona → firma token, `(await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_MAX_AGE })`, responde 200 `{ ok: true }`.
- `POST /api/auth/logout`: borra la cookie, 200 `{ ok: true }`.

- [ ] **Step 6: `proxy.ts`**

`export async function proxy(request: NextRequest)`; `config.matcher = ['/inicio/:path*', '/transacciones/:path*', '/maestros/:path*', '/usuarios/:path*', '/login']`. Sin token válido en rutas del panel → redirect a `/login`; con token válido en `/login` → redirect a `/inicio`. Comentario: es una comprobación optimista; la autorización real está en `requireUser`/`requireAdmin`.

- [ ] **Step 7: Formulario de login**

Reescribir `components/login-form.tsx` con react-hook-form + `zodResolver(loginSchema)`: campos "Correo electrónico" y "Contraseña", botón "Iniciar sesión" con `Spinner` mientras envía, `toast.error(body.error)` si falla, `router.replace('/inicio')` + `router.refresh()` si funciona. Quitar login social, "Forgot your password?", "Sign up", términos y la imagen `/placeholder.svg`; en su lugar, panel lateral con el nombre del sistema y una frase breve. Usar `cn` de `@/lib/utils` (no el paquete `cn`).

- [ ] **Step 8: Verificar**

Run: `npm run dev`, luego:
```bash
curl -i -X POST localhost:3000/api/auth/login -H 'content-type: application/json' -d '{"email":"admin@empresa.com","password":"mala"}'      # 401
curl -i -X POST localhost:3000/api/auth/login -H 'content-type: application/json' -d '{"email":"admin@empresa.com","password":"Admin123*"}' # 200 + Set-Cookie: session=...; HttpOnly
curl -i localhost:3000/inicio   # 307 → /login
```

- [ ] **Step 9: Commit** — `git commit -m "feat: autenticación con sesión JWT en cookie y proxy"`

---

### Task 4: Landing, layout del panel y sidebar

**Files:**
- Modify: `app/page.tsx`, `app/layout.tsx`, `app/(main)/layout.tsx`, `components/app-sidebar.tsx`, `components/nav-main.tsx`, `components/nav-user.tsx`
- Create: `components/page-header.tsx`, `lib/format.ts`
- Delete: `components/team-switcher.tsx`, `components/nav-projects.tsx`, `example.tsx`, `app/(main)/home/`, `app/(main)/users/`, `components/users/dialog/`, `components/users/selectRole/`, `components/users/table/`

**Interfaces:**
- Consumes: `getCurrentUser`, `requireUser`, `CurrentUser` (Task 3).
- Produces:
  - `AppSidebar({ user }: { user: CurrentUser })` — enlaces Inicio (`/inicio`), Transacciones (`/transacciones`), Maestros (`/maestros`), Usuarios (`/usuarios`, solo si `user.role === 'ADMIN'`); ítem activo según `usePathname()`.
  - `NavUser({ user })` — avatar (`image` o iniciales), nombre completo, correo, rol; menú con "Cerrar sesión" que hace `POST /api/auth/logout` y `router.replace('/login')`.
  - `PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode })`
  - `formatDate(date: Date | string): string` (`dd/mm/aaaa, hh:mm` es-CO, America/Bogota), `formatHours(n: number): string` (`"12 h"`), `initials(name: string, lastName?: string | null): string`.

- [ ] **Step 1:** `app/layout.tsx`: `lang="es"`, `metadata` = `{ title: 'Gestión de Empleados · Banco de horas', description: 'Registro de horas trabajadas y administración de empleados' }`, `<Toaster richColors />` aquí (quitarlo del layout `(main)`).
- [ ] **Step 2:** `app/(main)/layout.tsx` como Server Component async: `const user = await requireUser()`; pasa `user` a `AppSidebar`. Encabezado con `SidebarTrigger` y breadcrumb "Panel / <sección>" (componente cliente pequeño que mapea el pathname a título). Contenedor `p-4 md:p-6` sin desbordamiento horizontal.
- [ ] **Step 3:** Reescribir sidebar: cabecera con ícono y "Banco de horas"; `NavMain` plano (sin collapsibles) con íconos Tabler (`IconLayoutDashboard`, `IconArrowsExchange`, `IconUsersGroup`, `IconUserShield`); pie con `NavUser`.
- [ ] **Step 4:** Landing `app/page.tsx` (Server Component): si `getCurrentUser()` existe, botón "Ir al panel" → `/inicio`; si no, "Iniciar sesión" → `/login`. Hero con título, descripción del banco de horas y tres tarjetas de características (Registro de horas, Saldos y gráficas, Roles y permisos). Responsive en 360 px.
- [ ] **Step 5: Verificar** — `npx tsc --noEmit && npm run lint` sin errores; en el navegador: login como admin ve 4 enlaces, como usuario ve 3; "Cerrar sesión" vuelve a `/login` y `/inicio` redirige a login.
- [ ] **Step 6: Commit** — `git commit -m "feat: landing, layout del panel y sidebar por rol"`

---

### Task 5: Maestros (empleados)

**Files:**
- Create: `app/(main)/maestros/page.tsx`, `app/api/empleados/route.ts`, `components/employees/employees-table.tsx`, `components/employees/create-employee-dialog.tsx`

**Interfaces:**
- Consumes: `requireUser`, `apiAdmin` (Task 3); `employeeSchema` (Task 2); `PageHeader`, `formatHours`, `formatDate` (Task 4).
- Produces: `POST /api/empleados` body `EmployeeInput` → 201 `{ employee }`; 400/401/403.
- `type EmployeeRow = { id: string; name: string; balance: number; createdAt: Date; createdBy: { name: string; lastName: string | null; email: string } }`

- [ ] **Step 1:** `POST /api/empleados`: `apiAdmin()`; `employeeSchema.safeParse` (400 con primer mensaje); `prisma.$transaction`: crea `Employee` con `balance = initialBalance` y, si `initialBalance > 0`, `HourMovement` ENTRADA por esa cantidad con `createdById = user.id`. 201.
- [ ] **Step 2:** Página: `requireUser()`; `prisma.employee.findMany({ orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { name, lastName, email } } } })`. `PageHeader` "Maestros de empleados" con acción `<CreateEmployeeDialog />` solo si ADMIN.
- [ ] **Step 3:** Tabla: columnas "ID" (truncado a 8 caracteres con `title` completo), "Nombre", "Saldo" (`formatHours`, badge si < 8 h), "Creado por". Estado vacío "Aún no hay empleados registrados." Contenedor con `overflow-x-auto` para móvil.
- [ ] **Step 4:** Diálogo "Agregar empleado": inputs "Nombre completo" y "Saldo inicial (horas)", botones "Cancelar" (cierra y resetea) y "Crear" (spinner, deshabilitado mientras envía). Éxito: `toast.success('Empleado creado correctamente')`, cerrar, `form.reset()`, `router.refresh()`. Error: `toast.error(body.error)`, diálogo abierto. El `<form>` va dentro de `DialogContent` (en la base está fuera y el submit no se asocia bien).
- [ ] **Step 5: Verificar** — como ADMIN crear "Ana Gómez" con 40 h → aparece en tabla con 40 h; como USER no hay botón y:
```bash
curl -i -X POST localhost:3000/api/empleados -H 'content-type: application/json' -b 'session=<token USER>' -d '{"name":"X Y","initialBalance":1}'  # 403
```
- [ ] **Step 6: Commit** — `git commit -m "feat: página de maestros con creación de empleados para ADMIN"`

---

### Task 6: Transacciones (movimientos de horas y gráfica)

**Files:**
- Create: `app/(main)/transacciones/page.tsx`, `app/api/movimientos/route.ts`, `components/movements/employee-select.tsx`, `components/movements/movements-table.tsx`, `components/movements/create-movement-dialog.tsx`, `components/movements/balance-chart.tsx`

**Interfaces:**
- Consumes: `requireUser`, `apiUser` (Task 3); `movementSchema`, `buildDailyBalanceSeries`, `signedQuantity`, `INSUFFICIENT_HOURS_ERROR` (Task 2); `PageHeader`, `formatDate`, `formatHours` (Task 4); `components/ui/chart.tsx` (Task 1).
- Produces: `POST /api/movimientos` body `MovementInput` → 201 `{ movement, balance }`; 400/401/404.
- `EmployeeSelect({ employees, selectedId }: { employees: { id: string; name: string }[]; selectedId: string })` — cambia `?empleado=` con `router.push`.
- `CreateMovementDialog({ employee }: { employee: { id: string; name: string } })`
- `BalanceChart({ data }: { data: { date: string; balance: number }[] })`

- [ ] **Step 1:** `POST /api/movimientos`: `apiUser()`; validar (400). En `prisma.$transaction`: para `SALIDA`, `tx.employee.updateMany({ where: { id, balance: { gte: quantity } }, data: { balance: { decrement: quantity } } })` y si `count === 0` → distinguir 404 (no existe) de 400 `INSUFFICIENT_HOURS_ERROR`; para `ENTRADA`, `update` con `increment` (404 si no existe). Luego crear `HourMovement` con `createdById = user.id`. Comentario explicando que el `updateMany` condicional evita saldos negativos por solicitudes concurrentes.
- [ ] **Step 2:** Página: `searchParams: Promise<{ empleado?: string }>`; carga empleados (`id, name, balance`, orden por nombre). Sin empleados → estado vacío con enlace a `/maestros`. Id ausente o inexistente → usar el primero. Carga movimientos del seleccionado (`orderBy createdAt desc`, `include createdBy`) y calcula `buildDailyBalanceSeries` sobre ellos.
- [ ] **Step 3:** Encabezado: "Transacciones" + `EmployeeSelect` + `CreateMovementDialog`; tarjeta con saldo actual del empleado.
- [ ] **Step 4:** Tabla: "ID", "Fecha", "Tipo" (badge Entrada/Salida), "Horas" (`+8 h` / `−4 h`), "Responsable" (nombre y correo). Estado vacío "Este empleado aún no tiene movimientos."
- [ ] **Step 5:** Diálogo título "Agregar movimiento · {employee.name}": `Select` "Tipo de movimiento" (Entrada — horas trabajadas o extra / Salida — ausencias o permisos), input "Cantidad de horas"; "Cancelar" y "Crear" con el mismo comportamiento de loading/toast/cierre/refresh que Task 5 (`toast.success('Movimiento registrado correctamente')`).
- [ ] **Step 6:** `BalanceChart`: shadcn `ChartContainer` + Recharts `AreaChart` (eje X con fecha `dd MMM` es-CO, eje Y en horas, tooltip con "Saldo: N h"), `type="stepAfter"`; título "Evolución del saldo diario"; si `data.length === 0`, mensaje en lugar de gráfica. Archivo con `'use client'`.
- [ ] **Step 7: Verificar** — con empleado de 10 h: SALIDA de 11 → toast "El empleado no tiene suficientes horas acumuladas" y diálogo abierto; SALIDA de 4 → tabla y gráfica se actualizan y saldo 6 h; como USER también puede crear movimientos; `?empleado=inexistente` muestra el primero.
- [ ] **Step 8: Commit** — `git commit -m "feat: transacciones de horas con validación de saldo y gráfica diaria"`

---

### Task 7: Usuarios (solo ADMIN)

**Files:**
- Create: `app/(main)/usuarios/page.tsx`, `app/api/usuarios/[id]/route.ts`, `components/users/users-table.tsx`, `components/users/edit-role-dialog.tsx`

**Interfaces:**
- Consumes: `requireAdmin`, `apiAdmin` (Task 3); `roleSchema`, `canChangeRole` (Task 2); `PageHeader`, `formatDate` (Task 4).
- Produces: `PATCH /api/usuarios/[id]` body `RoleInput` → 200 `{ user: { id, email, role } }`; 400/401/403/404. Tipar el contexto con `RouteContext<'/api/usuarios/[id]'>` y `await ctx.params`.
- `EditRoleDialog({ user }: { user: { id: string; email: string; role: 'ADMIN' | 'USER' } })`

- [ ] **Step 1:** Endpoint: `apiAdmin()`; validar; `canChangeRole(actor.id, id, role)` → 400 con su error; 404 si no existe; actualizar y responder sin `password`.
- [ ] **Step 2:** Página: `requireAdmin()`; usuarios no eliminados ordenados por `createdAt`; tabla "ID", "Fecha de creación", "Correo", "Rol" (badge "Administrador"/"Usuario"), acción "Editar usuario".
- [ ] **Step 3:** Diálogo "Editar usuario": texto con el correo, `Select` "Rol" con valor inicial el rol actual (opciones Administrador/Usuario), "Cancelar" y "Guardar" con loading/toast (`'Rol actualizado correctamente'`)/cierre/refresh.
- [ ] **Step 4: Verificar** — cambiar a `usuario2` a ADMIN y de vuelta; intentar quitarse el rol propio → toast de error; como USER, `/usuarios` redirige a `/inicio` y `curl -X PATCH ... -b 'session=<token USER>'` → 403.
- [ ] **Step 5: Commit** — `git commit -m "feat: gestión de roles de usuarios para ADMIN"`

---

### Task 8: Dashboard de inicio

**Files:**
- Create: `app/(main)/inicio/page.tsx`, `components/dashboard/stat-card.tsx`, `components/dashboard/recent-movements.tsx`

**Interfaces:**
- Consumes: `requireUser` (Task 3); `formatDate`, `formatHours` (Task 4).
- Produces: `StatCard({ title, value, description, icon }: { title: string; value: string; description?: string; icon: React.ReactNode })`.

- [ ] **Step 1:** Página: saludo "Hola, {nombre}"; consultas en `Promise.all`: `employee.count()`, `employee.aggregate({ _sum: { balance } })`, `hourMovement.count` con `createdAt >=` inicio del día de hoy en Bogotá (calcular el instante UTC equivalente a 00:00 America/Bogota, UTC−5 sin horario de verano), `employee.findMany({ where: { balance: { lt: 8 } } })`, últimos 5 movimientos con empleado y responsable.
- [ ] **Step 2:** Cuatro `StatCard` en grid `sm:grid-cols-2 lg:grid-cols-4`: "Empleados", "Horas acumuladas", "Movimientos de hoy", "Saldo bajo (< 8 h)". Debajo, lista de empleados con saldo bajo (enlace a `/transacciones?empleado=id`) y tabla de movimientos recientes.
- [ ] **Step 3: Verificar** — los números coinciden con Prisma Studio; tras crear un movimiento, "Movimientos de hoy" sube en 1.
- [ ] **Step 4: Commit** — `git commit -m "feat: dashboard de inicio con indicadores"`

---

### Task 9: README, revisión final y despliegue

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README** en español: propósito (banco de horas y mapeo Maestro→Empleado), integrantes (**pedir los nombres al equipo**), credenciales demo de Task 1, stack, estructura de carpetas, roles y permisos (tabla del spec), cómo ejecutar local (Docker, `.env`, `npx prisma migrate dev`, `npm run db:seed`, `npm run dev`, `npm test`), despliegue (Supabase + Vercel), URL `https://winnerteam-empleados.vercel.app`.
- [ ] **Step 2: Verificación completa**

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```
Expected: todo sin errores. Revisar ortografía de todos los textos visibles (`grep -rn "'" app components` sobre cadenas en inglés residuales: "Submit", "Reset", "Login", "Create", "Actions").
- [ ] **Step 3: Responsive** — revisar landing, login y las 4 páginas a 375 px de ancho: sin scroll horizontal de página, sidebar como hoja, tablas con scroll interno.
- [ ] **Step 4: Supabase** (cuando el equipo cree el proyecto): `DIRECT_URL` = conexión directa (puerto 5432), `DATABASE_URL` = pooler de transacciones (puerto 6543; con `@prisma/adapter-pg` no hace falta `?pgbouncer=true`); `npx prisma migrate deploy && npm run db:seed` contra Supabase.
- [ ] **Step 5: Vercel** — importar el repo `winnerteam-empleados`, nombre de proyecto `winnerteam-empleados`, variables `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`; desplegar y repetir la verificación manual de Tasks 3–8 en producción con ambos roles.
- [ ] **Step 6: Commit y push** — `git commit -m "docs: README del proyecto"` y `git push origin main` (con confirmación del equipo).
