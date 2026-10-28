// Fusiona data/catalog/items.json (+ enriched/*.json) en el arreglo final de ítems.
// Si un ítem de items.json ya trae campos de enriquecimiento (snapshot del CMS), tiene prioridad sobre enriched/.
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join } from "node:path"

export const root = new URL("../..", import.meta.url).pathname
const dataDir = join(root, "data/catalog")
const base = JSON.parse(readFileSync(join(dataDir, "items.json"), "utf8"))

export const enriched = new Map()
const enrichedDir = join(dataDir, "enriched")
if (existsSync(enrichedDir)) {
  for (const f of readdirSync(enrichedDir).filter((f) => f.endsWith(".json")).sort()) {
    for (const item of JSON.parse(readFileSync(join(enrichedDir, f), "utf8"))) enriched.set(item.id, item)
  }
}

const APPLIANCES = new Set([
  "Refrigeradora", "Congeladora", "Lavadora", "Secadora / Lavaseca", "Cocina", "Horno", "Campana extractora",
  "Terma", "Ducha eléctrica", "Aire acondicionado", "Licuadora", "Iluminación", "Instalación general", "Otro",
])
const STATUSES = new Set(["verified", "inferred", "unverified"])
const MINOR = new Set(["de", "del", "la", "el", "los", "las", "con", "para", "por", "y", "o", "en", "a"])

/** "Tubo De Abasto" -> "Tubo de abasto"; conserva siglas (LG, R600a) y la primera mayúscula. */
function titleCase(text) {
  return text
    .trim()
    .split(/\s+/)
    .map((w, i) => {
      const lower = w.toLowerCase()
      if (i > 0 && MINOR.has(lower)) return lower
      if (/^[A-Z0-9][A-Z0-9/-]*[a-z]?$/.test(w) && w.length <= 6) return w // sigla o código
      if (i === 0) return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      return lower
    })
    .join(" ")
}

const SOURCE_KEYS = ["id", "name", "kind", "category", "brand", "unit", "measures", "price", "inStock"]
const FORBIDDEN = /precio.?de.?compra|purchase|stock(?!$)|costo/i

export function loadMerged() {
  return base.map((src) => {
  const e = src.partType !== undefined ? src : enriched.get(src.id)
  const out = {}
  for (const k of SOURCE_KEYS) if (src[k] !== undefined) out[k] = src[k]
  if (e) {
    for (const k of SOURCE_KEYS) {
      if (e[k] !== undefined && JSON.stringify(e[k]) !== JSON.stringify(src[k])) {
        console.warn(`[warn] ${src.id}: campo de origen "${k}" alterado en enriquecido; se conserva el original`)
      }
    }
    out.title = typeof e.title === "string" && e.title.trim() ? e.title.trim() : (src.title ?? null)
    out.description = typeof e.description === "string" && e.description.trim() ? e.description.trim() : (src.description ?? null)
    out.partType = e.partType ? titleCase(e.partType) : null
    if (e.appliance && !APPLIANCES.has(e.appliance)) throw new Error(`${src.id}: appliance inválido "${e.appliance}"`)
    out.appliance = e.appliance ?? null
    out.fitsBrands = Array.isArray(e.fitsBrands) ? e.fitsBrands : []
    out.fitsModels = Array.isArray(e.fitsModels) ? e.fitsModels : []
    out.modelCodes = Array.isArray(e.modelCodes) ? e.modelCodes : []
    out.specs = e.specs && typeof e.specs === "object" ? e.specs : {}
    out.summary = e.summary ?? null
    out.validation = e.validation
      ? {
          status: STATUSES.has(e.validation.status) ? e.validation.status : "unverified",
          confidence: typeof e.validation.confidence === "number" ? e.validation.confidence : 0,
          sources: Array.isArray(e.validation.sources) ? e.validation.sources : [],
          notes: e.validation.notes ?? "",
          checkedAt: e.validation.checkedAt ?? null,
        }
      : null
  } else {
    out.title = src.title ?? null
    out.description = src.description ?? null
    out.partType = null
    out.appliance = null
    out.fitsBrands = []
    out.fitsModels = []
    out.modelCodes = []
    out.specs = {}
    out.summary = null
    out.validation = null
  }
  if (Array.isArray(e?.images) && e.images.length) out.images = e.images
  for (const k of Object.keys(out)) if (FORBIDDEN.test(k)) throw new Error(`Campo prohibido: ${k}`)
  return out
})
}
