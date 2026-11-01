# Identidad visual "Balance" — Diseño

Fecha: 2026-11-01 · Entrega: 2026-11-02 23:59 · Depende de: `2026-11-01-gestion-empleados-design.md`

## 1. Propósito

Llevar la interfaz del sistema de gestión de empleados a un nivel profesional (criterios
"Diseño e interfaz" 10 % e "Innovación y creatividad" 20 %) con una identidad propia, cálida y
humana, sin cambiar funcionalidad, rutas, API ni datos.

Decisiones tomadas con el equipo (compañero visual):

| Tema | Decisión |
|---|---|
| Personalidad | Cálido y humano |
| Paleta | B · Bosque y arcilla |
| Logo | C · Monograma "b" con reloj |
| Imágenes | B · Fotografía de equipo con tratamiento cálido |
| Nombre | **Balance** (sin tilde), subtítulo "Banco de horas" |

## 2. Marca

- **Logotipo:** cuadrado redondeado bosque (`rx=16` sobre 64) con una "b" en arena cuya panza es un
  reloj (manecillas en arcilla) y un punto mostaza arriba a la derecha. Variante sobre fondo oscuro:
  cuadrado arcilla, trazos blancos, manecillas bosque profundo.
- **Wordmark:** "Balance" en Fraunces 600, tracking −0.02em; subtítulo "Banco de horas" en
  Instrument Sans 500, mayúsculas, tracking 0.08em, color secundario.
- `components/brand/logo.tsx`: `LogoMark({ variant: 'light' | 'dark', className })` (SVG inline,
  `aria-hidden`) y `Logo({ variant, showTagline })` (marca + wordmark).
- Favicon: `app/icon.svg` (convención de archivos de Next) con la marca clara; se elimina
  `app/favicon.ico`.
- Metadata: título `Balance · Banco de horas`, descripción "Gestión de horas trabajadas para
  equipos de recursos humanos".

## 3. Paleta y tokens

Se reemplazan las variables de `:root` en `app/globals.css` (tema claro; la app no ofrece modo
oscuro, se elimina el bloque `.dark` para no mantener tokens sin uso):

| Token shadcn | Valor | Uso |
|---|---|---|
| `--background` | `#F7F3EC` arena | Fondo general |
| `--foreground` | `#1E2A26` | Texto principal |
| `--card` / `--popover` | `#FFFFFF` | Tarjetas, diálogos, menús |
| `--primary` / `--primary-foreground` | `#2F5D50` / `#F7F3EC` | Botones, enlaces, foco |
| `--secondary` / `--secondary-foreground` | `#DCEAE2` / `#2F5D50` | Badge "Entrada" |
| `--muted` / `--muted-foreground` | `#EFE9DF` / `#5B6B64` | Superficies suaves, texto secundario |
| `--accent` / `--accent-foreground` | `#EFE6D8` / `#1E2A26` | Hover de menús e ítems |
| `--destructive` | `#B0532F` | Badge "Salida", errores (fondo `#F7DFD3` en badges) |
| `--border` / `--input` | `#E4DDD0` | Bordes |
| `--ring` | `#2F5D50` | Foco |
| `--chart-1` / `--chart-2` / `--chart-3` | `#2F5D50` / `#D9784F` / `#E9C46A` | Gráfica |
| `--sidebar` / `--sidebar-foreground` | `#22392F` / `#E8EFE9` | Sidebar oscuro |
| `--sidebar-primary` / `--sidebar-primary-foreground` | `#D9784F` / `#FFFFFF` | Ítem activo |
| `--sidebar-accent` / `--sidebar-accent-foreground` | `#2E4A3E` / `#FFFFFF` | Hover en sidebar |
| `--sidebar-border` / `--sidebar-ring` | `#2E4A3E` / `#D9784F` | |

Colores de marca adicionales como utilidades Tailwind (`@theme`): `--color-clay: #D9784F`,
`--color-mustard: #E9C46A`, `--color-forest-deep: #22392F`, `--color-sand: #F7F3EC`.

Contraste mínimo WCAG AA (4.5:1) para texto normal: se verifica con un script las parejas
texto/fondo de la tabla antes de cerrar.

## 4. Tipografía

`next/font/google`: **Fraunces** (variable, ejes `opsz`, pesos 500–700) como `--font-heading` y
**Instrument Sans** (400–600) como `--font-sans`; se eliminan Roboto y Geist Mono. Fraunces se usa
en títulos de página (`h1`), títulos de tarjetas y cifras grandes (KPIs, saldo actual); todo lo
demás en Instrument Sans.

## 5. Imágenes

- Dos fotografías de equipos de trabajo de Unsplash (licencia Unsplash: uso libre, sin
  atribución obligatoria; se acredita en el README). Se descargan a `public/images/` en JPG
  ≤ 1600 px de ancho (`equipo-hero.jpg`, `equipo-login.jpg`) y se sirven con `next/image`
  (import estático, `placeholder="blur"`, `sizes` adecuados).
- Tratamiento cálido: `sepia(.2) saturate(.9)` y degradado hacia el color de fondo / bosque para
  integrar la foto con la paleta.

## 6. Páginas

- **Landing (`/`):**
  1. Barra superior: `Logo` + botón "Iniciar sesión"/"Ir al panel".
  2. Hero en dos columnas (una en móvil): etiqueta "Banco de horas para equipos de RR. HH.",
     titular "Cada hora de tu equipo, *bien cuidada*." (cursiva en arcilla), párrafo, botón
     principal y la foto con una tarjeta flotante de producto ("Saldo de Ana · +24 h" y una
     minigráfica).
  3. "Cómo funciona" en 3 pasos numerados: registrar empleados → registrar movimientos →
     seguir el saldo.
  4. Funcionalidades (las 3 actuales con ícono en círculo de color).
  5. Banda bosque con frase y botón.
  6. Pie: logo, "Ingeniería Web · Universidad de Antioquia · Winner Team" e integrantes.
- **Login:** pantalla dividida; izquierda la foto con degradado bosque, el logo oscuro y una
  cita de marca; derecha el formulario con el logo claro arriba. En móvil solo el formulario.
- **Panel:**
  - Sidebar con tokens oscuros, `Logo` en el encabezado (variante oscura), ítem activo en
    arcilla.
  - `PageHeader`: título en Fraunces, descripción en texto secundario.
  - `StatCard`: ícono dentro de un círculo de color (bosque, arcilla, mostaza, salvia), cifra
    en Fraunces.
  - Tablas: contenedor blanco con borde, encabezado con fondo `muted` y texto en mayúsculas
    pequeñas.
  - Badges: Entrada = `secondary`; Salida = fondo `#F7DFD3`, texto `#B0532F`; "Saldo bajo" en
    mostaza.
  - Gráfica: `--chart-1`.
  - Estados vacíos con ícono.
- **404 y error:** con el logo y los nuevos estilos.

## 7. Fuera de alcance

Modo oscuro, cambios de funcionalidad, rutas o API, animaciones complejas, imágenes generadas por
IA, página de marca separada.

## 8. Verificación

`npm test`, `tsc`, `lint`, `build` sin errores; capturas Playwright de landing, login y las 4
páginas del panel en escritorio y a 375 px sin scroll horizontal; script de contraste AA;
revisión de ortografía de los textos nuevos; despliegue en Vercel y prueba rápida en producción.
