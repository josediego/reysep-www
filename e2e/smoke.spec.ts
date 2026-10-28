import { expect, test } from "@playwright/test"
import { PHONE, WHATSAPP, itemLinks, resultCount, sampleItem } from "./helpers"

test.describe("home", () => {
  test("hero, navegación y accesos al catálogo", async ({ page }, testInfo) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Servicio\s+Técnico/)

    if (testInfo.project.name === "mobile") {
      await page.getByRole("button", { name: /abrir menú/i }).click()
    }
    const nav = page.getByRole("navigation", { name: /principal/i }).filter({ visible: true }).first()
    await expect(nav).toBeVisible()
    await expect(nav.getByRole("link", { name: "Catálogo" })).toHaveAttribute("href", "/catalogo")

    // Mosaicos por equipo: enlazan a /catalogo?equipo=... o /catalogo/equipo/<slug>.
    const tiles = page.locator('a[href*="/catalogo?equipo="], a[href*="/catalogo/equipo/"]')
    expect(await tiles.count()).toBeGreaterThan(0)
    // click() ya desplaza el mosaico al viewport; con movimiento reducido el reveal es solo opacidad.
    const first = tiles.first()
    await expect(first).toBeVisible()
    await first.click()
    await expect(page).toHaveURL(/\/catalogo(\?.*equipo=|\/equipo\/)/)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })
})

test.describe("catálogo", () => {
  test("buscar, filtrar por equipo y abrir una ficha", async ({ page }) => {
    await page.goto("/catalogo")
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Catálogo/)
    const search = page.getByRole("searchbox", { name: /buscar/i })
    await expect(search).toBeVisible()
    await expect(itemLinks(page).first()).toBeVisible()
    const total = await resultCount(page)

    // Reintenta por si el input se llena antes de hidratar.
    await expect(async () => {
      await search.fill("faja")
      expect(await resultCount(page)).toBeLessThan(total)
    }).toPass({ timeout: 15_000 })
    const fajas = await resultCount(page)
    expect(fajas).toBeGreaterThan(0)
    await expect(page).toHaveURL(/[?&]q=faja/)

    await search.fill("")
    await expect.poll(() => resultCount(page)).toBe(total)
    // La URL se sincroniza con retraso: esperar a que ?q= desaparezca antes del siguiente filtro.
    await expect(page).not.toHaveURL(/[?&]q=/)

    // Chip de equipo: botón (filtro en la URL) o enlace (página por equipo).
    const lavadora = page
      .getByRole("button", { name: /^Lavadora(\s+\d+)?$/ })
      .or(page.getByRole("link", { name: /^Lavadora(\s+\d+)?$/ }))
      .first()
    await lavadora.click()
    await expect(page).toHaveURL(/equipo=|\/equipo\//)
    await expect.poll(() => resultCount(page)).toBeLessThan(total)

    const row = itemLinks(page).first()
    const href = await row.getAttribute("href")
    expect(href).toMatch(/^\/catalogo\/[^/?#]+$/)
    await row.click()
    await expect(page).toHaveURL(new RegExp(`${href}$`))
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })
})

test.describe("ficha de ítem", () => {
  test(`h1, precio, CTAs y JSON-LD (${sampleItem.id})`, async ({ page }) => {
    const res = await page.goto(`/catalogo/${sampleItem.id}`)
    expect(res?.status()).toBe(200)

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(sampleItem.title?.trim() || sampleItem.name)
    // Precio en soles, ej. "S/ 64.90".
    await expect(page.getByText(/S\/\s?\d/).first()).toBeVisible()

    // CTA principal con mensaje prellenado (el ícono del header lleva wa.me sin texto).
    const wa = page.getByRole("link", { name: /pedir por whatsapp/i }).first()
    const waHref = (await wa.getAttribute("href")) ?? ""
    expect(waHref).toContain(`wa.me/${WHATSAPP}`)
    const text = new URL(waHref).searchParams.get("text") ?? ""
    expect(text).toContain(`Ref. ${sampleItem.id}`)

    const tel = page.locator('a[href^="tel:"]')
    expect(await tel.count()).toBeGreaterThan(0)
    await expect(tel.first()).toHaveAttribute("href", `tel:${PHONE}`)

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const parsed = blocks.map((b) => JSON.parse(b) as Record<string, unknown>)
    const product = parsed.find((d) => d["@type"] === "Product")
    expect(product, "JSON-LD Product").toBeTruthy()
    expect(product?.sku).toBe(sampleItem.id)
  })

  test("id desconocido responde 404", async ({ page }) => {
    const res = await page.goto("/catalogo/no-existe-e2e-0000")
    expect(res?.status()).toBe(404)
  })
})
