# Reysep — Servicio Técnico Especializado

Sitio web de Reysep. Página única y estática (hero, servicios, catálogo de
productos y repuestos, nosotros, contacto), desplegada en Vercel
(`https://www.reysep.com`, DNS en Cloudflare).

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4
- `@paper-design/shaders-react` (fondo WebGL, respeta `prefers-reduced-motion`)
- Vercel Analytics

## Desarrollo

```sh
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint
pnpm typecheck
pnpm test       # vitest (helpers de analítica y formulario)
pnpm build
```

Node 22 (ver `engines`), pnpm 10 (ver `packageManager`).

### Pruebas E2E y accesibilidad

Playwright (Chromium, proyectos `desktop` 1440×900 y `mobile` 390×844) con
`@axe-core/playwright`. Specs en `e2e/`: smoke de home, catálogo (búsqueda,
filtro por equipo, ficha), ficha de ítem (precio, WhatsApp con `Ref. <id>`,
`tel:`, JSON-LD `Product`), 404, axe en `/`, `/catalogo` y una ficha (falla con
violaciones `serious`/`critical`) y navegación con teclado (foco visible).

```sh
pnpm e2e:install           # una vez: descarga Chromium
pnpm build && pnpm e2e     # contra `pnpm start` (puerto 3000)
PW_DEV=1 pnpm e2e          # contra `pnpm dev -p 3011`, sin build
PORT=4000 pnpm e2e         # otro puerto local
BASE_URL=https://... pnpm e2e   # contra un servidor ya levantado (preview)
AXE_VERBOSE=1 pnpm e2e     # lista también violaciones moderadas/menores
pnpm e2e --project=mobile --ui
```

En CI corre el job `e2e` (`.github/workflows/ci.yml`): build de producción,
navegadores en caché y reporte HTML + trazas como artefacto si falla.

## Estructura

```
app/
  layout.tsx          # metadata, fuentes, JSON-LD, Analytics
  page.tsx            # home
  globals.css         # Tailwind v4 + tokens
  robots.ts, sitemap.ts, opengraph-image.tsx
components/
  header.tsx, mobile-nav.tsx, hero-content.tsx, shader-background.tsx
  section.tsx         # cabecera de sección compartida
  services.tsx, catalog.tsx, about.tsx, contact.tsx, footer.tsx
  icons.tsx           # iconos SVG propios (un solo trazo/peso)
  analytics-listener.tsx  # mide clics en wa.me/tel: y búsquedas (delegado en document)
  parts-request-form.tsx  # "¿No encuentra su repuesto?" → WhatsApp o correo
lib/analytics.ts      # track() seguro + helpers de surface/item_id
lib/site.ts           # datos públicos del sitio (teléfono, WhatsApp, correo, dirección, horario)
lib/nav.ts            # ítems de navegación (header y footer)
lib/catalog.ts        # tipo CatalogItem, categorías, marcas, formato de precio
lib/slugs.ts          # equipo ↔ slug, filtro puro del catálogo (servidor y cliente)
lib/catalog-data.ts   # inventario (generado desde el xlsx de la tienda)
public/               # favicon y logos
```

## Analítica

Eventos personalizados de Vercel Analytics (requieren plan con custom events):

| Evento | Propiedades |
| --- | --- |
| `inquiry_whatsapp` | `surface`, `item_id?` |
| `inquiry_call` | `surface`, `item_id?` |
| `catalog_search` | `query_length`, `has_results` (nunca el texto buscado) |
| `parts_request_submit` | `channel` (`whatsapp`/`email`), `has_model`, `has_name`, `length` |

`surface` sale del `[data-surface]` más cercano al enlace o, si no hay, de la ruta
(`home`, `catalogo`, `item`). `item_id` sale de `/catalogo/<id>` o de `Ref. <id>`
en el mensaje de WhatsApp. Para medir un CTA nuevo basta con que sea un enlace
`https://wa.me/…` o `tel:`; añada `data-surface` a un contenedor para distinguirlo.

## Catálogo

Rutas:

- `/catalogo`: buscador, filtros por equipo y tipo, estado en la URL (`?q=`, `?tipo=`,
  `?equipo=`). Renderizada en el servidor por petición: la primera página de filas ya
  viene en el HTML. `?equipo=X` sin otros filtros declara como canónica la página del equipo.
- `/catalogo/equipo/<slug>` (ej. `lavadora`, `campana-extractora`): una página estática
  por equipo con ítems, con título "Repuestos para … en Lima", intro y la misma tienda
  prefiltrada. Los slugs (sin tildes) salen de `lib/slugs.ts`, que también tiene el
  filtro puro que comparten servidor y cliente.
- `/catalogo/[id]`: ficha por ítem, estática, con JSON-LD `Product`, compatibilidad y
  CTA de WhatsApp/llamada con mensaje precargado.

El JSON-LD global (`app/layout.tsx`) es `LocalBusiness` + `Organization`; `address`,
`geo` y `hours` (formato "Lun–Sáb 9:00–18:00") de `lib/site.ts` solo se publican
cuando dejan de ser `null`.

Pipeline de datos (`data/catalog/`):

1. `items.json`: exportación limpia del Excel (campos de origen).
2. `batches/`: lotes para enriquecimiento con agentes (búsqueda web por modelo).
3. `enriched/`: lotes enriquecidos según `SCHEMA.md` (tipo de pieza, equipo,
   compatibilidad, specs, resumen, validación con fuentes).
4. `pnpm catalog:build` fusiona todo en `lib/catalog-data.ts` (valida enum de
   equipos, normaliza tipos, rechaza campos prohibidos) y valida el resultado
   contra `catalog.schema.json` antes de escribir. Si un ítem de `items.json`
   ya trae los campos de enriquecimiento (snapshot del CMS), tiene prioridad
   sobre `enriched/`.

