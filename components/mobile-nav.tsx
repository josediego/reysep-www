"use client"

import { useEffect, useId, useRef, useState } from "react"
import { MenuIcon, CloseIcon } from "@/components/icons"
import Link from "next/link"
import { navItems } from "@/lib/nav"

/**
 * Menú móvil. El panel cubre el contenido de abajo, así que mientras está
 * abierto: el foco queda dentro (botón + enlaces), Escape y un toque fuera lo
 * cierran devolviendo el foco al botón, y la página no se desplaza por detrás.
 */
export default function MobileNav({ callHref }: { callHref: string | null }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const root = rootRef.current
    const close = (refocus: boolean) => {
      setOpen(false)
      if (refocus) buttonRef.current?.focus()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close(true)
        return
      }
      if (e.key !== "Tab" || !root) return
      const focusables = [...root.querySelectorAll<HTMLElement>("button, a[href]")]
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (root && !root.contains(e.target as Node)) close(false)
    }
    // Bloqueo de scroll: el panel está anclado a la cabecera y se iría con la página.
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      html.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  return (
    <div ref={rootRef} className="sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10"
      >
        <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-30 border-y border-white/10 bg-black/95 px-6 py-4 backdrop-blur-md"
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
              Llamar
            </a>
          )}
        </nav>
      </div>
    </div>
  )
}
