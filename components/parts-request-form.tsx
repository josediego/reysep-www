"use client"

import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { WhatsAppIcon, MailIcon } from "@/components/icons"
import { site, whatsappWith } from "@/lib/site"
import { track } from "@/lib/analytics"

export const PART_MAX = 300

export type PartsRequest = { marca: string; modelo: string; pieza: string; nombre: string }
export type PartsRequestErrors = Partial<Record<keyof PartsRequest, string>>

const EMPTY: PartsRequest = { marca: "", modelo: "", pieza: "", nombre: "" }

/** Validación con mensajes en español. Devuelve solo los campos con error. */
export function validatePartsRequest(v: PartsRequest): PartsRequestErrors {
  const errors: PartsRequestErrors = {}
  if (!v.marca.trim()) errors.marca = "Indique la marca del equipo."
  const pieza = v.pieza.trim()
  if (!pieza) errors.pieza = "Describa la pieza que necesita."
  else if (pieza.length < 3) errors.pieza = "Añada un poco más de detalle sobre la pieza."
  else if (pieza.length > PART_MAX) errors.pieza = `Use como máximo ${PART_MAX} caracteres.`
  if (v.modelo.trim().length > 80) errors.modelo = "El modelo es demasiado largo."
  if (v.nombre.trim().length > 80) errors.nombre = "El nombre es demasiado largo."
  return errors
}

/** Mensaje que recibe la tienda (WhatsApp o correo). */
export function partsRequestMessage(v: PartsRequest): string {
  const lines = [
    "Hola Reysep, no encuentro este repuesto:",
    `Marca: ${v.marca.trim()}`,
    v.modelo.trim() && `Modelo: ${v.modelo.trim()}`,
    `Pieza: ${v.pieza.trim()}`,
    v.nombre.trim() && `Mi nombre: ${v.nombre.trim()}`,
  ]
  return lines.filter(Boolean).join("\n")
}

/** Enlace mailto con el pedido; sin datos, una plantilla para completar. */
export function partsRequestMailto(v: PartsRequest | null): string | null {
  if (!site.email) return null
  const body = v
    ? partsRequestMessage(v)
    : "Hola Reysep, no encuentro este repuesto:\nMarca:\nModelo:\nPieza:\nMi nombre:"
  return `mailto:${site.email}?subject=${encodeURIComponent("Pedido de repuesto")}&body=${encodeURIComponent(body)}`
}

const FIELDS: (keyof PartsRequest)[] = ["marca", "modelo", "pieza", "nombre"]

const control =
  "w-full border bg-white/5 px-4 text-base text-white placeholder:text-blue-100/65 transition-colors duration-200 hover:border-white/30 focus:border-white/60 focus:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:text-sm"

