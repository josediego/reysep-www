import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { Children, cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from "react"
import PartGlyph from "@/components/part-glyph"
import { imageOf } from "@/components/product-image"
import { catalog, displayName, formatPrice, itemById, kindLabel } from "@/lib/catalog"
import { site } from "@/lib/site"

// `alt` es estático: un alt por producto exige `generateImageMetadata`, que
// cambia la URL a `/opengraph-image/<id>` y saca la ruta de la generación
// estática con `generateStaticParams`. Se prefiere el build estático.
export const alt = `${site.name}: producto o repuesto del catálogo`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const dynamicParams = false

export function generateStaticParams() {
  return catalog.map((item) => ({ id: item.id }))
}

const CDN_HOST = "cdn.reysep.com"

let logoPromise: Promise<string> | undefined
function logo(): Promise<string> {
  logoPromise ??= readFile(join(process.cwd(), "public/reysep-logo-white.svg")).then(
    (svg) => `data:image/svg+xml;base64,${svg.toString("base64")}`,
  )
  return logoPromise
}

/**
 * Descarga la variante `card` (el CMS publica WebP) y la devuelve como data URI
 * PNG/JPEG, lo único que decodifica el renderizador de next/og. Lo demás se
 * convierte a PNG con sharp (cargado solo en el build). Solo desde el CDN del
 * CMS, sin redirecciones, 8 s de límite. Cualquier fallo devuelve `null` y la
 * imagen usa la silueta: el build no depende de que el CDN responda.
 */
async function cardDataUri(url: string): Promise<string | null> {
  try {
    if (new URL(url).hostname !== CDN_HOST) return null
    const res = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const png = buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))
    const jpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
    if (png || jpeg) return `data:image/${png ? "png" : "jpeg"};base64,${buf.toString("base64")}`
    const { default: sharp } = await import("sharp")
    const out = await sharp(buf, { limitInputPixels: 40_000_000 }).png().toBuffer()
    return `data:image/png;base64,${out.toString("base64")}`
  } catch {
    return null
  }
}

/**
 * El renderizador de next/og no acepta fragmentos dentro de <svg>: se aplanan
 * los hijos de `PartGlyph` para usar la misma silueta que el sitio.
 */
function flatten(node: ReactNode): ReactNode[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return [child]
    if (child.type === Fragment) return flatten(child.props.children)
    const kids = child.props.children
    return kids === undefined ? [child] : [cloneElement(child, undefined, ...flatten(kids))]
  })
}

function OgGlyph({ item, size }: { item: Parameters<typeof PartGlyph>[0]["item"]; size: number }) {
  const svg = PartGlyph({ item, size }) as ReactElement<{ children?: ReactNode }>
  return cloneElement(svg, undefined, ...flatten(svg.props.children))
}

function clamp(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = itemById.get(id)
  if (!item) return new Response("Not found", { status: 404 })

  const card = imageOf(item, "card")
  const [logoUri, photo] = await Promise.all([logo(), card ? cardDataUri(card.url) : Promise.resolve(null)])
  const title = clamp(displayName(item), 90)
  const kicker = [item.partType ?? kindLabel[item.kind], item.appliance].filter(Boolean).join(" · ")

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: 72,
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
          <img src={logoUri} width={183} height={60} alt="" />
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ fontSize: 26, color: "#bfdbfe", textTransform: "uppercase", letterSpacing: 1 }}>{kicker}</div>
            <div style={{ fontSize: 56, fontWeight: 300, lineHeight: 1.1, marginTop: 16 }}>{title}</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <div style={{ fontSize: 48 }}>{formatPrice(item.price)}</div>
            <div style={{ fontSize: 24, color: "#bfdbfe" }}>{item.inStock ? "Disponible en tienda" : "A pedido"}</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 420,
            height: 420,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 32,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.25)",
            background: photo ? "#ffffff" : "rgba(255,255,255,0.06)",
            color: "#dbeafe",
          }}
        >
          {photo ? (
            <img src={photo} width={420} height={420} alt="" style={{ objectFit: "cover" }} />
          ) : (
            <OgGlyph item={item} size={260} />
          )}
        </div>
      </div>
    ),
    size,
  )
}
