/**
 * Rutas por equipo (`/catalogo/equipo/<slug>`) y filtro puro del catálogo.
 *
 * El filtro vive aquí (no en `components/store.tsx`, que es "use client") para que
 * las páginas de servidor calculen la primera página de resultados con el mismo
 * código que usa la tienda en el navegador.
 */
import { appliances, catalog, normalize, searchText, type Appliance, type CatalogItem, type CatalogKind } from "./catalog"

export type KindFilter = "todos" | CatalogKind

/** Filas por página de la tienda; las páginas de servidor envían esta primera página ya renderizada. */
export const STORE_PAGE = 30

/** Slug sin tildes ni símbolos: "Secadora / Lavaseca" → "secadora-lavaseca". */
export function slugify(text: string): string {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Excepciones de slug donde el nombre del enum no sirve como URL. */
const slugOverrides: Partial<Record<Appliance, string>> = {
  Otro: "otros-equipos",
}

/** Cómo se nombra el equipo dentro de una frase ("Repuestos para …"). */
const phraseOverrides: Partial<Record<Appliance, string>> = {
  "Secadora / Lavaseca": "secadora y lavaseca",
  Otro: "otros equipos",
}

export function applianceSlug(name: Appliance): string {
  return slugOverrides[name] ?? slugify(name)
}

export function appliancePhrase(name: Appliance): string {
  return phraseOverrides[name] ?? name.toLowerCase()
}

/** Equipos con al menos un ítem, con su slug. Mismo orden que `appliances`. */
export const applianceRoutes: { name: Appliance; slug: string; count: number }[] = appliances.map((a) => ({
  ...a,
  slug: applianceSlug(a.name),
}))

const bySlug = new Map(applianceRoutes.map((a) => [a.slug, a]))
const byName = new Map(applianceRoutes.map((a) => [a.name, a]))

export function applianceBySlug(slug: string) {
  return bySlug.get(slug) ?? null
}

/** Ruta de la página de un equipo, o `null` si el equipo no tiene ítems. */
export function appliancePath(name: Appliance): string | null {
  const a = byName.get(name)
  return a ? `/catalogo/equipo/${a.slug}` : null
}

/** Valida un `?equipo=` de la URL contra los equipos presentes. */
export function parseAppliance(value: string | null | undefined): Appliance | null {
  if (!value) return null
  return byName.has(value as Appliance) ? (value as Appliance) : null
}

export function parseKind(value: string | null | undefined): KindFilter {
  return value === "producto" || value === "repuesto" ? value : "todos"
}

const index = catalog.map((item) => ({ item, text: searchText(item) }))

/**
 * Filtra y ordena el catálogo: agrupado por tipo de pieza (los tipos con más
 * ítems primero), luego por nombre. Función pura; servidor y cliente la comparten.
 */
export function filterCatalog({
  query,
  kind,
  appliance,
}: {
  query: string
  kind: KindFilter
  appliance: Appliance | null
}): CatalogItem[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  const matched = index
    .filter(({ item, text }) => {
      if (kind !== "todos" && item.kind !== kind) return false
      if (appliance && item.appliance !== appliance) return false
      return terms.every((t) => text.includes(t))
    })
    .map(({ item }) => item)
  const freq = new Map<string, number>()
  for (const item of matched) {
    const k = item.partType ?? "Otros"
    freq.set(k, (freq.get(k) ?? 0) + 1)
  }
  return matched.sort((a, b) => {
    const ka = a.partType ?? "Otros"
    const kb = b.partType ?? "Otros"
    return (freq.get(kb) ?? 0) - (freq.get(ka) ?? 0) || ka.localeCompare(kb, "es") || a.name.localeCompare(b.name, "es")
  })
}

/** Tipos de pieza de un equipo, por cantidad. */
export function partTypesFor(appliance: Appliance): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const item of catalog) {
    if (item.appliance !== appliance || !item.partType) continue
    counts.set(item.partType, (counts.get(item.partType) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .map(([name, count]) => ({ name, count }))
}
