import { describe, expect, it, vi } from "vitest"

vi.mock("@vercel/analytics", () => ({
  track: vi.fn(() => {
    throw new Error("blocked")
  }),
}))

import { inquiryEvent, itemIdFrom, surfaceFromPath, track } from "@/lib/analytics"
import { inquiryMessage, whatsappWith } from "@/lib/site"

describe("surfaceFromPath", () => {
  it("maps routes", () => {
    expect(surfaceFromPath("/")).toBe("home")
    expect(surfaceFromPath("/catalogo")).toBe("catalogo")
    expect(surfaceFromPath("/catalogo/r-faja-lg")).toBe("item")
    expect(surfaceFromPath("/otra")).toBe("other")
  })
})

describe("itemIdFrom", () => {
  it("reads the item path first", () => {
    expect(itemIdFrom("/catalogo/r-faja-lg", "tel:+51990959102")).toBe("r-faja-lg")
  })

  it("reads Ref. from the decoded wa.me text", () => {
    const href = whatsappWith(inquiryMessage({ id: "r-filtro-carbon-c-helena", name: "Filtro", kind: "repuesto" }))!
    expect(itemIdFrom("/catalogo", href)).toBe("r-filtro-carbon-c-helena")
  })

  it("returns null without an id", () => {
    expect(itemIdFrom("/", whatsappWith("Hola Reysep")!)).toBeNull()
    expect(itemIdFrom("/", "tel:+51990959102")).toBeNull()
  })
})

describe("inquiryEvent", () => {
  it("classifies links", () => {
    expect(inquiryEvent("https://wa.me/51990959102")).toBe("inquiry_whatsapp")
    expect(inquiryEvent("tel:+51990959102")).toBe("inquiry_call")
    expect(inquiryEvent("mailto:ventas@reysep.com")).toBeNull()
  })
})

describe("track", () => {
  it("never throws when analytics fails", () => {
    expect(() => track("inquiry_call", { surface: "home" })).not.toThrow()
  })
})
