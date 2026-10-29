"use client"

import { MeshGradient } from "@paper-design/shaders-react"
import { useShaderBudget } from "@/lib/use-shader-budget"

/**
 * Luz ambiental con el mismo shader del hero: es el motivo de la marca, no un
 * resplandor radial genérico. Se usa como banda detrás de una cabecera
 * (`edge="top"`) o como pico en medio del scroll (`edge="both"`), siempre
 * fundida a negro por máscara. Respeta prefers-reduced-motion y el presupuesto
 * de GPU de equipos modestos (ver lib/use-shader-budget).
 */
type Props = {
  edge?: "top" | "both"
  /** Altura de la banda; con `edge="both"` ocupa todo el contenedor. */
  className?: string
  /** 0–1: cuánta luz deja pasar. */
  intensity?: number
}

const palette = ["#0b1a4a", "#1e3a8a", "#2563eb", "#60a5fa", "#dbeafe", "#000000"]

export default function AmbientGradient({ edge = "top", className = "", intensity = 0.7 }: Props) {
  const { still, maxPixelCount } = useShaderBudget()
  const mask =
    edge === "top"
      ? "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0) 100%)"
      : "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)"

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 -z-10 overflow-hidden ${edge === "top" ? "top-0" : "inset-y-0"} ${className}`}
      style={{ maskImage: mask, WebkitMaskImage: mask, opacity: intensity }}
    >
      <MeshGradient
        className="h-full w-full"
        colors={palette}
        distortion={0.85}
        swirl={0.35}
        grainMixer={0.12}
        speed={still ? 0 : 0.22}
        maxPixelCount={maxPixelCount}
        style={{ backgroundColor: "#000000" }}
      />
      {/* Velo para mantener el contraste del texto sobre las zonas claras */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/35 to-black/60" />
    </div>
  )
}
