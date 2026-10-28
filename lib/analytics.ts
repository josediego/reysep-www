import { track as vercelTrack } from "@vercel/analytics"

/**
 * Eventos de conversión (Vercel Analytics, eventos personalizados).
 *
 * - inquiry_whatsapp     { surface, item_id? }  clic en un enlace https://wa.me/…
 * - inquiry_call         { surface, item_id? }  clic en un enlace tel:
 * - catalog_search       { query_length, has_results }  búsqueda en /catalogo (nunca el texto)
 * - parts_request_submit { channel, has_model, has_name, length }  formulario "no encuentro mi repuesto"
 *
 * Valores planos (string | number | boolean | null), como exige Vercel.
 */
export type AnalyticsEvent = "inquiry_whatsapp" | "inquiry_call" | "catalog_search" | "parts_request_submit"
export type EventProps = Record<string, string | number | boolean | null>

/** Envía un evento. Nunca lanza: si el script está bloqueado, no hace nada. */
export function track(event: AnalyticsEvent, props?: EventProps): void {
  try {
    vercelTrack(event, props)
  } catch {
    // Bloqueadores, modo privado o SSR: la medición nunca rompe la página.
  }
}

const ITEM_PATH = /^\/catalogo\/([^/?#]+)\/?$/

/** Superficie según la ruta: `home`, `catalogo`, `item` u `other`. */
export function surfaceFromPath(pathname: string): string {
  if (pathname === "/" || pathname === "") return "home"
  if (ITEM_PATH.test(pathname)) return "item"
  if (pathname === "/catalogo" || pathname === "/catalogo/") return "catalogo"
  return "other"
}

/** Id del ítem: de la ruta `/catalogo/<id>` o de `Ref. <id>` en el texto de wa.me. */
export function itemIdFrom(pathname: string, href: string): string | null {
  const fromPath = ITEM_PATH.exec(pathname)?.[1]
  if (fromPath) return safeDecode(fromPath)
  if (!href.startsWith("https://wa.me/")) return null
  try {
    const text = new URL(href).searchParams.get("text") ?? ""
    return /Ref\.\s*([A-Za-z0-9][\w-]*)/.exec(text)?.[1] ?? null
  } catch {
    return null
  }
}

/** Tipo de consulta según el enlace; `null` si no es WhatsApp ni teléfono. */
export function inquiryEvent(href: string): "inquiry_whatsapp" | "inquiry_call" | null {
  if (href.startsWith("https://wa.me/")) return "inquiry_whatsapp"
  if (href.startsWith("tel:")) return "inquiry_call"
  return null
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}
