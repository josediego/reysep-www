import Image from "next/image"
import { links } from "@/lib/site"

const navLinkClass =
  "text-white hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"

export default function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between p-6">
      <div className="flex items-center">
        <Image
          src="/reysep-logo-white.svg"
          alt="Reysep"
          width={116}
          height={38}
          priority
          className="h-12 w-auto"
        />
      </div>

      {/* TODO(Reysep): enlazar a secciones reales cuando existan. */}
      <nav aria-label="Principal" className="hidden items-center space-x-2 sm:flex">
        <a href="#servicios" className={navLinkClass}>
          Servicios
        </a>
        <a href="#nosotros" className={navLinkClass}>
          Sobre Nosotros
        </a>
        <a href="#contacto" className={navLinkClass}>
          Contacto
        </a>
      </nav>

      {links.call && (
        <div className="relative flex items-center">
          <a
            href={links.call}
            className="flex h-8 items-center rounded-full bg-white px-6 py-2 text-xs font-medium text-blue-600 transition-all duration-300 hover:bg-white/90"
          >
            Llámanos
          </a>
        </div>
      )}
    </header>
  )
}
