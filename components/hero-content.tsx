import { links } from "@/lib/site"

export default function HeroContent() {
  return (
    <main id="contenido" tabIndex={-1} className="absolute bottom-8 left-8 z-20 max-w-lg outline-none">
      <div className="text-left">
        <div
          className="relative mb-4 inline-flex items-center rounded-full bg-white/5 px-3 py-1 backdrop-blur-sm"
          style={{ filter: "url(#glass-effect)" }}
        >
          <div className="absolute top-0 left-1 right-1 h-px rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span className="relative z-10 text-xs font-light text-white/90">
            <span aria-hidden="true">🏠</span> Reysep Homecenter
          </span>
        </div>

        <h1 className="mb-4 text-5xl font-light tracking-tight text-white md:text-6xl md:leading-16">
          <span className="instrument font-medium italic">Servicio</span> Técnico
          <br />
          <span className="font-light tracking-tight text-white">Especializado</span>
        </h1>

        <p className="mb-4 text-sm leading-relaxed font-normal text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          Ofrecemos servicios técnicos especializados con la más alta calidad y profesionalismo. Reparaciones,
          mantenimiento y soluciones técnicas adaptadas a sus necesidades.
        </p>

        {(links.whatsapp || links.shop) && (
          <div className="flex flex-wrap items-center gap-4">
            {links.whatsapp && (
              <a
                href={links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white px-8 py-3 text-xs font-medium text-blue-600 transition-all duration-200 hover:bg-white/90"
              >
                Solicitar Servicio
              </a>
            )}
            {links.shop && (
              <a
                href={links.shop}
                className="rounded-full border border-white/50 bg-transparent px-8 py-3 text-xs font-normal text-white transition-all duration-200 hover:border-white/70 hover:bg-white/10"
              >
                Comprar Productos
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
