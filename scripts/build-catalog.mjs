// Genera lib/catalog-data.ts desde data/catalog.
// Fuente: data/catalog/enriched/*.json si existen (fusionados por id), si no data/catalog/items.json.
// Nunca copia precio de compra ni cantidades de stock (no existen en las fuentes).
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs"
import { join } from "node:path"

const root = new URL("..", import.meta.url).pathname
const dataDir = join(root, "data/catalog")
const base = JSON.parse(readFileSync(join(dataDir, "items.json"), "utf8"))

const enriched = new Map()
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

const items = base.map((src) => {
  const e = enriched.get(src.id)
  const out = {}
  for (const k of SOURCE_KEYS) if (src[k] !== undefined) out[k] = src[k]
  if (e) {
    for (const k of SOURCE_KEYS) {
      if (e[k] !== undefined && JSON.stringify(e[k]) !== JSON.stringify(src[k])) {
        console.warn(`[warn] ${src.id}: campo de origen "${k}" alterado en enriquecido; se conserva el original`)
      }
    }
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
    out.partType = null
    out.appliance = null
    out.fitsBrands = []
    out.fitsModels = []
    out.modelCodes = []
    out.specs = {}
    out.summary = null
    out.validation = null
  }
  for (const k of Object.keys(out)) if (FORBIDDEN.test(k)) throw new Error(`Campo prohibido: ${k}`)
  return out
})

const ids = new Set()
for (const it of items) {
  if (ids.has(it.id)) throw new Error(`id duplicado: ${it.id}`)
  ids.add(it.id)
}

const header = `import type { CatalogItem } from "./catalog"
// Generado por scripts/build-catalog.mjs desde data/catalog (${enriched.size}/${items.length} enriquecidos). No editar a mano.

export const catalogItems: CatalogItem[] = `
writeFileSync(join(root, "lib/catalog-data.ts"), header + JSON.stringify(items, null, 2) + "\n")
console.log(`lib/catalog-data.ts: ${items.length} ítems, ${enriched.size} enriquecidos`)
