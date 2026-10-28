import { describe, expect, it, vi } from "vitest"

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }))

import { PART_MAX, partsRequestMailto, partsRequestMessage, validatePartsRequest } from "@/components/parts-request-form"

const ok = { marca: "LG", modelo: "", pieza: "Faja de lavadora", nombre: "" }

describe("validatePartsRequest", () => {
  it("accepts brand + part", () => {
    expect(validatePartsRequest(ok)).toEqual({})
  })

  it("requires brand and part, in Spanish", () => {
    const e = validatePartsRequest({ marca: " ", modelo: "", pieza: "", nombre: "" })
    expect(e.marca).toMatch(/marca/)
    expect(e.pieza).toMatch(/pieza/)
  })

  it("caps the part description", () => {
    expect(validatePartsRequest({ ...ok, pieza: "x".repeat(PART_MAX + 1) }).pieza).toMatch(String(PART_MAX))
  })
})

describe("partsRequestMessage", () => {
  it("starts with the fixed greeting and skips empty optional fields", () => {
    const m = partsRequestMessage(ok)
    expect(m.startsWith("Hola Reysep, no encuentro este repuesto:")).toBe(true)
    expect(m).toContain("Marca: LG")
    expect(m).not.toContain("Modelo")
    expect(m).not.toContain("nombre")
  })

  it("includes optional fields when present", () => {
    const m = partsRequestMessage({ ...ok, modelo: "WD-1", nombre: "Ana" })
    expect(m).toContain("Modelo: WD-1")
    expect(m).toContain("Mi nombre: Ana")
  })
})

describe("partsRequestMailto", () => {
  it("targets ventas@reysep.com", () => {
    expect(partsRequestMailto(null)).toMatch(/^mailto:ventas@reysep\.com\?subject=/)
    expect(decodeURIComponent(partsRequestMailto(ok)!)).toContain("Pieza: Faja de lavadora")
  })
})
