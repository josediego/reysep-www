import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AmbientGradient from "@/components/ambient-gradient"

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-svh flex-col bg-black">
      <AmbientGradient edge="top" className="h-[26rem] md:h-[32rem]" intensity={0.55} />
      <Header />
      <main id="contenido" tabIndex={-1} className="flex-1 px-6 pt-10 pb-24 outline-none md:px-8 md:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="max-w-xl text-4xl font-light tracking-tight text-balance text-white md:text-5xl">
            Esta página <span className="instrument font-medium italic">no existe</span>
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-blue-100/80">
            Puede que el enlace esté incompleto o que el ítem ya no esté en el catálogo. Busque la pieza en el catálogo o
            vuelva al inicio.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-white/90"
            >
              Ver catálogo
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/50 px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:border-white/70 hover:bg-white/10"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
