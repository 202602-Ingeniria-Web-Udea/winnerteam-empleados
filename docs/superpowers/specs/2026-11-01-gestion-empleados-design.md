# Sistema de Gestión de Empleados — Diseño

Fecha: 2026-11-01 · Entrega: 2026-11-02 23:59 · Base: `202602-Ingeniria-Web-Udea/base-app`

## 1. Propósito

Aplicación web de administración de recursos humanos construida sobre la base de clase
(Next.js 16.3, React 19, Prisma 7 + `@prisma/adapter-pg`, shadcn/base-ui, Tailwind 4,
react-hook-form, zod, sonner) y desplegada en Vercel con base de datos en Supabase.

El molde genérico del enunciado (Maestro con saldo + Movimientos de entrada/salida +
gráfica de saldo diario) se mapea a un **banco de horas**:

| Concepto del enunciado | En este sistema |
|---|---|
| Maestro | Empleado |
| Saldo del maestro | Horas acumuladas del empleado |
| Movimiento ENTRADA | Horas trabajadas o extra (suman) |
| Movimiento SALIDA | Horas descontadas: ausencias, permisos (restan) |
| Gráfica de saldos diarios | Evolución diaria de las horas acumuladas del empleado |

Criterios de éxito: todas las funcionalidades y reglas de rol del enunciado operan en el
despliegue de Vercel; sin errores de ortografía en la interfaz; README completo.

## 2. Arquitectura y flujo de datos

- **Lecturas:** Server Components consultan Prisma directamente (sin `fetch` a
  `http://localhost:3000`, que falla en Vercel).
- **Escrituras:** API Route Handlers bajo `app/api/**` (patrón visto en clase). El cliente
  hace `fetch`, muestra loading y toast de éxito/error, cierra el diálogo y llama
  `router.refresh()` para que la tabla y la gráfica se actualicen.
- **Autorización:** cada página y cada endpoint obtiene la sesión en el servidor y valida el
  rol. Ocultar botones en la UI es complementario, nunca la única protección.
- **Lógica de dominio pura** (serie de saldos diarios, validación de saldo) vive en
  `lib/` como funciones sin dependencias de Prisma, para poder probarlas con Vitest.

## 3. Modelo de datos (Prisma)

Se eliminan los modelos de tienda (Customer, Product, Category, Supplier, Order, OrderItem,
Payment y sus enums) y las migraciones existentes; se genera una única migración
`migracion-inicial`, como indica el enunciado.

```prisma
enum Enum_Role { ADMIN USER }
enum Enum_MovementType { ENTRADA SALIDA }

model User {
  id, name, email @unique, lastName?, password (hash bcrypt),
  deleted, enabled, createdAt, updatedAt, role @default(USER),
  profile Profile?, employeesCreated Employee[], movementsCreated HourMovement[]
}

model Profile {   // sin cambios; image = URL de la foto del sidebar
  id, address, phone, image, createdAt, updatedAt, userId @unique
}

model Employee {
  id String @id @default(cuid())
  name String
  balance Int @default(0)          // saldo en horas, caché de la suma de movimientos
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy User @relation(...); createdById String
  movements HourMovement[]
}

model HourMovement {
  id String @id @default(cuid())
  type Enum_MovementType
  quantity Int                     // horas enteras, > 0
  createdAt DateTime @default(now())
  employee Employee @relation(...); employeeId String
  createdBy User @relation(...); createdById String
  @@index([employeeId, createdAt])
}
```

**Reglas de negocio**

1. Crear un empleado con saldo inicial `N` crea, en una sola `prisma.$transaction`, el
   empleado con `balance = N` y, si `N > 0`, un movimiento `ENTRADA` de `N` horas
   registrado por el usuario en sesión. Así la gráfica parte del valor correcto.
2. Crear un movimiento actualiza `balance` (`increment`/`decrement`) en la misma
   transacción.
3. Una `SALIDA` con `quantity > balance` se rechaza con HTTP 400 y mensaje
   "El empleado no tiene suficientes horas acumuladas". La validación se hace dentro de la
   transacción para evitar condiciones de carrera.
4. `quantity` y saldo inicial: enteros, cantidad `>= 1`, saldo inicial `>= 0`; nombre de
   2 a 80 caracteres. Validación con zod en cliente y servidor (mismo esquema compartido).

## 4. Autenticación y roles

- `POST /api/auth/login`: busca el usuario por correo (`enabled` y no `deleted`), compara
  con `bcryptjs`, firma un JWT HS256 con `jose` (`{ sub: userId, role }`, expira en 3 días)
  y lo guarda en la cookie `session` (`httpOnly`, `secure` en producción,
  `sameSite=lax`, `path=/`). Errores devuelven un mensaje genérico
  "Correo o contraseña incorrectos" (no revela si el correo existe).
- `POST /api/auth/logout`: borra la cookie.
- `lib/session.ts`: `createSession`, `getSession()` (lee y verifica la cookie, devuelve
  `{ userId, role } | null`), `requireUser()` y `requireAdmin()` para páginas y endpoints.
  El rol se vuelve a leer de la base en cada solicitud protegida, de modo que un cambio de
  rol aplica de inmediato.
- `proxy.ts` (convención de Next 16 que reemplaza a `middleware.ts`; confirmar en
  `node_modules/next/dist/docs/` antes de implementar): redirige a `/login` las rutas del
  panel sin cookie válida y redirige `/login` a `/inicio` si ya hay sesión.
