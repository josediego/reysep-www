import type { CatalogImage, CatalogItem } from "@/lib/catalog"
import { displayName } from "@/lib/catalog"
import PartGlyph from "@/components/part-glyph"
import type { GallerySlide } from "@/components/product-gallery"

type ImageItem = Pick<CatalogItem, "name" | "title" | "partType" | "images">

/** Imágenes de una variante, en el orden publicado por el CMS. */
export function imagesOf(item: Pick<CatalogItem, "images">, variant: CatalogImage["variant"]): CatalogImage[] {
  return (item.images ?? []).filter((img) => img.variant === variant)
}

/** Primera imagen de la variante, o `undefined` si el CMS no la publicó. */
export function imageOf(item: Pick<CatalogItem, "images">, variant: CatalogImage["variant"]): CatalogImage | undefined {
  return item.images?.find((img) => img.variant === variant)
}

/**
 * Diapositivas para `ProductGallery`: fotos = imágenes `detail` en el orden del
 * CMS; la miniatura i usa la `thumb` i si existe, si no la propia `detail`.
 */
export function gallerySlides(item: ImageItem): GallerySlide[] {
  const details = imagesOf(item, "detail")
  const thumbs = imagesOf(item, "thumb")
  return details.map((img, i) => ({
    href: img.url,
    main: (
      <ProductImage
        item={item}
        variant="detail"
        image={img}
        className="aspect-[4/3] w-full rounded-2xl md:aspect-square"
        loading={i === 0 ? "eager" : "lazy"}
        fetchPriority={i === 0 ? "high" : undefined}
      />
    ),
    thumb: <ProductImage item={item} variant="thumb" image={thumbs[i] ?? img} className="h-14 w-14 rounded-lg" decorative />,
  }))
}

/**
 * Foto del producto (variante pre-generada por el CMS en cdn.reysep.com) o, si
 * el ítem no tiene esa variante, la silueta `PartGlyph`. Sin next/image: el
 * sitio es estático y las variantes ya vienen al tamaño correcto.
 *
 * `className` define tamaño y redondeo del marco (por defecto un tile de 48 px).
 */
export default function ProductImage({
  item,
  variant,
  image,
  className = "h-12 w-12 rounded-lg",
  glyphSize = 28,
  glyphClassName = "",
  loading = "lazy",
  fetchPriority,
  decorative = false,
}: {
  item: ImageItem
  variant: CatalogImage["variant"]
  /** Imagen concreta (p. ej. la seleccionada en la galería). Por defecto, la primera de la variante. */
  image?: CatalogImage
  className?: string
  glyphSize?: number
  glyphClassName?: string
  loading?: "lazy" | "eager"
  fetchPriority?: "high" | "low" | "auto"
  /** `alt=""` cuando un texto o control vecino ya nombra el producto. */
  decorative?: boolean
}) {
  const img = image ?? imageOf(item, variant)
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white/[0.03] text-blue-200/80 ${className}`}
      data-variant={variant}
      data-fallback={img ? undefined : "glyph"}
    >
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element -- variantes pre-generadas, sin optimizador
        <img
          src={img.url}
          width={img.width}
          height={img.height}
          alt={decorative ? "" : img.alt.trim() || displayName(item)}
          loading={loading}
          decoding="async"
          {...(fetchPriority ? { fetchPriority } : {})}
          className={`h-full w-full ${variant === "detail" ? "object-contain" : "object-cover"}`}
        />
      ) : (
        <PartGlyph item={item} size={glyphSize} className={glyphClassName} />
      )}
    </span>
  )
}
