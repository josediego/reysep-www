import Link from "next/link"
import { links, whatsappWith } from "@/lib/site"
import { HomeIcon } from "@/components/icons"
import { counts } from "@/lib/catalog"

export default function HeroContent() {
  const service = whatsappWith("Hola Reysep, quiero solicitar un servicio técnico.") ?? links.call ?? "#contacto"
  const external = service.startsWith("http")

  return (
    <main id="contenido" tabIndex={-1} className="relative z-20 flex flex-1 items-end outline-none">
      <div className="max-w-lg p-6 pb-10 text-left md:p-8 md:pb-12">
        <div
          className="hero-rise relative mb-4 inline-flex items-center rounded-full bg-white/5 px-3 py-1 backdrop-blur-sm"
          style={{ filter: "url(#glass-effect)", "--d": "500ms" } as React.CSSProperties}
        >
          <div className="absolute top-0 right-1 left-1 h-px rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span className="relative z-10 inline-flex items-center gap-1.5 text-xs font-light text-white/90">
            <HomeIcon size={14} /> Reysep Homecenter
          </span>
        </div>

        <h1 className="mb-4 text-5xl font-light tracking-tight text-white md:text-6xl md:leading-16">
          <span className="hero-line" style={{ "--d": "650ms" } as React.CSSProperties}>
            <span className="instrument font-medium italic">Servicio</span> Técnico
          </span>
          <br />
          <span className="hero-line font-light tracking-tight text-white" style={{ "--d": "800ms" } as React.CSSProperties}>
            Especializado
          </span>
        </h1>

        <p
          className="hero-rise mb-6 max-w-prose text-base leading-relaxed font-normal text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          style={{ "--d": "1050ms" } as React.CSSProperties}
        >
          Reparación, mantenimiento e instalación de equipos del hogar, con un catálogo de {counts.total} productos y
          repuestos listos para entregar.
        </p>

        <div className="hero-rise flex flex-wrap items-center gap-4" style={{ "--d": "1200ms" } as React.CSSProperties}>
          <a
            href={service}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="rounded-full bg-white px-8 py-3.5 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-white/90"
          >
            Pedir servicio
          </a>
          <Link
            href={links.shop}
            className="rounded-full border border-white/50 bg-transparent px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:border-white/70 hover:bg-white/10"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </main>
  )
}
