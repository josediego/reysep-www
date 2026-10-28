import type { Metadata } from "next"
import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Store from "@/components/store"
import AmbientGradient from "@/components/ambient-gradient"
import { counts, appliances } from "@/lib/catalog"

export const metadata: Metadata = {
  title: "Catálogo de repuestos y productos",
  description: `${counts.repuesto} repuestos y ${counts.producto} productos para ${appliances
    .slice(0, 5)
    .map((a) => a.name.toLowerCase())
    .join(", ")} y más. Precio y disponibilidad al instante.`,
  alternates: { canonical: "/catalogo" },
}

export default function CatalogoPage() {
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
        <Suspense fallback={<div className="mx-auto max-w-6xl text-sm text-blue-100/70">Cargando catálogo…</div>}>
          <Store />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
