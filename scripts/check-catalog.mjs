// Falla si lib/catalog-data.ts no coincide con lo que generaría data/catalog/.
import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { execFileSync } from "node:child_process"

const root = new URL("..", import.meta.url).pathname
const dir = mkdtempSync(join(tmpdir(), "catalog-"))
const tmp = join(dir, "catalog-data.ts")
try {
  execFileSync("node", [join(root, "scripts/build-catalog.mjs"), "--out", tmp], { stdio: "inherit" })
  if (readFileSync(tmp, "utf8") !== readFileSync(join(root, "lib/catalog-data.ts"), "utf8")) {
    console.error("lib/catalog-data.ts está desactualizado respecto a data/catalog/. Ejecuta `pnpm catalog:build` y commitea.")
    try { execFileSync("diff", ["-u", join(root, "lib/catalog-data.ts"), tmp], { stdio: "inherit" }) } catch {}
    process.exit(1)
  }
  console.log("OK: lib/catalog-data.ts está al día")
} finally {
  rmSync(dir, { recursive: true, force: true })
}
