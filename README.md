# Reysep — Servicio Técnico Especializado

Sitio web de Reysep. Landing de una sola página, estática, desplegada en Vercel
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
  header.tsx, hero-content.tsx, shader-background.tsx
lib/site.ts           # datos públicos del sitio (teléfono, WhatsApp, tienda)
public/               # favicon y logos
```

## Datos de contacto

`lib/site.ts` tiene `phone`, `whatsapp` y `shopUrl` en `null`. Al completarlos
aparecen los botones "Llámanos", "Solicitar Servicio" y "Comprar Productos".

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
