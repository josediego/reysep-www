// Validador compartido del contrato del catálogo (data/catalog/catalog.schema.json).
import { readFileSync } from "node:fs"
import Ajv2020 from "ajv/dist/2020.js"
import addFormats from "ajv-formats"

const schema = JSON.parse(readFileSync(new URL("../../data/catalog/catalog.schema.json", import.meta.url), "utf8"))

export function createValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  return ajv.compile(schema)
}

/** Envuelve un arreglo suelto como snapshot v1; deja pasar un snapshot completo. */
export function toSnapshot(data) {
  return Array.isArray(data) ? { version: 1, generatedAt: new Date().toISOString(), items: data } : data
}

function formatError(e) {
  const extra = e.params?.additionalProperty ? ` ("${e.params.additionalProperty}")` : ""
  return `${e.instancePath || "/"} ${e.message}${extra}`
}

/** Devuelve lista de errores legibles (vacía si es válido). Incluye ids duplicados. */
export function validateSnapshot(data) {
  const validate = createValidator()
  const snap = toSnapshot(data)
  if (validate(snap)) {
    const seen = new Set()
    const errs = []
    for (const [i, it] of snap.items.entries()) {
      if (seen.has(it.id)) errs.push(`/items/${i}/id id duplicado "${it.id}"`)
      seen.add(it.id)
    }
    return errs
  }
  return validate.errors.map((e) => {
    const m = e.instancePath.match(/^\/items\/(\d+)/)
    const id = m ? ` [${snap.items?.[m[1]]?.id}]` : ""
    return formatError(e) + id
  })
}
