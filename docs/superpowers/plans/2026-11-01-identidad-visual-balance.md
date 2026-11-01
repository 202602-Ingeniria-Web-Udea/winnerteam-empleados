# Identidad visual "Balance" — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar la identidad "Balance" (paleta bosque y arcilla, Fraunces + Instrument Sans, monograma "b", fotos cálidas) a landing, login, panel, 404 y error, sin tocar funcionalidad.

**Architecture:** Los colores viven como variables CSS de shadcn en `app/globals.css`, así todos los componentes existentes los heredan; la marca es un componente SVG reutilizable; las fotos son archivos locales servidos con `next/image`.

**Tech Stack:** Next.js 16.3 (`next/font/google`, `next/image`, `app/icon.svg`), Tailwind 4 (`@theme inline`), shadcn/base-ui, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-01-identidad-visual-balance-design.md`

## Global Constraints

- Nombre del producto: **Balance** (sin tilde); subtítulo "Banco de horas". Toda la copia en español revisada.
- Valores de color exactos de la tabla de la sección 3 del spec; contraste ≥ 4.5:1 en texto normal.
- No cambian rutas, API, datos, validaciones ni pruebas existentes (deben seguir 50/50).
- Imágenes locales en `public/images/`, nunca enlazadas en caliente a Unsplash.
- Commits sin trailer de coautor.

## Review Focus

1. **Texto secundario sobre arena o blanco** (`#5B6B64` sobre `#F7F3EC`) → legible (≥ 4.5:1). (Task 1: prueba de contraste.)
2. **Foto que no carga o conexión lenta** → la página se ve completa con el fondo y el `placeholder="blur"`, sin saltos de layout. (Task 2: `next/image` con import estático.)
3. **Ancho de 375 px** → sin scroll horizontal; el hero y el login se apilan. (Task 4: verificación Playwright.)
4. **Sidebar colapsado a íconos** → el logo se reduce al monograma sin desbordarse. (Task 3.)
5. **Lectores de pantalla** → el SVG del logo es `aria-hidden` y el nombre sigue disponible como texto. (Task 1.)

---

### Task 1: Tokens, tipografía y marca

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`
- Create: `components/brand/logo.tsx`, `app/icon.svg`, `tests/contrast.test.ts`
- Delete: `app/favicon.ico`

**Interfaces:**
- Produces: `LogoMark({ variant?: 'light' | 'dark'; className?: string })`, `Logo({ variant?: 'light' | 'dark'; showTagline?: boolean; className?: string })`; variables CSS `--font-heading` (Fraunces) y `--font-sans` (Instrument Sans); utilidades `bg-clay`, `text-clay`, `bg-mustard`, `bg-forest-deep`, `bg-sand`.

- [ ] **Step 1: Prueba de contraste que falla** — `tests/contrast.test.ts` lee `app/globals.css`, extrae las variables del bloque `:root` y comprueba con la fórmula WCAG (luminancia relativa) que tienen ratio ≥ 4.5: `foreground/background`, `muted-foreground/background`, `muted-foreground/card`, `primary-foreground/primary`, `secondary-foreground/secondary`, `destructive/#F7DFD3`, `sidebar-foreground/sidebar`, `sidebar-primary-foreground/sidebar-primary` (≥ 3 por ser texto en negrita de 14 px), y que los valores son hex.
- [ ] **Step 2:** `npx vitest run tests/contrast.test.ts` → FAIL (los tokens actuales son oklch).
- [ ] **Step 3:** Reescribir `:root` con los hex del spec, eliminar `.dark`, añadir `--color-clay/mustard/forest-deep/sand` en `@theme inline` y `--font-heading: var(--font-fraunces)`. Ajustar valores solo si la prueba falla, registrando el cambio.
- [ ] **Step 4:** `npm test` → PASS (todas).
- [ ] **Step 5:** `app/layout.tsx`: Fraunces (`variable: '--font-fraunces'`, `axes: ['opsz']`) e Instrument Sans (`variable: '--font-sans'`); metadata `Balance · Banco de horas`. `components/brand/logo.tsx` con los SVG del spec; `app/icon.svg`; borrar `app/favicon.ico`.
- [ ] **Step 6:** `npx tsc --noEmit && npm run lint` limpios; commit `feat: tokens de color, tipografía y logo de Balance`.

### Task 2: Imágenes y landing

**Files:** Create `public/images/equipo-hero.jpg`, `public/images/equipo-login.jpg`; Modify `app/page.tsx`.

- [ ] **Step 1:** Descargar 2–3 candidatas de Unsplash (`?w=1600&q=80&fm=jpg`), revisarlas visualmente y guardar las elegidas (≤ 400 KB cada una).
- [ ] **Step 2:** Reescribir la landing según la sección 6 del spec con `next/image` (import estático, `placeholder="blur"`, `priority` en el hero, `sizes="(min-width: 1024px) 50vw, 100vw"`), titular en `font-heading`, tarjeta flotante, "Cómo funciona", funcionalidades, banda bosque y pie con integrantes.
- [ ] **Step 3:** Captura Playwright de escritorio y 375 px; sin overflow. Commit `feat: landing con identidad Balance`.

### Task 3: Login, panel, 404 y error

**Files:** Modify `components/login-form.tsx`, `app/(auth)/login/page.tsx`, `components/app-sidebar.tsx`, `components/page-header.tsx`, `components/dashboard/stat-card.tsx`, `app/(main)/inicio/page.tsx`, `components/employees/employees-table.tsx`, `components/movements/movements-table.tsx`, `components/users/users-table.tsx`, `components/dashboard/recent-movements.tsx`, `app/not-found.tsx`, `app/error.tsx`.

**Interfaces:**
- Consumes: `Logo`, `LogoMark` (Task 1).
- Produces: `StatCard` acepta `tone?: 'forest' | 'clay' | 'mustard' | 'sage'`; `MovementBadge({ type })` en `components/movements/movement-badge.tsx` usado por las dos tablas de movimientos.

- [ ] **Step 1:** Login dividido (foto `equipo-login.jpg` con degradado bosque, `Logo variant='dark'` y cita; formulario con `Logo` claro). Sin cambios en la lógica del formulario.
- [ ] **Step 2:** Sidebar: `Logo variant='dark'` en el encabezado; con el sidebar colapsado solo `LogoMark` (`group-data-[collapsible=icon]:hidden` sobre el wordmark).
- [ ] **Step 3:** `PageHeader` con `font-heading`; `StatCard` con ícono en círculo por `tone`; tablas con encabezado `bg-muted` y texto `text-xs uppercase tracking-wide`; `MovementBadge`; "Saldo bajo" en mostaza; estados vacíos con ícono.
- [ ] **Step 4:** 404 y error con `LogoMark` y los nuevos estilos.
- [ ] **Step 5:** `npm test && npx tsc --noEmit && npm run lint`; commit `feat: login y panel con identidad Balance`.

### Task 4: Verificación, README y despliegue

- [ ] **Step 1:** `npm run build`; Playwright: capturas de las 7 vistas en 1280 px y 375 px, overflow 0, sidebar colapsado, flujo de crear movimiento intacto.
- [ ] **Step 2:** Revisión de ortografía de todos los textos nuevos.
- [ ] **Step 3:** README: nombre Balance, sección "Identidad visual" (paleta, tipografía, logo) y crédito de fotos de Unsplash. Commit `docs: identidad visual en el README`.
- [ ] **Step 4:** `npx vercel deploy --prod`, prueba rápida en producción y `git push origin main` (con confirmación).
