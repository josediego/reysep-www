import Link from "next/link"
import Section from "@/components/section"
import { PhoneIcon, WhatsAppIcon, MailIcon, PinIcon, ClockIcon } from "@/components/icons"
import { site, links, whatsappWith } from "@/lib/site"

export default function Contact() {
  const whatsapp = whatsappWith("Hola Reysep, necesito ayuda con un equipo.")
  const rows = [
    whatsapp && { icon: WhatsAppIcon, label: "WhatsApp", value: `+${site.whatsapp}`, href: whatsapp, external: true },
    links.call && { icon: PhoneIcon, label: "Teléfono", value: site.phone, href: links.call, external: false },
    links.email && { icon: MailIcon, label: "Correo", value: site.email, href: links.email, external: false },
    site.address && { icon: PinIcon, label: "Dirección", value: site.address, href: null, external: false },
    site.hours && { icon: ClockIcon, label: "Horario", value: site.hours, href: null, external: false },
  ].filter((r): r is Exclude<typeof r, null | false | ""> => Boolean(r))

  return (
    <Section
      id="contacto"
      title={
        <>
          Cuéntenos qué <span className="instrument font-medium italic">falla</span> y lo resolvemos
        </>
      }
      lead="Indíquenos marca, modelo y qué está pasando. Con eso le decimos si tenemos el repuesto y cuánto cuesta el servicio."
    >
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        {rows.length > 0 ? (
          <dl className="divide-y divide-white/10 border-y border-white/10">
            {rows.map(({ icon: Icon, label, value, href, external }) => (
              <div key={label} className="grid grid-cols-[2.5rem_6rem_1fr] items-center gap-3 py-4">
                <dt className="flex items-center gap-3 text-blue-200/80">
                  <Icon size={18} />
                  <span className="sr-only">{label}</span>
                </dt>
                <dd className="text-xs font-medium tracking-wide text-blue-200/70 uppercase">{label}</dd>
                <dd className="text-base text-white">
                  {href ? (
                    <a
                      href={href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="underline decoration-white/30 underline-offset-4 transition-colors duration-200 hover:decoration-white"
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="max-w-prose text-sm leading-relaxed text-blue-100/70">
            Muy pronto publicaremos nuestros canales de atención. Mientras tanto, revise el catálogo y guarde el ítem
            que necesita.
          </p>
        )}

        <div className="flex flex-col items-start gap-4 md:pl-8">
          <p className="text-sm leading-relaxed text-blue-100/80">
            ¿Ya sabe qué repuesto necesita? Búsquelo en el catálogo y use <strong className="font-medium text-white">Consultar</strong>:
            el mensaje sale con el nombre del ítem para que no tenga que escribirlo.
          </p>
          <div className="flex flex-wrap gap-3">
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-white/90"
              >
                <WhatsAppIcon size={16} />
                Escríbanos por WhatsApp
              </a>
            )}
            <Link
              href="/catalogo"
              className="rounded-full border border-white/50 px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:border-white/70 hover:bg-white/10"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    </Section>
  )
}
