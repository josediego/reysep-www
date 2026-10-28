"use client"

import { useState, type ReactNode } from "react"

export type GallerySlide = {
  /** URL de la variante `detail`, para "Ampliar". */
  href: string
  /** Foto principal ya renderizada en el servidor (`ProductImage variant="detail"`). */
  main: ReactNode
  /** Miniatura ya renderizada (`ProductImage variant="thumb"`, decorativa). */
  thumb: ReactNode
}

/**
 * Galería de la ficha, sin librería de lightbox. Recibe las fotos ya
 * renderizadas por el servidor (así el catálogo no entra al bundle del
 * cliente) y solo gestiona cuál se muestra. Las no seleccionadas quedan
 * `hidden` con `loading="lazy"`, así que el navegador no las descarga hasta
 * elegirlas. Sin fotos, muestra `fallback` (silueta + "Foto pendiente").
 */
export default function ProductGallery({ slides, fallback }: { slides: GallerySlide[]; fallback: ReactNode }) {
  const [index, setIndex] = useState(0)
  if (slides.length === 0) return <>{fallback}</>
  const current = Math.min(index, slides.length - 1)

  return (
    <div className="min-w-0 md:self-start">
      <div className="relative">
        {slides.map((s, i) => (
          <div key={i} hidden={i !== current}>
            {s.main}
          </div>
        ))}
        <a
          href={slides[current].href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-3 bottom-3 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Ampliar
          <span className="sr-only">
            {" "}
            foto {current + 1} de {slides.length} (se abre en una pestaña nueva)
          </span>
        </a>
      </div>

      {slides.length > 1 && (
        <ul aria-label="Fotos del producto" className="mt-3 flex flex-wrap gap-2">
          {slides.map((s, i) => {
            const selected = i === current
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={selected}
                  aria-label={`Ver foto ${i + 1} de ${slides.length}`}
                  className={`block rounded-lg transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    selected ? "opacity-100 ring-1 ring-blue-300/70" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {s.thumb}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
