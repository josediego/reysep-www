import type { CatalogItem } from "@/lib/catalog"
import { normalize } from "@/lib/catalog"

/**
 * Silueta SVG por tipo de pieza. Sustituto hasta tener fotografías reales:
 * un solo trazo, mismo peso que los iconos del sitio.
 */
type Shape =
  | "compresor"
  | "motor"
  | "valvula"
  | "termostato"
  | "resistencia"
  | "filtro"
  | "faja"
  | "perilla"
  | "quemador"
  | "foco"
  | "tubo"
  | "bomba"
  | "tarjeta"
  | "ducha"
  | "gas"
  | "caja"

const rules: [RegExp, Shape][] = [
  [/compresor/, "compresor"],
  [/motor|ventilador|sincron/, "motor"],
  [/valvula|llave|grifo/, "valvula"],
  [/termostato|bimetal|termocupla|sensor|fusible/, "termostato"],
  [/resistencia|calentador/, "resistencia"],
  [/filtro|rejilla/, "filtro"],
  [/faja|correa/, "faja"],
  [/perilla|boton|mando/, "perilla"],
  [/quemador|hornilla|cubierta|parrilla|difusor|tapa/, "quemador"],
  [/foco|lampara|luz|led/, "foco"],
  [/tubo|manguera|abasto|capilar|rollo|abrazadera|niple|adaptador|conector/, "tubo"],
  [/bomba|desague/, "bomba"],
  [/tarjeta|placa|modulo|interfaz|timer|control|display/, "tarjeta"],
  [/ducha|cabezal|desviador|mezclador|rapiducha/, "ducha"],
  [/gas|balon|refrigerante|soldadura|r134|r600/, "gas"],
]

export function glyphFor(item: Pick<CatalogItem, "name" | "partType">): Shape {
  const text = normalize(`${item.partType ?? ""} ${item.name}`)
  for (const [re, shape] of rules) if (re.test(text)) return shape
  return "caja"
}

const paths: Record<Shape, React.ReactNode> = {
  compresor: (
    <>
      <path d="M14 42a18 18 0 1 1 36 0v6H14v-6Z" />
      <path d="M20 48v6M44 48v6M32 12v6M24 30h16" />
    </>
  ),
  motor: (
    <>
      <circle cx="32" cy="32" r="14" />
      <circle cx="32" cy="32" r="4" />
      <path d="M32 14v4M32 46v4M14 32h4M46 32h4M19 19l3 3M42 42l3 3M19 45l3-3M42 22l3-3" />
    </>
  ),
  valvula: (
    <>
      <path d="M10 36h14v-8H10v8ZM40 36h14v-8H40v8Z" />
      <path d="M24 32h16" />
      <path d="M32 32V18M22 18h20" />
    </>
  ),
  termostato: (
    <>
      <path d="M26 14a6 6 0 0 1 12 0v20a10 10 0 1 1-12 0V14Z" />
      <path d="M32 24v16" />
      <circle cx="32" cy="42" r="4" />
    </>
  ),
  resistencia: (
    <>
      <path d="M8 32h8l4-10 8 20 8-20 8 20 4-10h8" />
    </>
  ),
  filtro: (
    <>
      <rect x="10" y="14" width="44" height="36" rx="3" />
      <path d="M10 26h44M10 38h44M24 14v36M40 14v36" />
    </>
  ),
  faja: (
    <>
      <circle cx="20" cy="36" r="10" />
      <circle cx="44" cy="24" r="6" />
      <path d="M22 26l20-8M24 46l22-16" />
    </>
  ),
  perilla: (
    <>
      <circle cx="32" cy="32" r="18" />
      <circle cx="32" cy="32" r="10" />
      <path d="M32 14v10" />
    </>
  ),
  quemador: (
    <>
      <circle cx="32" cy="32" r="18" />
      <circle cx="32" cy="32" r="8" />
      <path d="M32 14v6M32 44v6M14 32h6M44 32h6" />
    </>
  ),
  foco: (
    <>
      <path d="M22 26a10 10 0 1 1 20 0c0 6-6 8-6 14H28c0-6-6-8-6-14Z" />
      <path d="M28 46h8M30 52h4" />
    </>
  ),
  tubo: (
    <>
      <path d="M10 22h20a12 12 0 0 1 12 12v8h12" />
      <path d="M10 18v8M54 38v8" />
    </>
  ),
  bomba: (
    <>
      <circle cx="30" cy="34" r="12" />
      <path d="M42 34h12v-6M30 22v-8h10" />
      <circle cx="30" cy="34" r="4" />
    </>
  ),
  tarjeta: (
    <>
      <rect x="10" y="16" width="44" height="32" rx="2" />
      <rect x="18" y="24" width="12" height="10" />
      <path d="M36 24h10M36 30h10M36 36h6M18 40h28" />
    </>
  ),
  ducha: (
    <>
      <path d="M20 14h12a8 8 0 0 1 8 8v4" />
      <path d="M28 26h24v6H28z" />
      <path d="M32 36v8M40 36v10M48 36v8" />
    </>
  ),
  gas: (
    <>
      <rect x="20" y="18" width="24" height="36" rx="6" />
      <path d="M26 18v-4h12v4M26 30h12" />
    </>
  ),
  caja: (
    <>
      <path d="m32 10 20 10v24L32 54 12 44V20l20-10Z" />
      <path d="M12 20l20 10 20-10M32 30v24" />
    </>
  ),
}

