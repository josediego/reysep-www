"use client"

import { useEffect, useId, useState } from "react"
import { MenuIcon, CloseIcon } from "@/components/icons"
import Link from "next/link"
import { navItems } from "@/lib/nav"

export default function MobileNav({ callHref }: { callHref: string | null }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10"
      >
        <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-30 border-y border-white/10 bg-black/80 px-6 py-4 backdrop-blur-md"
      >
        <nav aria-label="Principal (móvil)" className="flex flex-col">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-light text-white transition-colors duration-200 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
          {callHref && (
            <a
              href={callHref}
              onClick={() => setOpen(false)}
              className="mt-3 rounded-full bg-white px-6 py-3.5 text-center text-sm font-medium text-blue-700"
            >
              Llámanos
            </a>
          )}
        </nav>
      </div>
    </div>
  )
}
