import type React from "react"
import type { Metadata, Viewport } from "next"
import { Figtree, Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { site } from "@/lib/site"
import AnalyticsListener from "@/components/analytics-listener"
import "./globals.css"

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    locale: site.locale,
    title: site.title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  icons: { icon: "/favicon.ico" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // cover: habilita env(safe-area-inset-*) (barra fija de la ficha). Los márgenes
  // laterales del notch en horizontal se reponen en body (globals.css).
  viewportFit: "cover",
  themeColor: site.themeColor,
}

const dayCodes: Record<string, string> = {
  lun: "Monday",
  mar: "Tuesday",
  mie: "Wednesday",
  jue: "Thursday",
  vie: "Friday",
  sab: "Saturday",
  dom: "Sunday",
}
const week = Object.keys(dayCodes)

/**
 * "Lun–Sáb 9:00–18:00" o "Lun–Vie 9:00–18:00, Sáb 9:00–13:00" → openingHoursSpecification.
 * Devuelve `null` si algún tramo no se entiende (mejor omitirlo que publicar un horario falso).
 */
function openingHours(text: string | null) {
  if (!text) return null
  const specs = []
  for (const part of text.split(/[,;]/)) {
    const m = part
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .match(/^([a-z]{3})\w*(?:\s*[-–a]\s*([a-z]{3})\w*)?\s+(\d{1,2}):(\d{2})\s*[-–a]\s*(\d{1,2}):(\d{2})$/)
    if (!m) return null
    const [, from, to = from, h1, m1, h2, m2] = m
    const i = week.indexOf(from)
    const j = week.indexOf(to)
    if (i < 0 || j < i) return null
    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: week.slice(i, j + 1).map((d) => dayCodes[d]),
      opens: `${h1.padStart(2, "0")}:${m1}`,
      closes: `${h2.padStart(2, "0")}:${m2}`,
    })
  }
  return specs.length ? specs : null
}

const hoursSpec = openingHours(site.hours)

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Organization"],
  // Referenciado por las ofertas `Product` de cada ficha (seller).
  "@id": `${site.url}/#organization`,
  name: site.name,
  url: site.url,
  logo: `${site.url}/images/reysep-logo.png`,
  image: `${site.url}/images/reysep-logo.png`,
  description: site.description,
  priceRange: "S/",
  areaServed: { "@type": "City", name: "Lima", containedInPlace: { "@type": "Country", name: "Perú" } },
  ...(site.phone ? { telephone: site.phone } : {}),
  ...(site.email ? { email: site.email } : {}),
  ...(site.address
    ? {
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address,
          addressLocality: "Lima",
          addressCountry: "PE",
        },
      }
    : {}),
  ...(site.geo ? { geo: { "@type": "GeoCoordinates", latitude: site.geo.latitude, longitude: site.geo.longitude } } : {}),
  ...(hoursSpec ? { openingHoursSpecification: hoursSpec } : {}),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${figtree.variable} ${instrumentSerif.variable} font-sans antialiased`}>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-blue-700"
        >
          Saltar al contenido
        </a>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
        <Analytics />
        <AnalyticsListener />
      </body>
    </html>
  )
}
