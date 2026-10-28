import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Store from "@/components/store"
import AmbientGradient from "@/components/ambient-gradient"
import { catalog, type Appliance } from "@/lib/catalog"
import { site } from "@/lib/site"
import {
  STORE_PAGE,
  applianceBySlug,
  appliancePhrase,
  applianceRoutes,
  filterCatalog,
  partTypesFor,
} from "@/lib/slugs"

// Totalmente estática: una página por equipo con ítems; cualquier otro slug es 404.
export const dynamicParams = false

export function generateStaticParams() {
  return applianceRoutes.map((a) => ({ slug: a.slug }))
}

type Params = Promise<{ slug: string }>

function describe(name: Appliance) {
  const items = catalog.filter((i) => i.appliance === name)
  const repuestos = items.filter((i) => i.kind === "repuesto").length
  const productos = items.length - repuestos
  const phrase = appliancePhrase(name)
  const lead = repuestos >= productos ? "Repuestos" : "Productos"
  const parts = partTypesFor(name)
  const top = parts.slice(0, 5).map((p) => p.name.toLowerCase())
  const kinds = [
    repuestos > 0 ? `${repuestos} ${repuestos === 1 ? "repuesto" : "repuestos"}` : null,
    productos > 0 ? `${productos} ${productos === 1 ? "producto" : "productos"}` : null,
  ]
    .filter(Boolean)
    .join(" y ")
  const list =
    parts.length > top.length
      ? `${top.join(", ")} y más`
      : top.length > 1
        ? `${top.slice(0, -1).join(", ")} y ${top.at(-1)}`
        : (top[0] ?? "")
  const description = `${kinds} para ${phrase} en Lima${list ? `: ${list}` : ""}. Precio y disponibilidad al instante; consulta por WhatsApp.`
  return { phrase, lead, kinds, parts, description, title: `${lead} para ${phrase} en Lima` }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const a = applianceBySlug(slug)
  if (!a) return {}
  const { title, description } = describe(a.name)
  const url = `/catalogo/equipo/${a.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, type: "website", url },
  }
}

export default async function AppliancePage({ params }: { params: Params }) {
  const { slug } = await params
  const a = applianceBySlug(slug)
  if (!a) notFound()

  const { phrase, lead, kinds, parts } = describe(a.name)
  const results = filterCatalog({ query: "", kind: "todos", appliance: a.name })
  const url = `${site.url}/catalogo/equipo/${a.slug}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Catálogo", item: `${site.url}/catalogo` },
      { "@type": "ListItem", position: 2, name: a.name, item: url },
    ],
  }

  return (
    <div className="relative isolate min-h-svh bg-black">
      <AmbientGradient edge="top" className="h-[34rem] md:h-[40rem]" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main id="contenido" tabIndex={-1} className="px-6 pb-24 outline-none md:px-8">
        <div className="mx-auto w-full max-w-6xl pt-2 pb-4 md:pt-8 md:pb-8">
          <nav aria-label="Ruta" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-blue-100/75">
            <Link href="/catalogo" className="transition-colors hover:text-white">
              Catálogo
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-white">
              {a.name}
            </span>
          </nav>
          <h1 className="text-4xl font-light tracking-tight text-balance text-white md:text-5xl">
            {lead} para <span className="instrument font-medium italic">{phrase}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-pretty leading-relaxed text-blue-100/80">
            {kinds} en tienda, con precio y disponibilidad.
            {parts.length > 0 && (
              <>
                {" "}
                Tipos de pieza: {parts.slice(0, 6).map((p) => p.name.toLowerCase()).join(", ")}
                {parts.length > 6 ? ` y ${parts.length - 6} más` : ""}.
              </>
            )}{" "}
            Si no encuentra la suya, la buscamos por usted.
          </p>
        </div>
        <Store
          key={a.slug}
          mode="equipo"
          initialAppliance={a.name}
          initialItems={results.slice(0, STORE_PAGE)}
          initialTotal={results.length}
        />
      </main>
      <Footer />
    </div>
  )
}
