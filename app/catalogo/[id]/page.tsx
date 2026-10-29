import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductImage, { gallerySlides, imagesOf } from "@/components/product-image"
import ProductGallery from "@/components/product-gallery"
import AmbientGradient from "@/components/ambient-gradient"
import { ArrowIcon, WhatsAppIcon, PhoneIcon } from "@/components/icons"
import { catalog, displayName, formatPrice, itemById, kindLabel, relatedItems, validationLabel } from "@/lib/catalog"
import { site, links, whatsappWith, inquiryMessage } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  return catalog.map((item) => ({ id: item.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const item = itemById.get(id)
  if (!item) return {}
  const title = item.title ? item.title : `${item.name}${item.brand !== "Sin marca" ? ` ${item.brand}` : ""}`
  const description =
    item.summary ??
    `${item.partType ?? kindLabel[item.kind]} para ${item.appliance ?? item.category}. ${formatPrice(item.price)}. ${
      item.inStock ? "Disponible en tienda." : "A pedido."
    }`
  return {
    title,
    description,
    alternates: { canonical: `/catalogo/${item.id}` },
    openGraph: { title, description, type: "website", url: `/catalogo/${item.id}` },
  }
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = itemById.get(id)
  if (!item) notFound()

  const cta = whatsappWith(inquiryMessage(item)) ?? "/#contacto"
  const external = cta.startsWith("http")
  const related = relatedItems(item)
  const specs = Object.entries(item.specs)
  const fits = item.fitsBrands.filter((b) => b !== item.brand)
  const verified = item.validation?.status === "verified"
  const photos = imagesOf(item, "detail")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName(item),
    ...(item.title ? { alternateName: item.name } : {}),
    sku: item.id,
    category: item.category,
    ...(item.brand !== "Sin marca" ? { brand: { "@type": "Brand", name: item.brand } } : {}),
    ...(item.summary ? { description: item.summary } : {}),
    ...(photos.length > 0 ? { image: photos.map((img) => img.url) } : {}),
    url: `${site.url}/catalogo/${item.id}`,
    ...(item.price !== null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "PEN",
            price: item.price,
            availability: item.inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
            seller: { "@id": `${site.url}/#organization` },
          },
        }
      : {}),
  }

  return (
    // pb en móvil: espacio para la barra fija de abajo (no tapa el pie de página).
    <div className="relative isolate min-h-svh bg-black pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <AmbientGradient edge="top" className="h-[26rem] md:h-[32rem]" intensity={0.55} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Header />

      <main id="contenido" tabIndex={-1} data-surface="item" className="px-6 pb-16 outline-none md:px-8 md:pb-24">
        <div className="mx-auto w-full max-w-6xl">
        <nav aria-label="Ruta" className="mb-3 flex flex-wrap items-center gap-x-2 text-sm text-blue-100/75 md:mb-6">
          <Link href="/catalogo" className="inline-flex min-h-11 items-center transition-colors hover:text-white">
            Catálogo
          </Link>
          {item.appliance && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={`/catalogo?equipo=${encodeURIComponent(item.appliance)}`} className="inline-flex min-h-11 items-center transition-colors hover:text-white">
                {item.appliance}
              </Link>
            </>
          )}
          {item.partType && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={`/catalogo?q=${encodeURIComponent(item.partType)}`} className="inline-flex min-h-11 items-center transition-colors hover:text-white">
                {item.partType}
              </Link>
            </>
          )}
        </nav>

        <article className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-14">
          {/* Imagen / silueta */}
          <ProductGallery
            slides={gallerySlides(item)}
            fallback={
              <div className="relative md:self-start">
                <ProductImage
                  item={item}
                  variant="detail"
                  className="aspect-[4/3] w-full rounded-2xl md:aspect-square"
                  glyphSize={120}
                  glyphClassName="md:h-56 md:w-56"
                />
                <span className="absolute bottom-3 left-3 rounded-full border border-white/10 px-2.5 py-1 text-xs text-blue-100/75">
                  Foto pendiente
                </span>
              </div>
            }
          />

          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-blue-200/80 uppercase">
              {item.partType ?? kindLabel[item.kind]}
              {item.appliance && <span className="normal-case tracking-normal text-blue-100/60"> · {item.appliance}</span>}
            </p>
            <h1 className="mt-2 text-3xl font-light tracking-tight text-balance text-white md:text-5xl md:leading-[1.05]">
              {displayName(item)}
            </h1>
            {item.title && <p className="mt-2 text-sm text-blue-100/70">Nombre de inventario: {item.name}</p>}
            {item.brand !== "Sin marca" && <p className="mt-2 text-sm text-blue-100/80">Marca: {item.brand}</p>}

            <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-2">
              <p className="text-3xl font-medium text-white tabular-nums md:text-4xl">
                {formatPrice(item.price)}
                {item.unit && item.price !== null && (
                  <span className="ml-1.5 text-sm font-light text-blue-100/75">/ {item.unit}</span>
                )}
              </p>
              <p className={`pb-1 text-sm ${item.inStock ? "text-emerald-300/90" : "text-blue-100/75"}`}>
                {item.inStock ? "Disponible en tienda" : "A pedido, consulte plazo"}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={cta}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-white/90"
              >
                <WhatsAppIcon size={16} />
                Pedir por WhatsApp
              </a>
              {links.call && (
                <a
                  href={links.call}
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10"
                >
                  <PhoneIcon size={16} />
                  Llamar
                </a>
              )}
            </div>
            <p className="mt-3 text-sm text-blue-100/70">
              El mensaje ya lleva el nombre y la referencia. Solo pulse enviar.
            </p>

            {item.summary && <p className="mt-8 max-w-prose text-base leading-relaxed text-blue-100/85">{item.summary}</p>}

            <dl className="mt-8 divide-y divide-white/10 border-y border-white/10 text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-2.5">
                  <dt className="text-blue-100/70 capitalize">{k.replace(/_/g, " ")}</dt>
                  <dd className="text-white">{v}</dd>
                </div>
              ))}
              {(fits.length > 0 || item.fitsModels.length > 0) && (
                <div className="grid grid-cols-[8rem_1fr] gap-4 py-2.5">
                  <dt className="text-blue-100/70">Compatible con</dt>
                  <dd className="text-white">
                    {fits.join(", ")}
                    {fits.length > 0 && item.fitsModels.length > 0 && " · "}
                    {item.fitsModels.length > 0 && <span className="tabular-nums">{item.fitsModels.join(", ")}</span>}
                  </dd>
                </div>
              )}
              {item.modelCodes.length > 0 && (
                <div className="grid grid-cols-[8rem_1fr] gap-4 py-2.5">
                  <dt className="text-blue-100/70">Códigos</dt>
                  <dd className="text-white tabular-nums">{item.modelCodes.join(", ")}</dd>
                </div>
              )}
              <div className="grid grid-cols-[8rem_1fr] gap-4 py-2.5">
                <dt className="text-blue-100/70">Categoría</dt>
                <dd className="text-white">{item.category}</dd>
              </div>
              <div className="grid grid-cols-[8rem_1fr] gap-4 py-2.5">
                <dt className="text-blue-100/70">Referencia</dt>
                <dd className="text-white tabular-nums">{item.id}</dd>
              </div>
            </dl>

            {item.validation && (
              <p className="mt-4 text-sm leading-relaxed text-blue-100/70">
                {verified ? "Ficha verificada con fuente externa." : `Ficha ${validationLabel[item.validation.status].toLowerCase()}.`}{" "}
                Confirme marca y modelo de su equipo al consultar: nuestro técnico valida la compatibilidad antes de la
                venta.
              </p>
            )}
          </div>
        </article>

        {related.length > 0 && (
          <section aria-labelledby="relacionados" className="mt-16 border-t border-white/10 pt-8 md:mt-20">
            <h2 id="relacionados" className="text-xl font-light tracking-tight text-white md:text-2xl">
              También en {item.partType ? item.partType.toLowerCase() : item.appliance?.toLowerCase() ?? "catálogo"}
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.id} className="min-w-0 border-t border-white/[0.08]">
                  <Link href={`/catalogo/${r.id}`} className="group flex items-center gap-3 py-3">
                    <ProductImage
                      item={r}
                      variant="thumb"
                      className="h-10 w-10 rounded-lg group-hover:text-white"
                      glyphSize={24}
                      decorative
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-white">{displayName(r)}</span>
                      <span className="block text-sm text-blue-100/75 tabular-nums">{formatPrice(r.price)}</span>
                    </span>
                    <ArrowIcon size={14} className="text-blue-100/75 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        </div>
      </main>

      {/* CTA persistente en móvil */}
      <aside aria-label="Acciones rápidas" data-surface="item_sticky" className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/90 pt-3 pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-medium text-white tabular-nums">{formatPrice(item.price)}</p>
          <a
            href={cta}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-blue-700"
          >
            <WhatsAppIcon size={16} />
            Pedir
          </a>
        </div>
      </aside>
      <Footer />
    </div>
  )
}