### Contrato versionado

`data/catalog/catalog.schema.json` (JSON Schema 2020-12) describe el snapshot
publicado: `{ "version": 1, "generatedAt": "<ISO>", "items": CatalogItem[] }`,
equivalente al tipo `CatalogItem` de `lib/catalog.ts` (incluye `images` opcional
para el futuro). Usa `additionalProperties: false`, así que cualquier campo
extra (precio de compra, cantidades de stock) se rechaza.

- `pnpm catalog:validate [archivo]`: valida un snapshot o arreglo suelto; sin
  argumento valida el catálogo fusionado. Sale con código 1 y lista los errores.
- `pnpm catalog:check`: falla si `lib/catalog-data.ts` no coincide con lo que
  generaría `data/catalog/`. Ambos corren en CI.

### Imágenes de producto

Las fotos llegan en el mismo snapshot del CMS: cada ítem puede traer
`images[]` con `{ variant, url, width, height, alt }` (ver `$defs/image` en el
esquema). El CMS ya publica las variantes al tamaño final, así que el sitio no
optimiza nada (`images.unoptimized`, sin `next/image`):

- `thumb`: miniatura cuadrada (filas, relacionados, miniaturas de la galería).
- `card`: imagen media; se usa en la imagen Open Graph de la ficha.
- `detail`: foto grande de la ficha. Varias `detail` = galería, en el orden del
  arreglo; la miniatura *i* usa la `thumb` *i* si existe, si no la propia `detail`.

Las URL son absolutas en `https://cdn.reysep.com/...` (único host permitido en
`img-src` de la CSP y en `images.remotePatterns`). Una URL de otro host no se
muestra (la CSP la bloquea). `alt` vacío usa el título visible del ítem.

Sin variante, se muestra la silueta `PartGlyph` (`components/product-image.tsx`);
en la ficha, sin `detail` aparece la silueta con "Foto pendiente". El JSON-LD
`Product.image` lista las URL `detail`. La imagen OG por ítem
(`app/catalogo/[id]/opengraph-image.tsx`, 1200×630, generada en el build)
descarga la `card` desde el CDN y, si no es PNG/JPEG (el CMS publica WebP), la
convierte a PNG con `sharp` en el build; si no existe, falla la conversión o el
CDN no responde (8 s), usa la silueta sobre el degradado de marca sin romper el
build.

### Sincronización desde el CMS

El CMS (`josediego/reysep-cms`) publica el snapshot en `https://cdn.reysep.com/...`
y avisa a este repo; el workflow `.github/workflows/catalog-sync.yml`:

1. descarga la URL (solo host `cdn.reysep.com`, sin seguir redirecciones),
2. verifica el SHA-256,
3. valida contra el esquema,
4. escribe `data/catalog/items.json` y guarda el snapshot en
   `data/catalog/snapshots/<sha256-8>.json`,
5. ejecuta `pnpm catalog:build` y, si hay cambios, hace commit
   `chore(catalog): sync <sha256-8> from CMS` a `main` como `github-actions[bot]`.

Los syncs no se solapan (`concurrency`). Disparo desde el CMS:

```bash
curl -X POST https://api.github.com/repos/josediego/reysep-www/dispatches \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_DISPATCH_TOKEN" \
  -d '{"event_type":"catalog-updated","client_payload":{"url":"https://cdn.reysep.com/catalog/<archivo>.json","sha256":"<hex64>"}}'
```

Token mínimo: fine-grained PAT limitado al repo `josediego/reysep-www` con
permiso de repositorio **Contents: Read and write** (según la tabla "Permissions
required for fine-grained personal access tokens" de GitHub, `POST
/repos/{owner}/{repo}/dispatches` exige `Contents: write`). Con token classic
haría falta el scope `repo`. También se puede lanzar a mano desde Actions >
"Catalog sync" (`workflow_dispatch`, inputs `url` y `sha256`).

Notas: un push hecho con `GITHUB_TOKEN` no dispara otros workflows (CI) y
fallará si `main` exige PR; en ese caso hay que permitir al bot o cambiar el
último paso a una PR. `repository_dispatch` solo corre desde la rama por defecto.

`lib/catalog-data.ts` se genera desde el Excel de inventario de la tienda
("Importación Masiva de Inventario": nombre, stock, precio final, categoría,
marca, unidad). Reglas al regenerar:

- Nunca incluir **precio de compra** ni cantidades de stock (solo `inStock`).
- `kind` es `producto` (bien terminado/consumible) o `repuesto`.
- `category` se deriva del nombre; la columna del Excel suele ser "otros".
- El botón **Consultar** abre WhatsApp con el nombre del ítem prellenado
  (requiere `site.whatsapp`); sin número, lleva a `#contacto`.

## Datos de contacto

`lib/site.ts` tiene `phone`, `whatsapp`, `email`, `address`, `hours` y
`shopUrl` en `null`. Al completarlos aparecen "Llámanos", los enlaces de
WhatsApp (hero, servicios, catálogo, contacto) y la lista de contacto.

## Despliegue

Vercel (team `wearebricks`, proyecto `reysep-www`) conectado al repo
`josediego/reysep-www`. `main` → producción. Cabeceras de seguridad y CSP en
`next.config.mjs`.

DNS (Cloudflare, modo "DNS only"):

| Tipo  | Nombre | Valor                 |
|-------|--------|-----------------------|
| A     | `@`    | `76.76.21.21`         |
| CNAME | `www`  | `cname.vercel-dns.com` (o el valor que muestre Vercel) |

Los registros MX de Google se mantienen.
