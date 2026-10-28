"use client"

import { useEffect, useRef, type ElementType, type ReactNode } from "react"

type Props = {
  children: ReactNode
  /** Variante CSS (ver globals.css): "rise" (por defecto), "wipe", "line". */
  variant?: "rise" | "wipe" | "line"
  /** Retraso en ms, acotado. Para listas use `stagger` en el padre. */
  delay?: number
  /** Aplica retraso escalonado a los hijos directos marcados con data-reveal-item. */
  stagger?: boolean
  as?: ElementType
  className?: string
  id?: string
}

/**
 * Marca un bloque para revelarse al entrar en el viewport. Sin JS el contenido
 * es visible (la clase `js` en <html> activa el estado oculto inicial).
 */
export default function Reveal({ children, variant = "rise", delay = 0, stagger = false, as, className = "", id }: Props) {
  const Tag = (as ?? "div") as ElementType
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!("IntersectionObserver" in window)) {
      el.setAttribute("data-inview", "")
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.setAttribute("data-inview", "")
            io.disconnect()
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      id={id}
      data-reveal={variant}
      data-stagger={stagger ? "" : undefined}
      style={delay ? ({ "--reveal-delay": `${Math.min(delay, 400)}ms` } as React.CSSProperties) : undefined}
      className={className}
    >
      {variant === "wipe" ? <span className="reveal-clip">{children}</span> : children}
    </Tag>
  )
}
