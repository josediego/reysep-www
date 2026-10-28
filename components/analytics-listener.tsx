"use client"

import { useEffect } from "react"
import { inquiryEvent, itemIdFrom, surfaceFromPath, track } from "@/lib/analytics"

const INQUIRY_SELECTOR = 'a[href^="https://wa.me/"], a[href^="tel:"]'
const DEDUPE_MS = 1000
const SEARCH_DEBOUNCE_MS = 800

/**
 * Mide consultas sin tocar los CTA: un solo listener delegado en `document`.
 * No llama a preventDefault; Enter sobre un enlace también dispara `click`.
 * `surface` sale del `[data-surface]` más cercano o de la ruta.
 */
export default function AnalyticsListener() {
  useEffect(() => {
    let lastHref = ""
    let lastAt = 0

    function onClick(e: MouseEvent) {
      const target = e.target
      if (!(target instanceof Element)) return
      const link = target.closest<HTMLAnchorElement>(INQUIRY_SELECTOR)
      if (!link) return
      const href = link.getAttribute("href") ?? ""
      const event = inquiryEvent(href)
      if (!event) return

      const now = Date.now()
      if (href === lastHref && now - lastAt < DEDUPE_MS) return
      lastHref = href
      lastAt = now

      const pathname = window.location.pathname
      const surface = link.closest<HTMLElement>("[data-surface]")?.dataset.surface || surfaceFromPath(pathname)
      const itemId = itemIdFrom(pathname, href)
      track(event, { surface, ...(itemId ? { item_id: itemId } : {}) })
    }

    let searchTimer: ReturnType<typeof setTimeout> | undefined
    let lastSent = ""

    function onInput(e: Event) {
      const input = e.target
      if (!(input instanceof HTMLInputElement) || input.type !== "search") return
      if (!window.location.pathname.startsWith("/catalogo")) return
      clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        const value = input.value.trim()
        if (!value || value === lastSent) return
        lastSent = value
        // El contenedor de resultados (aria-controls) solo se renderiza si hay resultados.
        const controls = input.getAttribute("aria-controls")
        const hasResults = controls ? document.getElementById(controls) !== null : null
        // Nunca se envía el texto buscado, solo su longitud.
        track("catalog_search", { query_length: value.length, has_results: hasResults })
      }, SEARCH_DEBOUNCE_MS)
    }

    document.addEventListener("click", onClick, { capture: true, passive: true })
    document.addEventListener("input", onInput, { passive: true })
    return () => {
      clearTimeout(searchTimer)
      document.removeEventListener("click", onClick, { capture: true })
      document.removeEventListener("input", onInput)
    }
  }, [])

  return null
}
