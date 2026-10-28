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
pnpm build
```

Node 22 (ver `engines`), pnpm 10 (ver `packageManager`).

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
lib/site.ts           # datos públicos del sitio (teléfono, WhatsApp, correo, dirección, horario)
lib/nav.ts            # ítems de navegación (header y footer)
lib/catalog.ts        # tipo CatalogItem, categorías, marcas, formato de precio
lib/catalog-data.ts   # inventario (generado desde el xlsx de la tienda)
public/               # favicon y logos
```

## Catálogo

Rutas: `/catalogo` (buscador, filtros por equipo y tipo, estado en la URL) y
`/catalogo/[id]` (ficha por ítem, estática, con JSON-LD `Product`, compatibilidad y
CTA de WhatsApp/llamada con mensaje precargado).

Pipeline de datos (`data/catalog/`):

1. `items.json`: exportación limpia del Excel (campos de origen).
2. `batches/`: lotes para enriquecimiento con agentes (búsqueda web por modelo).
3. `enriched/`: lotes enriquecidos según `SCHEMA.md` (tipo de pieza, equipo,
   compatibilidad, specs, resumen, validación con fuentes).
4. `pnpm catalog:build` fusiona todo en `lib/catalog-data.ts` (valida enum de
   equipos, normaliza tipos, rechaza campos prohibidos).

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
