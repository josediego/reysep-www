import { expect, type Page } from "@playwright/test"
import { catalogItems } from "../lib/catalog-data"

/** Datos estáticos del catálogo (los mismos que usa el build): sin red. */
export const items = catalogItems

/** Ítem estable para la ficha: con precio, equipo y título. */
export const sampleItem =
  items.find((i) => i.price !== null && i.appliance && i.title) ?? items.find((i) => i.price !== null) ?? items[0]

export const WHATSAPP = "51990959102"
export const PHONE = "+51990959102"

/** Enlaces a fichas de ítem (`/catalogo/<id>`), excluye páginas de equipo y filtros. */
export function itemLinks(page: Page) {
  return page.getByRole("main").locator('a[href^="/catalogo/"]:not([href^="/catalogo/equipo"])')
}

/** Total de resultados según el contador ("339 ítems, mostrando 30"). */
export async function resultCount(page: Page): Promise<number> {
  const status = page.getByText(/\d+\s+ítems?\b/).first()
  await expect(status).toBeVisible()
  const text = (await status.textContent()) ?? ""
  return Number(text.match(/(\d+)\s+ítems?/)?.[1] ?? NaN)
}

/** Espera a que terminen las animaciones de entrada (hero, reveals) antes de medir contraste. */
export async function settle(page: Page) {
  await page.evaluate(async () => {
    // Recorre la página para disparar los reveals por IntersectionObserver.
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 30))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getComputedTiming().iterations === Infinity),
  )
}
