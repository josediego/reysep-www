/**
 * Catálogo de productos y repuestos.
 *
 * Los ítems viven en `lib/catalog-data.ts`, generado desde el inventario de
 * la tienda (xlsx). Este módulo define el tipo y los helpers de presentación.
 */
import { catalogItems } from "./catalog-data"

export type CatalogKind = "producto" | "repuesto"

export type CatalogItem = {
  /** Slug estable y único. Prefijo "p-" (producto) o "r-" (repuesto). */
  id: string
  kind: CatalogKind
  /** Etiqueta legible, ej. "Filtros de campana". */
  category: string
  name: string
  brand: string
  unit?: string
  measures?: string
  /** Precio final en soles. `null` muestra "Consultar". */
  price: number | null
  inStock: boolean

  // --- Enriquecimiento (ver data/catalog/SCHEMA.md). `null`/vacío si aún no se procesó. ---
  /** Tipo de pieza normalizado, ej. "Motocompresor". */
  partType: string | null
  /** Título de cara al comprador; `null` = se muestra `name`. */
  title?: string | null
  /** Descripción larga (opcional). */
  description?: string | null
  /** Equipo al que corresponde, ej. "Refrigeradora". */
  appliance: Appliance | null
  fitsBrands: string[]
  fitsModels: string[]
  modelCodes: string[]
  specs: Record<string, string>
  summary: string | null
  validation: Validation | null
  /** Imágenes publicadas por el CMS (opcional). */
  images?: CatalogImage[]
}

export type CatalogImage = {
  variant: "thumb" | "card" | "detail"
  url: string
  width: number
  height: number
  alt: string
}

export type Appliance =
  | "Refrigeradora"
  | "Congeladora"
  | "Lavadora"
  | "Secadora / Lavaseca"
  | "Cocina"
  | "Horno"
  | "Campana extractora"
  | "Terma"
  | "Ducha eléctrica"
  | "Aire acondicionado"
  | "Licuadora"
  | "Iluminación"
  | "Instalación general"
  | "Otro"

export type ValidationStatus = "verified" | "inferred" | "unverified"

export type Validation = {
  status: ValidationStatus
  confidence: number
  sources: string[]
  notes: string
  checkedAt: string | null
}

export const services = [
  {
    id: "reparacion",
    title: "Reparación",
    text: "Diagnóstico y reparación de equipos del hogar con repuestos de calidad y garantía por el trabajo realizado.",
  },
  {
    id: "mantenimiento",
    title: "Mantenimiento",
    text: "Limpieza, calibración y revisión preventiva para alargar la vida útil de sus equipos y evitar fallas.",
  },
  {
    id: "instalacion",
    title: "Instalación",
    text: "Instalación y puesta en marcha de equipos nuevos, con pruebas de funcionamiento y recomendaciones de uso.",
  },
  {
    id: "repuestos",
    title: "Repuestos",
    text: "Venta de repuestos originales y alternativos. Si no está en el catálogo, lo buscamos por usted.",
  },
] as const

export const catalog: CatalogItem[] = catalogItems

export const itemById = new Map(catalog.map((item) => [item.id, item]))

export const validationLabel: Record<ValidationStatus, string> = {
  verified: "Verificado",
  inferred: "Deducido del nombre",
  unverified: "Sin verificar",
}

/** Equipos presentes en el catálogo, por cantidad. */
export const appliances: { name: Appliance; count: number }[] = (() => {
  const counts = new Map<Appliance, number>()
  for (const item of catalog) if (item.appliance) counts.set(item.appliance, (counts.get(item.appliance) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
})()

/** Tipos de pieza presentes, por cantidad. */
export const partTypes: { name: string; count: number }[] = (() => {
  const counts = new Map<string, number>()
  for (const item of catalog) if (item.partType) counts.set(item.partType, (counts.get(item.partType) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .map(([name, count]) => ({ name, count }))
})()

/** Ítems relacionados: mismo tipo de pieza, luego mismo equipo, excluyendo el propio. */
export function relatedItems(item: CatalogItem, limit = 6): CatalogItem[] {
  const same = catalog.filter((i) => i.id !== item.id && i.partType && i.partType === item.partType)
  const sameAppliance = catalog.filter(
    (i) => i.id !== item.id && i.appliance && i.appliance === item.appliance && !same.includes(i),
  )
  const sameCategory = catalog.filter(
    (i) => i.id !== item.id && i.category === item.category && !same.includes(i) && !sameAppliance.includes(i),
  )
  return [...same, ...sameAppliance, ...sameCategory].slice(0, limit)
}

/** Texto indexable para búsqueda: nombre, marca, categoría, tipo, equipo, modelos. */
export function searchText(item: CatalogItem): string {
  return normalize(
    [
      item.name,
      item.title ?? "",
      item.brand,
      item.category,
      item.partType ?? "",
      item.appliance ?? "",
      ...item.fitsBrands,
      ...item.fitsModels,
      ...item.modelCodes,
      item.measures ?? "",
    ].join(" "),
  )
}

/** Nombre visible: el título del comprador si existe, si no el nombre de inventario. */
export function displayName(item: Pick<CatalogItem, "name" | "title">): string {
  return item.title?.trim() || item.name
}

export const kindLabel: Record<CatalogKind, string> = {
  producto: "Producto",
  repuesto: "Repuesto",
}

export const kindPlural: Record<CatalogKind, string> = {
  producto: "Productos",
  repuesto: "Repuestos",
}

/** Categorías ordenadas por cantidad de ítems (desc), luego alfabético. */
export const categories: string[] = (() => {
  const counts = new Map<string, number>()
  for (const item of catalog) counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .map(([name]) => name)
})()

export const counts = {
  total: catalog.length,
  producto: catalog.filter((i) => i.kind === "producto").length,
  repuesto: catalog.filter((i) => i.kind === "repuesto").length,
  brands: new Set(catalog.map((i) => i.brand)).size,
}

const pen = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(price: number | null): string {
  if (price === null) return "Consultar"
  return pen.format(price)
}

/** Normaliza para búsqueda: minúsculas y sin tildes. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
}

/** Marcas reales del inventario, por cantidad de ítems, sin "Multimarca". */
export const brands: string[] = (() => {
  const counts = new Map<string, number>()
  for (const item of catalog) {
    if (["multimarca", "generico", "sin marca"].includes(normalize(item.brand))) continue
    counts.set(item.brand, (counts.get(item.brand) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .slice(0, 12)
    .map(([name]) => name)
})()
