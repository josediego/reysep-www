"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { navItems } from "@/lib/nav"
import { links } from "@/lib/site"
import { WhatsAppIcon } from "@/components/icons"

/**
 * Cabecera compacta que aparece al dejar atrás el hero. Explica la
 * continuidad: la navegación sigue disponible cuando el hero ya no está.
 */
export default function StickyHeader({ watch = "#inicio" }: { watch?: string }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const target = document.querySelector(watch)
    if (!target || !("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting), {
      rootMargin: "-72px 0px 0px 0px",
      threshold: 0,
    })
    io.observe(target)
    return () => io.disconnect()
  }, [watch])

  return (
    <div
      aria-hidden={!shown}
      data-shown={shown ? "" : undefined}
      data-surface="sticky_header"
      className="sticky-header fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6 md:px-8">
        <Link href="/" aria-label="Reysep, ir al inicio" tabIndex={shown ? 0 : -1}>
          <Image src="/reysep-logo-white.svg" alt="" width={116} height={38} className="h-8 w-auto" />
        </Link>
        <nav aria-label="Principal (compacta)" className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={shown ? 0 : -1}
              className="rounded-full px-3.5 py-2 text-sm font-light text-white transition-colors duration-200 hover:bg-white/10"
            >
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
              tabIndex={shown ? 0 : -1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors duration-200 hover:bg-white/10"
            >
              <WhatsAppIcon size={16} />
            </a>
          )}
          {links.call && (
            <a
              href={links.call}
              tabIndex={shown ? 0 : -1}
              className="flex h-9 items-center rounded-full bg-white px-5 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-white/90"
            >
              Llamar
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
