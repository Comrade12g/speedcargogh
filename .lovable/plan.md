
## Scope addition

On top of the previously approved work (clean-URL hosting of the uploaded static site + Lovable Cloud admin gate for `generalx369@outlook.com`), pull real content and imagery from `wl.pb68.cn` into the About and Branches sections of the new site. Take light inspiration from `yishippinggh.com` for layout/structure. Keep the uploaded files' existing colors, fonts, and overall styling untouched.

## Content to pull from wl.pb68.cn

Company facts (translated from Chinese to English):
- Founded 2004; approved by China's Ministry of Commerce as an import/export agency.
- Trade relationships with buyers in 100+ countries.
- 800+ containers shipped per year.
- Branches: Yiwu, Shenzhen (China), Ghana, Congo.
- Services: international air freight, LCL sea consolidation, FCL sea, Asia 16-country consolidation to Africa, double customs clearance, 24/7 cargo tracking, door-to-door.
- Positioning: safe, professional, efficient; one-to-one account manager; warehouses at destination for self pickup or delivery.

Images to download and self-host under `public/assets/wl/` (so the new site doesn't hotlink the old domain):
- `skin/picture/supply_01.jpg` … `supply_07.jpg` (partner/brand strip)
- `skin/picture/img.png`, `img21.png`, `img31.png`, `img41.png` (service icons)
- `skin/picture/handover.png`, `cities.png`, `client.png`, `company.png` (strength section icons)
- `skin/image/epil.png`

## Where it goes in the new site

- `about.html` — replace placeholder About copy with the translated company story (2004 founding, scale, philosophy), and add a "Our strengths" block using the four strength icons.
- A new "Our branches" section on `about.html` (or as a small block on `index.html`, your call) listing the four branches: Yiwu, Shenzhen, Ghana (Accra), Congo. China + Congo get a short paragraph + photo each, as requested. Ghana + Shenzhen + Yiwu get a name + short line.
- `index.html` — keep current layout/colors; only swap generic service blurbs for the four real service categories (air, LCL, FCL, Asia consolidation) using the matching icons.
- No layout/CSS rewrites. All edits stay within existing HTML containers and reuse current classes from `styles.css`. Colors stay exactly as in the uploaded files.

## What I will NOT do

- No design system change, no new fonts, no new color tokens.
- No copying of `wl.pb68.cn` HTML/CSS — only the textual facts and the listed image files.
- No scraping of `yishippinggh.com` content; it's only a structural reference for how to lay out "branches" and "about" sections.
- Admin page stays gated behind the Lovable Cloud auth flow from the prior plan.

## Questions before I build

1. **Language for the pulled About/branch copy** — English only, Chinese only, or bilingual (EN primary, ZH secondary)? The source is Chinese; the uploaded site appears to be English.
2. **Branch pictures for China and Congo** — I don't see branch photos on `wl.pb68.cn` (only generic stock/icon images). Options:
   a) Use neutral city/port stock photos (Yiwu market, Shenzhen port, Pointe-Noire/Brazzaville port) generated via image gen, OR
   b) Skip photos and use icon + address blocks only, OR
   c) You'll upload real branch photos later.
3. **Branch addresses / phone numbers** — `wl.pb68.cn` only exposes one phone (13676800396) and no street addresses (contact page is 404). Do you have the real addresses for the Congo and China branches, or should I list them as "Yiwu, China / Shenzhen, China / Brazzaville, Congo" without street detail?
