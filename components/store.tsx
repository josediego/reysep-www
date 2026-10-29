"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react"
import { SearchIcon, ArrowIcon, WhatsAppIcon, CloseIcon } from "@/components/icons"
import PartGlyph from "@/components/part-glyph"
import ProductImage, { imageOf } from "@/components/product-image"
import { counts, formatPrice, kindPlural, normalize, displayName, type Appliance, type CatalogItem } from "@/lib/catalog"
import { STORE_PAGE as PAGE, appliancePath, applianceRoutes, filterCatalog, parseKind, type KindFilter } from "@/lib/slugs"
import { whatsappWith, inquiryMessage } from "@/lib/site"

const kindFilters: { value: KindFilter; label: string }[] = [
  { value: "todos", label: "Todo" },
  { value: "repuesto", label: kindPlural.repuesto },
  { value: "producto", label: kindPlural.producto },
]

export type StoreProps = {
  initialQuery?: string
  initialKind?: KindFilter
  initialAppliance?: Appliance | null
  /** Primera página de resultados del estado inicial, calculada en el servidor. */
  initialItems: CatalogItem[]
  /** Total de resultados del estado inicial. */
  initialTotal: number
  /**
   * `catalogo`: el chip de equipo filtra en el sitio (`?equipo=`).
   * `equipo`: página estática de un equipo; los chips enlazan a las otras páginas de equipo.
   */
  mode?: "catalogo" | "equipo"
}

function queryString(q: string, kind: KindFilter, appliance: Appliance | null) {
  const next = new URLSearchParams()
  if (q) next.set("q", q)
  if (kind !== "todos") next.set("tipo", kind)
  if (appliance) next.set("equipo", appliance)
  const qs = next.toString()
  return qs ? `?${qs}` : ""
}

