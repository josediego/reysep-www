/**
 * Datos públicos del sitio. Los campos `null` aún no están definidos:
 * al completarlos, los botones "Llámanos" / "Solicitar Servicio" /
 * "Comprar Productos" se activan solos.
 */
export const site = {
  name: "Reysep",
  url: "https://www.reysep.com",
  title: "Reysep | Servicio Técnico Especializado",
  description:
    "Reysep ofrece servicio técnico especializado: reparaciones, mantenimiento y soluciones técnicas profesionales, además de productos para el hogar.",
  locale: "es_PE",
  themeColor: "#1e3a8a",
  // TODO(Reysep): completar con datos reales. Formato E.164, ej. "+5112345678".
  phone: null as string | null,
  // TODO(Reysep): número de WhatsApp sin "+" ni espacios, ej. "5112345678".
  whatsapp: null as string | null,
  // TODO(Reysep): URL de la tienda, si existe.
  shopUrl: null as string | null,
} as const

export const links = {
  call: site.phone ? `tel:${site.phone}` : null,
  whatsapp: site.whatsapp ? `https://wa.me/${site.whatsapp}` : null,
  shop: site.shopUrl,
}
