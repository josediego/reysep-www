import Section from "@/components/section"
import { services } from "@/lib/catalog"
import { WrenchIcon, ShieldIcon, PlugIcon, BoxIcon } from "@/components/icons"
import { links, whatsappWith } from "@/lib/site"

const icons = {
  reparacion: WrenchIcon,
  mantenimiento: ShieldIcon,
  instalacion: PlugIcon,
  repuestos: BoxIcon,
} as const

export default function Services() {
  const cta = whatsappWith("Hola Reysep, quiero solicitar un servicio técnico.") ?? links.call ?? "#contacto"
  const external = cta.startsWith("http")

  return (
    <Section
      id="servicios"
      title={
        <>
          Lo que <span className="instrument font-medium italic">hacemos</span> por sus equipos
        </>
      }
      lead="Atendemos equipos del hogar de principio a fin: diagnosticamos, reparamos con el repuesto correcto y dejamos todo funcionando y probado."
    >
      <ol className="divide-y divide-white/10 border-y border-white/10">
        {services.map((service) => {
          const Icon = icons[service.id]
          return (
            <li
              key={service.id}
              className="group grid gap-4 py-7 md:grid-cols-[3rem_1fr_2fr] md:gap-8 md:py-8"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-blue-200 transition-colors duration-200 group-hover:border-blue-300/60 group-hover:text-white">
                <Icon size={20} />
              </span>
              <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
                {service.title}
              </h3>
              <p className="max-w-prose text-sm leading-relaxed text-blue-100/80 md:self-center md:text-base">{service.text}</p>
            </li>
          )
        })}
      </ol>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <a
          href={cta}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="rounded-full bg-white px-8 py-3.5 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-white/90"
        >
          Pedir servicio
        </a>
        <p className="text-sm text-blue-100/75">Atención a domicilio y en taller. Presupuesto previo sin compromiso.</p>
      </div>
    </Section>
  )
}
