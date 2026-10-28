import Section from "@/components/section"
import { brands } from "@/lib/catalog"

export default function About() {
  return (
    <Section
      id="nosotros"
      title={
        <>
          Un taller de <span className="instrument font-medium italic">confianza</span>, con el repuesto en mano
        </>
      }
    >
      <div className="grid gap-12 md:grid-cols-[3fr_2fr] md:gap-16">
        <div className="space-y-5 text-base leading-relaxed text-blue-100/85 md:text-lg">
          <p>
            Reysep es un servicio técnico especializado en equipos del hogar. Reparamos, damos mantenimiento e
            instalamos, y además vendemos los repuestos y productos que usamos en nuestro propio trabajo.
          </p>
          <p>
            Tener el repuesto en tienda cambia todo: menos esperas, menos visitas y una reparación que queda bien a
            la primera. Si una pieza no está en el catálogo, la buscamos y le avisamos cuando llega.
          </p>
          <p>Trabajamos con repuestos originales y alternativos cuando el original ya no se fabrica.</p>
        </div>

        <div className="self-start border-l border-white/10 pl-6 md:pl-8">
          <h3 className="text-xs font-medium tracking-wide text-blue-200/70 uppercase">Marcas que atendemos</h3>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-lg font-light text-white md:text-xl">
            {brands.map((brand) => (
              <li key={brand}>{brand}</li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-blue-100/70">
            ¿Otra marca? Consúltenos: la mayoría de repuestos son compatibles entre modelos.
          </p>
        </div>
      </div>
    </Section>
  )
}
