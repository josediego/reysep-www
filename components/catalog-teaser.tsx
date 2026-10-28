import Link from "next/link"
import Section from "@/components/section"
import AmbientGradient from "@/components/ambient-gradient"
import { ApplianceGlyph } from "@/components/part-glyph"
import { ArrowIcon } from "@/components/icons"
import { appliances, counts, partTypes } from "@/lib/catalog"

export default function CatalogTeaser() {
  const topAppliances = appliances.filter((a) => a.name !== "Otro").slice(0, 6)
  const topParts = partTypes.slice(0, 8)

  return (
    <Section
      id="catalogo"
      background={<AmbientGradient edge="both" intensity={0.65} />}
      title={
        <>
          Catálogo de <span className="instrument font-medium italic">repuestos</span> por equipo
        </>
      }
      lead={`${counts.repuesto} repuestos y ${counts.producto} productos en tienda, con precio y disponibilidad. Elija su equipo y encuentre la pieza.`}
    >
      <ul className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
        {topAppliances.map((a) => {
          return (
            <li key={a.name} className="bg-black">
              <Link
                href={`/catalogo?equipo=${encodeURIComponent(a.name)}`}
                className="group flex h-full items-center gap-4 p-5 transition-colors duration-200 hover:bg-white/[0.04] md:p-6"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 text-blue-200/80 transition-colors group-hover:border-blue-300/50 group-hover:text-white">
                  <ApplianceGlyph name={a.name} size={28} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-light text-white md:text-xl">{a.name}</span>
                  <span className="block text-sm text-blue-100/75 tabular-nums">{a.count} repuestos y productos</span>
                </span>
                <ArrowIcon size={16} className="text-blue-100/60 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-blue-100/75">
          <span className="mr-1">Más buscados:</span>
          {topParts.map((p, i) => (
            <Link key={p.name} href={`/catalogo?q=${encodeURIComponent(p.name)}`} className="text-white/90 underline decoration-white/25 underline-offset-4 hover:decoration-white">
              {p.name}
              {i < topParts.length - 1 && <span className="text-blue-100/40 no-underline">,</span>}
            </Link>
          ))}
        </p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 self-start rounded-full bg-white px-7 py-3.5 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-white/90"
        >
          Ver catálogo <ArrowIcon size={14} />
        </Link>
      </div>
    </Section>
  )
}
