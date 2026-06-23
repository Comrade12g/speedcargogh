## SEO Foundation & Cleanup for speedcargogh.com

Tackle the four highest-impact items from the analysis so the site can start ranking.

### 1. Run a full SEO audit
- Trigger the built-in SEO scan to surface every on-page issue (titles, meta descriptions, H1s, canonicals, OG tags, schema, alt text, sitemap, robots).
- Auto-fix every flagged item that can be fixed in code (per-route titles/descriptions, canonical URLs, OG/Twitter cards, JSON-LD LocalBusiness + Organization schema for a Ghana freight forwarder).

### 2. Sitemap + robots.txt
- Replace the static `public/sitemap.xml` with a dynamic server route at `src/routes/sitemap[.]xml.ts` listing every real route (home, about, services/*, lanes/*, rates, schedule, tracking, partners, careers, blog, faq).
- Use `https://speedcargogh.com` as the base URL.
- Update `public/robots.txt` to allow all crawlers and reference the new sitemap.

### 3. Local SEO schema (biggest near-term win)
Add JSON-LD on the homepage and key pages for:
- **LocalBusiness / MovingCompany** — name "Speed Cargo GH", address "Ferro Bel Plaza, Derby Avenue, Accra", phone, email speedcargo@sincereok.com, geo, opening hours, service area = Ghana, areaServed = China→Ghana lanes.
- **Organization** — logo, sameAs (socials when available).
- **Service** schema per service page (Sea Freight, Groupage, Customs Clearing, Warehousing).
- **BreadcrumbList** on inner pages.

### 4. Per-route metadata pass
For each route under `src/routes/`, write unique, keyword-targeted:
- `<title>` (≤60 chars, includes "Ghana" + service/lane)
- meta description (≤160 chars, includes a clear value prop)
- canonical
- og:title / og:description / og:image (use existing hero/asset per page)
- twitter:card

Targeting long-tail terms we can actually win: *sea freight Ghana, Guangzhou to Accra shipping, Yiwu cargo consolidation Ghana, customs clearing Tema, warehousing Accra*.

### 5. Disavow guidance (no code)
Provide the user a ready-to-upload Google disavow file listing the spam .shop / fiverr-seo backlink domains, plus a 3-step instruction on submitting it in Google Search Console. (We can't submit it for you — Google requires the domain owner to upload via GSC.)

### 6. Google Search Console setup
- Add a meta verification tag to the root route head so the user can verify ownership in GSC.
- After verification, submit the new sitemap URL.

### Out of scope (flag for later)
- Building real backlinks (PR, directory submissions, partner links) — this is ongoing marketing work, not a code change.
- Google Business Profile claim — has to be done by the owner from a Google account.
- Content strategy (lane guides, rate explainers) — separate writing project.

### Technical notes
- All metadata uses TanStack Start's `head()` per-route pattern (no client-side document.title hacks).
- JSON-LD injected via `<script type="application/ld+json">` in route `head()`.
- Sitemap server route returns `Content-Type: application/xml` with 1h cache.
- No new dependencies needed.
