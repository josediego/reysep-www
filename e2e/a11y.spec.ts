import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { sampleItem, settle } from "./helpers"

// Movimiento reducido: el contenido queda en su estado final y axe mide los colores reales.
test.use({ reducedMotion: "reduce" })

const pages = [
  { name: "home", path: "/" },
  { name: "catálogo", path: "/catalogo" },
  { name: "ficha", path: `/catalogo/${sampleItem.id}` },
]

for (const { name, path } of pages) {
  test(`axe: ${name} sin violaciones serias o críticas`, async ({ page }, testInfo) => {
    await page.goto(path)
    await settle(page)

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze()

    await testInfo.attach("axe-results.json", { body: JSON.stringify(results.violations, null, 2), contentType: "application/json" })

    // AXE_VERBOSE=1 lista también las violaciones moderadas/menores (no bloquean).
    if (process.env.AXE_VERBOSE) {
      for (const v of results.violations)
        console.log(`[${testInfo.project.name}] ${name} [${v.impact}] ${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)
    }

    const blocking =results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")
    const summary = blocking.map(
      (v) => `[${v.impact}] ${v.id}: ${v.help}\n${v.nodes.map((n) => `    ${n.target.join(" ")}  ${n.failureSummary?.split("\n")[1]?.trim() ?? ""}`).join("\n")}`,
    )
    expect(blocking, summary.join("\n")).toEqual([])
  })
}

test.describe("teclado", () => {
  test("Tab llega al buscador y a los chips, con foco visible", async ({ page }) => {
    await page.goto("/catalogo")
    const search = page.getByRole("searchbox", { name: /buscar/i })
    await expect(search).toBeVisible()

    const focused = () =>
      page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el) return null
        const s = getComputedStyle(el)
        return {
          tag: el.tagName,
          type: el.getAttribute("type"),
          pressed: el.getAttribute("aria-pressed"),
          outlineStyle: s.outlineStyle,
          outlineWidth: s.outlineWidth,
        }
      })

    let reachedSearch = false
    let chip: Awaited<ReturnType<typeof focused>> = null
    for (let i = 0; i < 60 && !chip; i++) {
      await page.keyboard.press("Tab")
      const f = await focused()
      if (!f) continue
      if (f.tag === "INPUT" && f.type === "search") {
        reachedSearch = true
        expect(f.outlineStyle, "foco visible en el buscador").not.toBe("none")
      } else if (reachedSearch && f.pressed !== null) {
        chip = f
      }
    }
    expect(reachedSearch, "Tab alcanza el buscador").toBe(true)
    expect(chip, "Tab alcanza un chip con aria-pressed").not.toBeNull()
    expect(chip?.outlineStyle, "foco visible en el chip").not.toBe("none")
    expect(chip?.outlineWidth).not.toBe("0px")
  })
})
