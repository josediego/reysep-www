# Reysep Web Roadmap

Living document. One item per line, ordered by impact on the business goal:
**more WhatsApp/phone inquiries for parts and repairs, from Lima mobile users.**

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[?]` needs decision

Last updated: 2026-10-28

## Now (cheap, moves sales)

- [ ] **Real product photos** for the top ~30 items (phone + white background is enough). Store under `public/catalog/<id>.jpg`; the item page and store rows already reserve the slot. *Done when:* at least 30 items show a photo, placeholder silhouette falls back for the rest.
- [ ] **Address and opening hours** in `lib/site.ts` (`address`, `hours`). *Done when:* Contact section shows them and `LocalBusiness` JSON-LD carries them.
- [~] **Conversion events** in Vercel Analytics: `inquiry_whatsapp`, `inquiry_call`, with `item_id` and `surface` (hero, store row, item page, empty state). *Done when:* a weekly count of inquiries per item is readable in the dashboard. Shipped: delegated listener (`components/analytics-listener.tsx`) plus `catalog_search` and `parts_request_submit`; `surface` is route-level (`home`/`catalogo`/`item`) except `contacto` and `parts_request`. Remaining: `data-surface` on hero, store row and empty state for finer splits; confirm events appear in the production dashboard (custom events need a Pro plan).
- [ ] **Google Business Profile** linked to the site, same phone, address and hours. *Done when:* the profile links to `https://www.reysep.com` and the site's JSON-LD matches it.

## Next (data quality and content)

- [ ] **Review enriched catalog data** in `data/catalog/enriched/`: 156 items with brand `Sin marca` whose name carries LG/Samsung/etc.; "Valvula 3bobinas LG" tagged Samsung; belt (#20–22) and shock absorber (#55–72) numbering is internal, needs a legend. *Done when:* a shop technician has signed off the `brand`, `fitsBrands` and `appliance` columns.
- [ ] **Editable item titles**: add an optional `title` field so store/SEO titles read like a buyer searches ("Faja lavadora LG 20,5") instead of raw inventory names. *Done when:* top 50 items have a human title and `generateMetadata` prefers it.
- [ ] **Own facts in copy** for Nosotros and Servicios: years in the trade, coverage area in Lima, real warranty in days. Today the copy is generic. *Done when:* each section states at least one verifiable fact supplied by the owner.
- [~] **"Can't find my part" form**: brand, model, part, photo (optional) → WhatsApp or `ventas@reysep.com`. Replaces the WhatsApp-only empty state. *Done when:* a submission reaches the shop with all fields. Shipped in Contact (`components/parts-request-form.tsx`; photo is attached in the WhatsApp chat). Remaining: link the store empty state to it and confirm a real submission reaches the shop.
- [~] **Inventory update flow**: shared sheet → `pnpm catalog:build` → PR. Document it in README and add a CI check that `lib/catalog-data.ts` matches `data/catalog/`. Schema contract (`catalog.schema.json`), `catalog:validate` and `catalog:check` are in CI; remaining: document the manual sheet path. *Done when:* someone other than the original author can update stock in under 15 minutes.
- [~] **CMS → site catalog sync**: `repository_dispatch` (`catalog-updated`) workflow downloads the snapshot from `cdn.reysep.com`, verifies SHA-256, validates it against the schema, commits `items.json` + snapshot to `main`. *Done when:* a publish in `josediego/reysep-cms` updates the live catalog with no manual step (needs the CMS dispatch token and the CDN upload).

## Later (discovery and structure)

- [~] **Per-appliance routes**: `/catalogo/equipo/<slug>` (12 static pages, e.g. `/catalogo/equipo/lavadora`) with their own title/description, intro, canonical and breadcrumb JSON-LD; in the sitemap; home tiles link to them. Remaining: confirm indexing in Search Console. *Done when:* each appliance page is in the sitemap and indexed.
- [~] **`LocalBusiness` JSON-LD**: `["LocalBusiness","Organization"]` with telephone, email, `areaServed` Lima, `priceRange`; `address`, `geo` and `openingHoursSpecification` are emitted automatically once `site.address`, `site.geo` and `site.hours` are filled in. Remaining: the owner's data (see "Address and opening hours").
- [x] **Server-rendered store list**: `/catalogo` reads search params on the server and the first 30 rows paint with the HTML (no Suspense fallback); verified on `/catalogo?equipo=Lavadora`.
- [ ] **Accessibility check in CI** (axe on `/`, `/catalogo`, one item page) so fixed issues don't regress.
- [ ] **Product photos pipeline**: naming convention, max size, WebP conversion in `scripts/`.

## Decisions pending

- [?] **Italic serif accent** repeated in six headings and the "Reysep Homecenter" hero chip. Impeccable's guide flags both as AI tells; the brand's existing hero uses them. Owner's call.
- [?] **Ambient gradient on store pages**: keep (current) or hero only.
- [?] **Catalog API**: `data/catalog/items.json` is already the source of truth; decide if/when it moves behind an endpoint (for a POS, WhatsApp bot, or inventory sync).

## Done

- [x] 2026-10-28 — Landing with services, catalog teaser, about, contact; `/catalogo` store with search, filters in URL, grouping by part type; 339 static item pages with `Product` JSON-LD; WhatsApp/phone CTAs with prefilled message; structured catalog data with web-validated enrichment; mobile filter cleanup; direct CTAs; landing motion (hero entrance, compact header, list reveals); Impeccable detector clean on all routes; single Vercel project.
