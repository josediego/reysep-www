// Uso: node scripts/validate-catalog.mjs [archivo]
// Valida un snapshot ({version, generatedAt, items}) o un arreglo suelto.
// Sin argumento valida el catálogo fusionado (items.json + enriched/), igual que catalog:build.
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { validateSnapshot } from "./lib/catalog-validator.mjs"
import { loadMerged } from "./lib/catalog-merge.mjs"

const file = process.argv[2] ? resolve(process.argv[2]) : "(catálogo fusionado)"
let data
try {
  data = process.argv[2] ? JSON.parse(readFileSync(file, "utf8")) : loadMerged()
} catch (e) {
  console.error(`No se pudo leer ${file}: ${e.message}`)
  process.exit(1)
}
const errors = validateSnapshot(data)
if (errors.length) {
  console.error(`Catálogo inválido (${errors.length} errores) en ${file}:`)
  for (const e of errors.slice(0, 50)) console.error(`  - ${e}`)
  if (errors.length > 50) console.error(`  ... y ${errors.length - 50} más`)
  process.exit(1)
}
const n = Array.isArray(data) ? data.length : data.items.length
console.log(`OK: ${n} ítems válidos (${file})`)
