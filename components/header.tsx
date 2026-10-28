import Image from "next/image"
import Link from "next/link"
import { links } from "@/lib/site"
import { navItems } from "@/lib/nav"
import MobileNav from "@/components/mobile-nav"
import { WhatsAppIcon } from "@/components/icons"

const navLinkClass =
  "text-white hover:text-white text-sm font-light px-3.5 py-2.5 rounded-full hover:bg-white/10 transition-all duration-200"

export default function Header() {
  return (
    <header className="hero-rise relative z-20 flex items-center justify-between p-6" style={{ "--d": "1300ms" } as React.CSSProperties}>
      <Link href="/" className="flex items-center" aria-label="Reysep, ir al inicio">
        <Image src="/reysep-logo-white.svg" alt="" width={116} height={38} priority className="h-12 w-auto" />
      </Link>

      <nav aria-label="Principal" className="hidden items-center space-x-2 sm:flex">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={navLinkClass}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {links.whatsapp && (
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribir por WhatsApp"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors duration-200 hover:bg-white/10 sm:hidden"
          >
            <WhatsAppIcon size={18} />
          </a>
        )}
        {links.call && (
          <a
            href={links.call}
            className="hidden h-10 items-center rounded-full bg-white px-6 text-sm font-medium text-blue-700 transition-all duration-300 hover:bg-white/90 sm:flex"
          >
            Llamar
          </a>
        )}
        <MobileNav callHref={links.call} />
      </div>
    </header>
  )
}
