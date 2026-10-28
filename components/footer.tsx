import Image from "next/image"
import { site } from "@/lib/site"
import Link from "next/link"
import { navItems } from "@/lib/nav"

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Image src="/reysep-logo-white.svg" alt="Reysep" width={116} height={38} className="h-9 w-auto" />
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-blue-100/60">
            Servicio técnico especializado, productos y repuestos para el hogar.
          </p>
        </div>
        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-6 gap-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-light text-white/80 transition-colors duration-200 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-blue-100/75 tabular-nums">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  )
}
