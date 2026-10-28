import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Store from "@/components/store"
import AmbientGradient from "@/components/ambient-gradient"
import { counts, appliances } from "@/lib/catalog"
import { STORE_PAGE, appliancePath, filterCatalog, parseAppliance, parseKind } from "@/lib/slugs"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

const description = `${counts.repuesto} repuestos y ${counts.producto} productos para ${appliances
  .slice(0, 5)
  .map((a) => a.name.toLowerCase())
  .join(", ")} y más. Precio y disponibilidad al instante.`

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams
  const appliance = parseAppliance(first(params.equipo))
  // `?equipo=X` sin búsqueda ni tipo es el mismo listado que la página estática del equipo.
  const onlyAppliance = appliance && !first(params.q) && !first(params.tipo)
  const canonical = (onlyAppliance && appliancePath(appliance)) || "/catalogo"
  return {
    title: "Catálogo de repuestos y productos",
    description,
    alternates: { canonical },
  }
}

export default async function CatalogoPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const initialQuery = first(params.q)?.trim() ?? ""
  const initialKind = parseKind(first(params.tipo))
  const initialAppliance = parseAppliance(first(params.equipo))
  const results = filterCatalog({ query: initialQuery, kind: initialKind, appliance: initialAppliance })

  return (
    <div className="relative isolate min-h-svh bg-black">
      <AmbientGradient edge="top" className="h-[34rem] md:h-[40rem]" />
      <Header />
      <main id="contenido" tabIndex={-1} className="px-6 pb-24 outline-none md:px-8">
        <div className="mx-auto w-full max-w-6xl pt-2 pb-4 md:pt-8 md:pb-8">
          <h1 className="text-4xl font-light tracking-tight text-white md:text-5xl">
            <span className="instrument font-medium italic">Catálogo</span> de repuestos
          </h1>
        </div>
        {/* key: una navegación real a /catalogo con otros parámetros reinicia el estado de la tienda */}
        <Store
          key={`${initialQuery}|${initialKind}|${initialAppliance ?? ""}`}
          initialQuery={initialQuery}
          initialKind={initialKind}
          initialAppliance={initialAppliance}
          initialItems={results.slice(0, STORE_PAGE)}
          initialTotal={results.length}
        />
      </main>
      <Footer />
    </div>
  )
}
