// Genera lib/catalog-data.ts desde data/catalog (ver scripts/lib/catalog-merge.mjs).
// Valida el resultado contra data/catalog/catalog.schema.json antes de escribir.
// Nunca copia precio de compra ni cantidades de stock (no existen en las fuentes).
// Opción: --out <ruta> para escribir en otro archivo (lo usa catalog:check).
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { validateSnapshot } from "./lib/catalog-validator.mjs"
import { root, enriched, loadMerged } from "./lib/catalog-merge.mjs"

const items = loadMerged()

const ids = new Set()
for (const it of items) {
  if (ids.has(it.id)) throw new Error(`id duplicado: ${it.id}`)
  ids.add(it.id)
}

const schemaErrors = validateSnapshot(items)
if (schemaErrors.length) {
  console.error("El catálogo fusionado no cumple catalog.schema.json:")
  for (const e of schemaErrors.slice(0, 50)) console.error(`  - ${e}`)
  process.exit(1)
}

const header = `import type { CatalogItem } from "./catalog"
// Generado por scripts/build-catalog.mjs desde data/catalog (${enriched.size}/${items.length} enriquecidos). No editar a mano.

export const catalogItems: CatalogItem[] = `
const outIdx = process.argv.indexOf("--out")
const outPath = outIdx > -1 ? process.argv[outIdx + 1] : join(root, "lib/catalog-data.ts")
writeFileSync(outPath, header + JSON.stringify(items, null, 2) + "\n")
console.log(`${outPath === join(root, "lib/catalog-data.ts") ? "lib/catalog-data.ts" : outPath}: ${items.length} ítems, ${enriched.size} enriquecidos`)
