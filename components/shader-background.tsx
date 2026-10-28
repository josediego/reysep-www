"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

function useReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduce(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return reduce
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const reduce = useReducedMotion()

  return (
    <div id="inicio" className="relative flex min-h-svh flex-col overflow-hidden bg-black">
      {/* SVG filter used by the hero badge */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
        </defs>
      </svg>

      {/* Background shaders (decorative) */}
      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={["#1e3a8a", "#3b82f6", "#ffffff", "#1e40af", "#2563eb"]}
        speed={reduce ? 0 : 0.3}
        style={{ backgroundColor: "#000000" }}
        aria-hidden="true"
      />
      <MeshGradient
        className="absolute inset-0 hidden h-full w-full opacity-60 md:block"
        colors={["#1e3a8a", "#ffffff", "#3b82f6", "#000000"]}
        speed={reduce ? 0 : 0.2}
        style={{ backgroundColor: "transparent" }}
        aria-hidden="true"
      />
      {/* Scrim for text contrast over the light blobs */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {children}
    </div>
  )
}
