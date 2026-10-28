"use client"

import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useDeferredValue, useEffect, useId, useMemo, useState, type ReactNode } from "react"
import { SearchIcon, ArrowIcon, WhatsAppIcon } from "@/components/icons"
import PartGlyph from "@/components/part-glyph"
import {
  appliances,
  catalog,
  counts,
  formatPrice,
  kindPlural,
  normalize,
  searchText,
  type Appliance,
  type CatalogItem,
  type CatalogKind,
} from "@/lib/catalog"
import { whatsappWith, inquiryMessage } from "@/lib/site"

const PAGE = 30

type KindFilter = "todos" | CatalogKind

const kindFilters: { value: KindFilter; label: string }[] = [
  { value: "todos", label: "Todo" },
  { value: "repuesto", label: kindPlural.repuesto },
  { value: "producto", label: kindPlural.producto },
]

const index = catalog.map((item) => ({ item, text: searchText(item) }))

export default function Store() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [query, setQuery] = useState(params.get("q") ?? "")
  const kind = (params.get("tipo") as KindFilter | null) ?? "todos"
  const appliance = params.get("equipo") as Appliance | null
  const [limit, setLimit] = useState(PAGE)
  const deferredQuery = useDeferredValue(query)
  const searchId = useId()
  const resultsId = useId()

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      setLimit(PAGE)
    },
    [params, pathname, router],
  )

  // Sincroniza ?q= con un pequeño retraso para no reescribir la URL en cada tecla.
  useEffect(() => {
    const current = params.get("q") ?? ""
    if (deferredQuery === current) return
    const t = setTimeout(() => setParam("q", deferredQuery || null), 250)
    return () => clearTimeout(t)
  }, [deferredQuery, params, setParam])

  const results = useMemo(() => {
    const terms = normalize(deferredQuery).split(/\s+/).filter(Boolean)
    const matched = index
      .filter(({ item, text }) => {
        if (kind !== "todos" && item.kind !== kind) return false
        if (appliance && item.appliance !== appliance) return false
        return terms.every((t) => text.includes(t))
      })
      .map(({ item }) => item)
    // Agrupa por tipo de pieza: los tipos con más ítems primero, luego por nombre.
    const freq = new Map<string, number>()
    for (const item of matched) {
      const k = item.partType ?? "Otros"
      freq.set(k, (freq.get(k) ?? 0) + 1)
    }
    return matched.sort((a, b) => {
      const ka = a.partType ?? "Otros"
      const kb = b.partType ?? "Otros"
      return (freq.get(kb) ?? 0) - (freq.get(ka) ?? 0) || ka.localeCompare(kb, "es") || a.name.localeCompare(b.name, "es")
    })
  }, [deferredQuery, kind, appliance])

  const visible = results.slice(0, limit)
  const hasMore = results.length > limit
  const grouped = useMemo(() => groupByPartType(visible), [visible])

  function reset() {
    setQuery("")
    router.replace(pathname, { scroll: false })
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
              placeholder="Buscar pieza, marca o modelo"
              autoComplete="off"
              enterKeyHint="search"
              aria-controls={resultsId}
              className="h-12 w-full rounded-full border border-white/15 bg-white/5 pr-4 pl-11 text-base text-white placeholder:text-blue-100/50 transition-colors duration-200 hover:border-white/30 focus:border-white/60 focus:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:text-sm"
            />
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
                  onClick={() => setParam("tipo", f.value === "todos" ? null : f.value)}
                  className={`rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                    active ? "bg-white font-medium text-blue-700" : "font-light text-white hover:bg-white/10"
                  }`}
                >
                  {f.label} <span className={`tabular-nums ${active ? "text-blue-800" : "text-blue-100/75"}`}>{n}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="-mx-6 mt-2 overflow-x-auto px-6 md:mx-0 md:mt-4 md:px-0" style={{ scrollbarWidth: "none" }}>
        <div role="group" aria-label="Filtros" className="flex w-max gap-2 md:flex-wrap">
          {/* En móvil el tipo va como chips; en escritorio está en el segmentado de arriba */}
          {kindFilters
            .filter((f) => f.value !== "todos")
            .map((f) => (
              <Chip
                key={f.value}
                active={kind === f.value}
                onClick={() => setParam("tipo", kind === f.value ? null : f.value)}
                className="md:hidden"
              >
                {f.label}
              </Chip>
            ))}
          <span aria-hidden="true" className="mx-1 w-px self-stretch bg-white/15 md:hidden" />
          <Chip active={!appliance} onClick={() => setParam("equipo", null)}>
            Todos los equipos
          </Chip>
          {appliances.map((a) => (
            <Chip key={a.name} active={appliance === a.name} onClick={() => setParam("equipo", appliance === a.name ? null : a.name)}>
              {a.name} <span className="hidden tabular-nums opacity-70 md:inline">{a.count}</span>
            </Chip>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-blue-100/75 tabular-nums" aria-live="polite">
        {results.length === 0
          ? ""
          : `${results.length} ${results.length === 1 ? "ítem" : "ítems"}${
              results.length > visible.length ? `, mostrando ${visible.length}` : ""
            }${appliance ? ` · ${appliance}` : ""}`}
      </p>

      {results.length === 0 ? (
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
            Mostrar {Math.min(PAGE, results.length - visible.length)} más
          </button>
        </div>
      )}
    </div>
  )
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
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors duration-200 ${className} ${
        active
          ? "border-white bg-white font-medium text-blue-700"
          : "border-white/15 font-light text-white hover:border-white/40 hover:bg-white/10"
      }`}
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
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-2">
      <Link
        href={`/catalogo/${item.id}`}
        className="group grid grid-cols-[1fr_auto] items-center gap-x-3 py-3.5 transition-colors duration-200 hover:bg-white/[0.03] md:grid-cols-[3rem_1fr_10rem_5rem] md:gap-x-5"
      >
        <span className="hidden h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-blue-200/80 transition-colors duration-200 group-hover:border-blue-300/50 group-hover:text-white md:flex">
          <PartGlyph item={item} size={28} />
        </span>
        <span className="min-w-0">
          <span className="line-clamp-2 text-base leading-snug text-white md:truncate md:text-lg md:font-light">{item.name}</span>
          <span className="mt-0.5 block truncate text-xs text-blue-100/70">
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
          aria-label={`Pedir por WhatsApp: ${item.name}`}
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
    <div className="mt-2 border-t border-white/10 py-16 text-center">
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
