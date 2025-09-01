"use client"

export default function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between p-6">
      <div className="flex items-center">
        <img
          src="/reysep-logo-white.svg"
          alt="Reysep Logo"
          className="h-12 w-auto"
        />
      </div>

      <nav className="flex items-center space-x-2">
        <a
          href="#"
          className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          Servicios
        </a>
        <a
          href="#"
          className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          Sobre Nosotros
        </a>
        <a
          href="#"
          className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          Contacto
        </a>
      </nav>

      <div className="relative flex items-center">
        <button className="px-6 py-2 rounded-full bg-white text-blue-600 font-medium text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center">
          Llámanos
        </button>
      </div>
    </header>
  )
}
