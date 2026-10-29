"use client"

import { useEffect, useState } from "react"

/**
 * Presupuesto de los shaders decorativos (MeshGradient).
 *
 * - `still`: sin animación. Con prefers-reduced-motion, o en equipos modestos
 *   (≤ 4 núcleos, ≤ 4 GB de memoria declarada o Ahorro de datos): se pinta un
 *   solo fotograma y el rAF se detiene, el degradado queda como imagen fija.
 * - `maxPixelCount`: el degradado es difuso, así que en pantallas pequeñas no
 *   necesita la densidad nativa (3x en muchos móviles). Se limita a ~2x de la
 *   pantalla de un móvil, lo que reduce a la mitad o menos el trabajo de GPU
 *   por fotograma sin diferencia visible.
 */
const MOBILE_MAX_PIXELS = 900_000

type Budget = { still: boolean; maxPixelCount: number | undefined }

function lowEndDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const cores = nav.hardwareConcurrency ?? 8
  return cores <= 4 || (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) || nav.connection?.saveData === true
}

export function useShaderBudget(): Budget {
  const [budget, setBudget] = useState<Budget>({ still: false, maxPixelCount: undefined })

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const small = window.matchMedia("(max-width: 767px)")
    const lowEnd = lowEndDevice()
    const update = () =>
      setBudget({
        still: reduce.matches || lowEnd,
        maxPixelCount: small.matches ? MOBILE_MAX_PIXELS : undefined,
      })
    update()
    reduce.addEventListener("change", update)
    small.addEventListener("change", update)
    return () => {
      reduce.removeEventListener("change", update)
      small.removeEventListener("change", update)
    }
  }, [])

  return budget
}
