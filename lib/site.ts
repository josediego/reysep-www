/**
 * Datos públicos del sitio. Los campos `null` aún no están definidos:
 * al completarlos, los botones y bloques de contacto se activan solos.
 */
export const site = {
  name: "Reysep",
  url: "https://www.reysep.com",
  title: "Reysep | Servicio Técnico Especializado, Productos y Repuestos",
  description:
    "Reysep ofrece servicio técnico especializado: reparaciones, mantenimiento y soluciones técnicas profesionales, además de un catálogo de productos y repuestos para el hogar.",
  locale: "es_PE",
  themeColor: "#1e3a8a",
  /** Teléfono de atención (llamadas). Formato E.164. */
  phone: "+51990959102" as string | null,
  /** WhatsApp, sin "+" ni espacios. */
  whatsapp: "51990959102" as string | null,
  email: "ventas@reysep.com" as string | null,
  // TODO(Reysep): dirección del local o taller.
  address: null as string | null,
  // TODO(Reysep): horario de atención, ej. "Lun–Sáb 9:00–18:00".
  hours: null as string | null,
  // TODO(Reysep): URL de la tienda externa, si existe. Si es null, el catálogo
  // de esta página es la tienda y "Comprar Productos" lleva a #catalogo.
  shopUrl: null as string | null,
} as const

export const links = {
  call: site.phone ? `tel:${site.phone}` : null,
  whatsapp: site.whatsapp ? `https://wa.me/${site.whatsapp}` : null,
  email: site.email ? `mailto:${site.email}` : null,
  shop: site.shopUrl ?? "/catalogo",
}

/** Enlace de WhatsApp con mensaje prellenado. `null` si no hay número. */
export function whatsappWith(message: string): string | null {
  if (!site.whatsapp) return null
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`
}

/**
 * Mensaje de consulta por un ítem del catálogo: el cliente solo pulsa Enviar.
 * Incluye nombre, referencia y URL de la ficha para que el técnico identifique la pieza.
 */
export function inquiryMessage(item: { id: string; name: string; title?: string | null; kind: "repuesto" | "producto"; brand?: string }): string {
  const what = item.kind === "producto" ? "producto" : "repuesto"
  const brand = item.brand && item.brand !== "Sin marca" ? ` (${item.brand})` : ""
  const shown = item.title?.trim() || item.name
  return `Hola Reysep, quiero hacer una consulta sobre el siguiente ${what}:\n${shown}${brand}\nRef. ${item.id}\n${site.url}/catalogo/${item.id}`
}