- Secreto: variable de entorno `SESSION_SECRET`.
- Matriz de permisos:

| Recurso | ADMIN | USER |
|---|---|---|
| `/inicio`, `/transacciones`, `/maestros` (ver) | Sí | Sí |
| Crear movimiento (`POST /api/movimientos`) | Sí | Sí |
| Crear empleado (`POST /api/empleados`) y ver botón "Agregar" | Sí | No (403) |
| `/usuarios` y `PATCH /api/usuarios/[id]` | Sí | No (redirección / 403) |

- No hay registro público: `prisma/seed.ts` crea 1 ADMIN y 2 USER con contraseñas
  hasheadas, fotos de perfil y algunos empleados y movimientos de ejemplo. Las
  credenciales se documentan en el README.

## 5. Páginas y componentes

Toda la interfaz en español. Se eliminan los datos de ejemplo de shadcn
(`team-switcher`, `nav-projects`, menú "Upgrade to Pro", etc.), `app/(main)/users/**`,
`components/users/**` y `example.tsx`.

- **`/` Landing:** presentación del sistema y botón "Iniciar sesión" (o "Ir al panel" si
  hay sesión).
- **`/login`:** `login-form.tsx` reescrito con react-hook-form + zod, envío real,
  spinner, toast de error y redirección a `/inicio`. Sin botones de login social.
- **Layout `(main)`:** sidebar fijo (`collapsible="icon"`, se vuelve hoja en móvil) con
  foto (`Profile.image` o iniciales), nombre y correo; enlaces Inicio, Transacciones,
  Maestros y Usuarios (este último solo ADMIN); "Cerrar sesión". Encabezado con
  breadcrumb del título de la página actual.
- **`/inicio` Dashboard:** tarjetas con total de empleados, horas acumuladas totales,
  movimientos de hoy y empleados con saldo bajo (< 8 h); tabla con los 5 últimos
  movimientos.
- **`/transacciones?empleado=<id>`:** dropdown de empleados (cambia el query param;
  por defecto el primero); tabla con id, fecha, tipo, horas (con signo) y responsable;
  botón "Agregar movimiento" → diálogo titulado con el nombre del empleado, campos tipo
  (Entrada/Salida) y cantidad de horas, botones Cancelar y Crear (loading + toast; si
  tiene éxito cierra y refresca). Gráfica de área (componente `chart` de shadcn sobre
  Recharts) con el saldo al cierre de cada día. Estado vacío si no hay empleados.
- **`/maestros`:** tabla con id, nombre, saldo (horas) y creado por; botón "Agregar"
  solo para ADMIN → diálogo con nombre y saldo inicial, Cancelar y Crear (loading + toast,
  cierra y refresca).
- **`/usuarios` (solo ADMIN):** tabla con id, fecha de creación, correo y rol; botón
  "Editar usuario" por fila → diálogo con el correo, dropdown de roles preseleccionado,
  Cancelar y Guardar (loading + toast, cierra y refresca). Un ADMIN no puede quitarse a sí
  mismo el rol ADMIN (evita quedarse sin administradores).

**Serie de saldos diarios** (`lib/balance.ts`): a partir de los movimientos ordenados por
fecha, agrupa por día calendario en zona `America/Bogota`, acumula
`ENTRADA = +quantity`, `SALIDA = -quantity` y devuelve `[{ date: 'YYYY-MM-DD', balance }]`
con un punto por día con movimientos.

## 6. Manejo de errores

- Endpoints: 400 validación/regla de negocio (mensaje en español), 401 sin sesión,
  403 rol insuficiente, 404 recurso inexistente, 500 inesperado (se registra con
  `console.error`, mensaje genérico al cliente). Formato `{ error: string }`.
- Cliente: el toast muestra `error` del cuerpo; el diálogo permanece abierto en caso de
  error y el botón vuelve a habilitarse.

## 7. Configuración y despliegue

- `lib/prisma.ts`: quitar `schema: 'dev'` (Supabase usa `public`); singleton en
  desarrollo para evitar múltiples clientes con hot reload.
- Variables: `DATABASE_URL` (pooler de Supabase, para la app), `DIRECT_URL` (conexión
  directa, para migraciones), `SESSION_SECRET`. Se documentan en `.env.example`.
- Verificar si Prisma 7 detecta `prisma7.config.ts`; si no, renombrar a
  `prisma.config.ts`.
- `package.json`: `postinstall: prisma generate` (el cliente generado está en
  `.gitignore`), script `seed` y `test`.
- Metadata del sitio en español (`lang="es"`, título y descripción reales).

## 8. Pruebas y verificación

- Vitest para `lib/balance.ts` (serie diaria, cambio de día en zona horaria, días sin
  movimientos) y para la regla de saldo insuficiente.
- `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- Prueba manual end-to-end contra Supabase con ambos roles: login/logout, protección de
  rutas, crear empleado (ADMIN), botón oculto y 403 (USER), crear movimiento ENTRADA y
  SALIDA, rechazo de SALIDA sin saldo, gráfica, cambio de rol, dashboard, responsive en
  ancho de móvil.

## 9. Fuera de alcance

Registro público de usuarios, recuperación de contraseña, edición/eliminación de
empleados y movimientos, nómina en dinero, evaluación de desempeño, horas fraccionarias.