export default function PartsRequestForm() {
  const uid = useId()
  const id = (f: string) => `${uid}-${f}`
  const [values, setValues] = useState<PartsRequest>(EMPTY)
  const [errors, setErrors] = useState<PartsRequestErrors>({})
  const [sent, setSent] = useState<{ wa: string | null } | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const doneRef = useRef<HTMLDivElement>(null)

  // El botón de envío solo funciona con JS; sin JS queda oculto y deshabilitado
  // (sin envío implícito con Enter) y se muestra el enlace de correo.
  useEffect(() => setHydrated(true), [])
  useEffect(() => {
    if (sent) doneRef.current?.focus()
  }, [sent])

  function set(field: keyof PartsRequest, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const found = validatePartsRequest(values)
    setErrors(found)
    const first = FIELDS.find((f) => found[f])
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(first))}`)?.focus()
      return
    }
    const wa = whatsappWith(partsRequestMessage(values))
    const props = {
      has_model: Boolean(values.modelo.trim()),
      has_name: Boolean(values.nombre.trim()),
      length: values.pieza.trim().length,
    }
    if (wa) {
      track("parts_request_submit", { channel: "whatsapp", ...props })
      window.open(wa, "_blank", "noopener,noreferrer")
    } else {
      const mail = partsRequestMailto(values)
      if (!mail) return
      track("parts_request_submit", { channel: "email", ...props })
      window.location.href = mail
    }
    setSent({ wa })
  }

  function onMailClick() {
    track("parts_request_submit", {
      channel: "email",
      has_model: Boolean(values.modelo.trim()),
      has_name: Boolean(values.nombre.trim()),
      length: values.pieza.trim().length,
    })
  }

  const filledMail = partsRequestMailto(values.pieza.trim() ? values : null)
  const templateMail = partsRequestMailto(null)

  if (sent) {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        data-surface="parts_request"
        className="rounded-2xl border border-white/10 p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:p-8"
      >
        <p className="text-lg font-light text-white">
          {sent.wa ? "Listo, abrimos WhatsApp con su pedido." : "Listo, abrimos su correo con el pedido."}
        </p>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-blue-100/75">
          {sent.wa
            ? "Solo pulse Enviar en el chat. Si tiene una foto de la pieza o de la placa del equipo, adjúntela ahí mismo."
            : "Solo pulse Enviar. Si tiene una foto de la pieza o de la placa del equipo, adjúntela al correo."}{" "}
          Le respondemos con disponibilidad y precio.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {sent.wa && (
            <a
              href={sent.wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-blue-700 transition-colors duration-200 hover:bg-white/90"
            >
              <WhatsAppIcon size={16} />
              Abrir WhatsApp otra vez
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              setSent(null)
              setValues(EMPTY)
            }}
            className="min-h-11 rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10"
          >
            Pedir otro repuesto
          </button>
        </div>
      </div>
    )
  }

  const describedBy = (f: keyof PartsRequest, ...extra: string[]) =>
    [errors[f] ? id(`${f}-error`) : null, ...extra].filter(Boolean).join(" ") || undefined

  const fieldError = (f: keyof PartsRequest) =>
    errors[f] ? (
      <p id={id(`${f}-error`)} className="mt-2 text-sm text-red-300">
        {errors[f]}
      </p>
    ) : null

  const label = "mb-2 block text-xs font-medium tracking-wide text-blue-200/80 uppercase"
  const optional = <span className="font-normal tracking-normal normal-case text-blue-100/55">(opcional)</span>
  const border = (f: keyof PartsRequest) => (errors[f] ? "border-red-300/80" : "border-white/15")
  const piezaLength = values.pieza.trim().length

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-labelledby={id("title")} className="grid gap-5">
      <div>
        <h3 id={id("title")} className="text-2xl font-light tracking-tight text-white">
          ¿No encuentra su repuesto?
        </h3>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-blue-100/75">
          Díganos qué necesita y lo buscamos: muchas piezas son compatibles entre marcas.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id("marca")} className={label}>
            Marca
          </label>
          <input
            id={id("marca")}
            name="marca"
            type="text"
            autoComplete="off"
            placeholder="LG, Samsung, Mabe…"
            value={values.marca}
            onChange={(e) => set("marca", e.target.value)}
            aria-invalid={errors.marca ? true : undefined}
            aria-describedby={describedBy("marca")}
            aria-required="true"
            maxLength={60}
            className={`${control} ${border("marca")} h-11 rounded-full`}
          />
          {fieldError("marca")}
        </div>
        <div>
          <label htmlFor={id("modelo")} className={label}>
            Modelo {optional}
          </label>
          <input
            id={id("modelo")}
            name="modelo"
            type="text"
            autoComplete="off"
            placeholder="Figura en la placa del equipo"
            value={values.modelo}
            onChange={(e) => set("modelo", e.target.value)}
            aria-invalid={errors.modelo ? true : undefined}
            aria-describedby={describedBy("modelo")}
            maxLength={80}
            className={`${control} ${border("modelo")} h-11 rounded-full`}
          />
          {fieldError("modelo")}
        </div>
      </div>

      <div>
        <label htmlFor={id("pieza")} className={label}>
          Pieza o descripción
        </label>
        <textarea
          id={id("pieza")}
          name="pieza"
          rows={3}
          placeholder="Ej. faja de lavadora, tapa del dispensador, placa que no enciende"
          value={values.pieza}
          onChange={(e) => set("pieza", e.target.value)}
          aria-invalid={errors.pieza ? true : undefined}
          aria-describedby={describedBy("pieza", id("pieza-count"))}
          aria-required="true"
          maxLength={PART_MAX}
          className={`${control} ${border("pieza")} block min-h-24 resize-y rounded-2xl py-3 leading-relaxed`}
        />
        <div className="flex items-start justify-between gap-4">
          {fieldError("pieza") ?? <span />}
          <p id={id("pieza-count")} className="mt-2 shrink-0 text-xs text-blue-100/55 tabular-nums">
            {piezaLength}/{PART_MAX}
            <span className="sr-only"> caracteres</span>
          </p>
        </div>
      </div>

      <div className="sm:max-w-[calc(50%-0.625rem)]">
        <label htmlFor={id("nombre")} className={label}>
          Su nombre {optional}
        </label>
        <input
          id={id("nombre")}
          name="nombre"
          type="text"
          autoComplete="given-name"
          value={values.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          aria-invalid={errors.nombre ? true : undefined}
          aria-describedby={describedBy("nombre")}
          maxLength={80}
          className={`${control} ${border("nombre")} h-11 rounded-full`}
        />
        {fieldError("nombre")}
      </div>

      <p className="text-sm leading-relaxed text-blue-100/75">
        ¿Tiene una foto de la pieza o de la placa del equipo? Adjúntela en el chat de WhatsApp: nos ayuda a ubicarla más
        rápido.
      </p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Con JS: botón que abre WhatsApp. Sin JS: oculto; queda el enlace de correo. */}
        <button
          type="submit"
          disabled={!hydrated}
          className="hidden min-h-11 items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-medium text-blue-700 transition-colors duration-200 hover:bg-white/90 disabled:opacity-60 [.js_&]:inline-flex"
        >
          <WhatsAppIcon size={16} />
          Enviar pedido por WhatsApp
        </button>
        {templateMail && (
          <a
            href={templateMail}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-medium text-blue-700 transition-colors duration-200 hover:bg-white/90 [.js_&]:hidden"
          >
            <MailIcon size={16} />
            Enviar pedido por correo
          </a>
        )}
        {filledMail && (
          <a
            href={filledMail}
            onClick={onMailClick}
            className="hidden min-h-11 items-center text-sm text-blue-100/80 underline decoration-white/30 underline-offset-4 transition-colors duration-200 hover:decoration-white [.js_&]:inline-flex"
          >
            Prefiero enviarlo a {site.email}
          </a>
        )}
      </div>
    </form>
  )
}