export default function Store({
  initialQuery = "",
  initialKind = "todos",
  initialAppliance = null,
  initialItems,
  initialTotal,
  mode = "catalogo",
}: StoreProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [kind, setKind] = useState<KindFilter>(initialKind)
  const [catalogAppliance, setAppliance] = useState<Appliance | null>(initialAppliance)
  const appliance = mode === "equipo" ? initialAppliance : catalogAppliance
  const [limit, setLimit] = useState(PAGE)
  const deferredQuery = useDeferredValue(query)
  const searchId = useId()
  const resultsId = useId()
  const searchRef = useRef<HTMLInputElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)

  // Fila de chips desplazable en móvil: al llegar con un equipo elegido
  // (?equipo= o página de equipo), el chip activo queda a la vista.
  useEffect(() => {
    const row = chipsRef.current
    const chip = row?.querySelector<HTMLElement>('[data-appliance-chip][aria-pressed="true"]')
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return
    const r = row.getBoundingClientRect()
    const c = chip.getBoundingClientRect()
    if (c.left >= r.left && c.right <= r.right) return
    row.scrollLeft += c.left - r.left - (r.width - c.width) / 2
    // Solo al montar: los cambios posteriores los hace el propio usuario sobre la fila.
  }, [])

  // Al llegar al final de la fila se quita el desvanecido (el último chip se ve entero).
  useEffect(() => {
    const row = chipsRef.current
    if (!row) return
    const update = () => row.toggleAttribute("data-end", row.scrollLeft + row.clientWidth >= row.scrollWidth - 4)
    update()
    row.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      row.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  // La página de equipo es estática: si llega con ?q= o ?tipo=, se aplican al montar.
  useEffect(() => {
    if (mode !== "equipo") return
    const params = new URLSearchParams(window.location.search)
    const q = params.get("q")
    const t = params.get("tipo")
    if (q) setQuery(q)
    if (t) setKind(parseKind(t))
  }, [mode])

  // Refleja el estado en la URL. history.replaceState (integrado con el router de
  // Next 15) evita que cada cambio vuelva a pedir la página dinámica al servidor.
  useEffect(() => {
    const qs = queryString(deferredQuery.trim(), kind, mode === "equipo" ? null : appliance)
    if (qs === window.location.search) return
    const t = setTimeout(() => window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs}`), 250)
    return () => clearTimeout(t)
  }, [deferredQuery, kind, appliance, mode])

  const isInitial = deferredQuery === initialQuery && kind === initialKind && appliance === initialAppliance
  // En el estado inicial se pintan las filas del servidor; se filtra en el cliente solo al cambiar algo.
  const full = useMemo(
    () => (isInitial && limit <= initialItems.length ? null : filterCatalog({ query: deferredQuery, kind, appliance })),
    [isInitial, limit, initialItems.length, deferredQuery, kind, appliance],
  )
  const total = full ? full.length : initialTotal
  const visible = useMemo(() => (full ?? initialItems).slice(0, limit), [full, initialItems, limit])
  const hasMore = total > limit
  const grouped = useMemo(() => groupByPartType(visible), [visible])

  function changeKind(next: KindFilter) {
    setKind(next)
    setLimit(PAGE)
  }

  function changeAppliance(next: Appliance | null) {
    if (mode === "equipo") {
      // Página estática por equipo: otro equipo es otra página; "todos" vuelve a /catalogo.
      // Se conservan la búsqueda y el tipo.
      const carry = queryString(query.trim(), kind, null)
      const path = next ? appliancePath(next) : null
      router.push(path ? `${path}${carry}` : `/catalogo${queryString(query.trim(), kind, next)}`)
      return
    }
    setAppliance(next)
    setLimit(PAGE)
  }

  function reset() {
    setQuery("")
    setKind("todos")
    if (mode === "catalogo") setAppliance(null)
    setLimit(PAGE)
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Búsqueda: fija en móvil. Filtros en una sola fila desplazable. */}
      <div className="sticky top-0 z-20 -mx-6 bg-black/85 px-6 pt-3 pb-2 backdrop-blur-md md:static md:mx-0 md:bg-transparent md:px-0 md:pt-0 md:pb-0 md:backdrop-blur-none">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label htmlFor={searchId} className="relative block w-full md:max-w-xl">
            <span className="sr-only">Buscar en el catálogo</span>
            <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-blue-200/70" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setLimit(PAGE)
              }}
              ref={searchRef}
              placeholder="Buscar pieza, marca o modelo"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="search"
              aria-controls={resultsId}
              onKeyDown={(e) => {
                // "Buscar" en el teclado móvil: cierra el teclado para ver los resultados.
                if (e.key === "Enter") e.currentTarget.blur()
              }}
              className="search-input h-12 w-full rounded-full border border-white/15 bg-white/5 pr-12 pl-11 text-base text-white placeholder:text-blue-100/50 transition-colors duration-200 hover:border-white/30 focus:border-white/60 focus:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:text-sm"
            />
            {query && (
              <button
                type="button"
                aria-label="Borrar búsqueda"
                onClick={() => {
                  setQuery("")
                  setLimit(PAGE)
                  searchRef.current?.focus()
                }}
                className="absolute top-1/2 right-0.5 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-blue-200/80 transition-colors duration-200 hover:text-white"
              >
                <CloseIcon size={16} />
              </button>
            )}
          </label>

          <div role="group" aria-label="Tipo" className="hidden self-start rounded-full border border-white/15 p-1 md:inline-flex">
            {kindFilters.map((f) => {
              const active = kind === f.value
              const n = f.value === "todos" ? counts.total : counts[f.value]
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => changeKind(f.value)}
                  className={`rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                    active ? "bg-white font-medium text-blue-700" : "font-light text-white hover:bg-white/10"
                  }`}
                >
                  {f.label}
                  {/* Los totales globales confunden dentro de un equipo: solo se muestran en /catalogo */}
                  {mode === "catalogo" && (
                    <span className={`ml-1 tabular-nums ${active ? "text-blue-800" : "text-blue-100/75"}`}>{n}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* En móvil la fila se desplaza en horizontal: el borde derecho se desvanece para insinuarlo. */}
      <div
        ref={chipsRef}
        className="chip-row -mx-6 mt-2 overflow-x-auto overscroll-x-contain px-6 md:mx-0 md:mt-4 md:px-0"
        style={{ scrollbarWidth: "none" }}
      >
        <div role="group" aria-label="Filtros" className="flex w-max gap-2 md:flex-wrap">
          {/* En móvil el tipo va como chips; en escritorio está en el segmentado de arriba */}
          {kindFilters
            .filter((f) => f.value !== "todos")
            .map((f) => (
              <Chip
                key={f.value}
                active={kind === f.value}
                onClick={() => changeKind(kind === f.value ? "todos" : f.value)}
                className="md:hidden"
              >
                {f.label}
              </Chip>
            ))}
          <span aria-hidden="true" className="mx-1 w-px self-stretch bg-white/15 md:hidden" />
          <Chip active={!appliance} onClick={() => changeAppliance(null)} data-appliance-chip>
            Todos los equipos
          </Chip>
          {applianceRoutes.map((a) => (
            <Chip
              key={a.slug}
              active={appliance === a.name}
              onClick={() => changeAppliance(appliance === a.name ? null : a.name)}
              data-appliance-chip
            >
              {a.name} <span className="hidden tabular-nums opacity-70 md:inline">{a.count}</span>
            </Chip>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-blue-100/75 tabular-nums" aria-live="polite">
        {total === 0
          ? ""
          : `${total} ${total === 1 ? "ítem" : "ítems"}${total > visible.length ? `, mostrando ${visible.length}` : ""}${
              appliance && mode === "catalogo" ? ` · ${appliance}` : ""
            }`}
      </p>

      {total === 0 ? (
        <EmptyState query={query} onReset={reset} />
      ) : (
        <div id={resultsId} className="mt-2">
          {grouped.map(([partType, items]) => (
            <section key={partType} aria-labelledby={`pt-${slug(partType)}`} className="border-t border-white/10 py-4 md:py-5">
              <h2 id={`pt-${slug(partType)}`} className="mb-1 text-xs font-medium tracking-wide text-blue-200/80 uppercase">
                {partType} <span className="tabular-nums normal-case opacity-70">· {items.length}</span>
              </h2>
              <ul className="divide-y divide-white/[0.06]">
                {items.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE)}
            className="rounded-full border border-white/50 px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:border-white/70 hover:bg-white/10"
          >
            Mostrar {Math.min(PAGE, total - visible.length)} más
          </button>
        </div>
      )}
    </div>
  )
}

function chipTone(active: boolean) {
  return active
    ? "border-white bg-white font-medium text-blue-700"
    : "border-white/15 font-light text-white hover:border-white/40 hover:bg-white/10"
}

function groupByPartType(items: CatalogItem[]): [string, CatalogItem[]][] {
  const map = new Map<string, CatalogItem[]>()
  for (const item of items) {
    const key = item.partType ?? "Otros"
    const list = map.get(key)
    if (list) list.push(item)
    else map.set(key, [item])
  }
  return [...map.entries()]
}

function slug(text: string) {
  return normalize(text).replace(/[^a-z0-9]+/g, "-")
}

function Chip({
  active,
  onClick,
  children,
  className = "",
  ...rest
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  className?: string
  "data-appliance-chip"?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      {...rest}
      className={`min-h-11 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors duration-200 ${className} ${chipTone(active)}`}
    >
      {children}
    </button>
  )
}

function Row({ item }: { item: CatalogItem }) {
  const brandLine = [item.brand !== "Sin marca" ? item.brand : null, item.appliance].filter(Boolean).join(" · ")
  const fits = item.fitsBrands.filter((b) => b !== item.brand).slice(0, 3)
  const wa = whatsappWith(inquiryMessage(item))
  return (
    <li data-surface="store_row" className="grid grid-cols-[1fr_auto] items-center gap-x-2">
      <Link
        href={`/catalogo/${item.id}`}
        className="group grid grid-cols-[1fr_auto] items-center gap-x-3 py-3.5 transition-colors duration-200 hover:bg-white/[0.03] md:grid-cols-[3rem_1fr_10rem_5rem] md:gap-x-5"
      >
        {imageOf(item, "thumb") ? (
          <ProductImage item={item} variant="thumb" decorative className="hidden h-12 w-12 rounded-lg object-cover md:block" />
        ) : (
          <span className="hidden h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-blue-200/80 transition-colors duration-200 group-hover:border-blue-300/50 group-hover:text-white md:flex">
            <PartGlyph item={item} size={28} />
          </span>
        )}
        <span className="min-w-0">
          <span className="line-clamp-2 text-base leading-snug text-white md:truncate md:text-lg md:font-light">{displayName(item)}</span>
          <span className="mt-0.5 block truncate text-sm text-blue-100/70 md:text-xs">
            {brandLine}
            {fits.length > 0 && <span className="text-blue-100/55"> · compatible {fits.join(", ")}</span>}
          </span>
        </span>
        <span className="text-right md:text-left">
          <span className={`block text-sm tabular-nums md:text-base ${item.price === null ? "font-light text-blue-100/80" : "font-medium text-white"}`}>
            {formatPrice(item.price)}
          </span>
          <span className={`block text-sm ${item.inStock ? "text-emerald-300/90" : "text-blue-100/75"}`}>
            {item.inStock ? "Disponible" : "A pedido"}
          </span>
        </span>
        <span className="hidden items-center justify-end gap-1 text-sm text-blue-100/75 md:inline-flex">
          Ver <ArrowIcon size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </Link>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Pedir por WhatsApp: ${displayName(item)}`}
          title="Pedir por WhatsApp"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-blue-700"
        >
          <WhatsAppIcon size={18} />
        </a>
      )}
    </li>
  )
}

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  const href = whatsappWith(`Hola Reysep, busco: ${query || "un repuesto"}. ¿Lo tienen?`) ?? "/#contacto"
  const external = href.startsWith("http")
  return (
    <div data-surface="store_empty" className="mt-2 border-t border-white/10 py-16 text-center">
      <p className="text-2xl font-light tracking-tight text-white">
        No encontramos <span className="instrument italic">{query ? `“${query}”` : "resultados"}</span>
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-blue-100/75">
        Pruebe con la marca o el equipo (ej. “lavadora LG”). Si no aparece, lo buscamos: muchos repuestos son
        compatibles entre marcas.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-white/90"
        >
          Pedir este repuesto
        </a>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}
