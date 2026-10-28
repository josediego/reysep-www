import { defineConfig, devices } from "@playwright/test"

/**
 * E2E + accesibilidad (ver e2e/).
 * - Por defecto prueba el build de producción: `pnpm build && pnpm e2e` (levanta `pnpm start`).
 * - PW_DEV=1: levanta `pnpm dev -p 3011` en su lugar (no requiere build).
 * - PORT=4000: cambia el puerto del servidor local (por defecto 3000, o 3011 con PW_DEV=1).
 * - BASE_URL=https://...: prueba un servidor ya levantado (o un preview) y no inicia ninguno.
 */
const dev = process.env.PW_DEV === "1"
const port = Number(process.env.PORT ?? (dev ? 3011 : 3000))
const external = process.env.BASE_URL
const baseURL = external ?? `http://localhost:${port}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    locale: "es-PE",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      // Chromium con viewport, toque y UA móviles (un solo navegador en CI).
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: external
    ? undefined
    : {
        command: dev ? `pnpm dev -p ${port}` : `pnpm start -p ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "ignore",
        stderr: "pipe",
      },
})
