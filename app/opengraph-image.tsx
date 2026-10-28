import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const alt = "Reysep - Servicio Técnico Especializado"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  const svg = await readFile(join(process.cwd(), "public/reysep-logo-white.svg"))
  const logo = `data:image/svg+xml;base64,${svg.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logo} width={464} height={152} alt="" />
        <div style={{ fontSize: 56, fontWeight: 300, marginTop: 40 }}>Servicio Técnico Especializado</div>
      </div>
    ),
    size,
  )
}