export default function PartGlyph({
  item,
  className = "",
  size = 64,
}: {
  item: Pick<CatalogItem, "name" | "partType">
  className?: string
  size?: number
}) {
  const shape = glyphFor(item)
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      data-shape={shape}
    >
      {paths[shape]}
    </svg>
  )
}

const applianceShapes: Record<string, React.ReactNode> = {
  Refrigeradora: (
    <>
      <rect x="18" y="8" width="28" height="48" rx="3" />
      <path d="M18 26h28M24 14v6M24 32v10" />
    </>
  ),
  Congeladora: (
    <>
      <rect x="10" y="20" width="44" height="32" rx="3" />
      <path d="M10 30h44M30 14h4" />
    </>
  ),
  Lavadora: (
    <>
      <rect x="14" y="10" width="36" height="44" rx="3" />
      <circle cx="32" cy="36" r="11" />
      <circle cx="32" cy="36" r="5" />
      <path d="M20 16h4M40 16h4" />
    </>
  ),
  "Secadora / Lavaseca": (
    <>
      <rect x="14" y="10" width="36" height="44" rx="3" />
      <circle cx="32" cy="36" r="11" />
      <path d="M26 36h12M20 16h8" />
    </>
  ),
  Cocina: (
    <>
      <rect x="10" y="22" width="44" height="32" rx="3" />
      <path d="M10 34h44" />
      <circle cx="22" cy="28" r="2.5" />
      <circle cx="42" cy="28" r="2.5" />
      <path d="M18 42h28v6H18z" />
    </>
  ),
  Horno: (
    <>
      <rect x="10" y="16" width="44" height="36" rx="3" />
      <path d="M10 26h44M18 34h28v10H18z" />
      <circle cx="18" cy="21" r="1.5" />
      <circle cx="26" cy="21" r="1.5" />
    </>
  ),
  "Campana extractora": (
    <>
      <path d="M26 10h12v14h-12z" />
      <path d="M10 24h44l6 14H4l6-14Z" />
      <path d="M16 44h32" />
    </>
  ),
  Terma: (
    <>
      <rect x="20" y="8" width="24" height="44" rx="8" />
      <path d="M26 52v6M38 52v6M32 20v12" />
      <circle cx="32" cy="36" r="2" />
    </>
  ),
  "Ducha eléctrica": (
    <>
      <path d="M20 14h14a8 8 0 0 1 8 8v4" />
      <path d="M28 26h24v6H28z" />
      <path d="M32 36v8M40 36v10M48 36v8" />
    </>
  ),
  "Aire acondicionado": (
    <>
      <rect x="8" y="18" width="48" height="22" rx="4" />
      <path d="M14 34h36M20 46l-2 6M32 46v6M44 46l2 6" />
    </>
  ),
  Licuadora: (
    <>
      <path d="M22 10h20l-3 26H25l-3-26Z" />
      <rect x="20" y="40" width="24" height="14" rx="3" />
    </>
  ),
  Iluminación: (
    <>
      <path d="M22 26a10 10 0 1 1 20 0c0 6-6 8-6 14H28c0-6-6-8-6-14Z" />
      <path d="M28 46h8M30 52h4" />
    </>
  ),
  "Instalación general": (
    <>
      <path d="M10 22h20a12 12 0 0 1 12 12v8h12" />
      <path d="M10 18v8M54 38v8" />
    </>
  ),
}

export function ApplianceGlyph({ name, size = 28, className = "" }: { name: string; size?: number; className?: string }) {
  const shape = applianceShapes[name] ?? paths.caja
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {shape}
    </svg>
  )
}
