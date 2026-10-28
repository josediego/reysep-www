import type { MetadataRoute } from "next"
import { site } from "@/lib/site"
import { catalog } from "@/lib/catalog"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/catalogo`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...catalog.map((item) => ({
      url: `${site.url}/catalogo/${item.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]
}
