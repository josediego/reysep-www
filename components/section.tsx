import type { ReactNode } from "react"

type SectionProps = {
  id: string
  title: ReactNode
  lead?: ReactNode
  children: ReactNode
  className?: string
  /** Capa decorativa detrás del contenido (ej. AmbientGradient). */
  background?: ReactNode
}

/** Contenedor de sección con cabecera alineada a la retícula del hero. */
export default function Section({ id, title, lead, children, className = "", background }: SectionProps) {
  return (
    <section id={id} className={`relative isolate scroll-mt-20 px-6 py-20 md:px-8 md:py-28 ${className}`}>
      {background}
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 max-w-2xl md:mb-16">
          <h2 className="text-4xl font-light tracking-tight text-balance text-white md:text-5xl md:leading-[1.05]">
            {title}
          </h2>
          {lead && <p className="mt-5 max-w-prose text-base leading-relaxed text-blue-100/80">{lead}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}
