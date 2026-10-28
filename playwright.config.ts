import { defineConfig, devices } from "@playwright/test"

/**
 * E2E + accesibilidad (ver e2e/).
 * - Por defecto prueba el build de producción: `pnpm build && pnpm e2e` (levanta `pnpm start`).
 * - PW_DEV=1: levanta `pnpm dev -p 3011` en su lugar (no requiere build).
 * - PORT=4000: cambia el puerto del servidor local (por defecto 3000, o 3011 con PW_DEV=1).
 * - BASE_URL=https://...: prueba un servidor ya levantado (o un preview) y no inicia ninguno.
 * - PLAYWRIGHT_WORKERS=n: fija los workers (en CI, 1 por defecto).
 *
 * Movimiento reducido en todos los proyectos: los shaders WebGL del hero y de las bandas
 * ambientales (MeshGradient) dejan de animarse y paran su requestAnimationFrame. Sin GPU
 * (runners de CI, Chromium headless) se renderizan con SwiftShader en CPU: animados a 2x
 * de densidad bajan la página a ~10 fps y cada acción de Playwright (espera de
 * estabilidad por rAF) tarda segundos hasta agotar el timeout.
 */
const ci = !!process.env.CI
const dev = process.env.PW_DEV === "1"
const port = Number(process.env.PORT ?? (dev ? 3011 : 3000))
const external = process.env.BASE_URL
const baseURL = external ?? `http://localhost:${port}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  workers: Number(process.env.PLAYWRIGHT_WORKERS) || (ci ? 1 : undefined),
  reporter: ci ? [["github"], ["html", { open: "never" }]] : [["list"]],
  // Margen para runners lentos sin GPU; las acciones fallan antes que el test para dar un error claro.
  timeout: ci ? 60_000 : 30_000,
  expect: { timeout: ci ? 10_000 : 5_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    locale: "es-PE",
    reducedMotion: "reduce",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
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
        timeout: 180_000,
        stdout: "ignore",
        stderr: "pipe",
      },
})
