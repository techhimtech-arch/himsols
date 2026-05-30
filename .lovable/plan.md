# SEO Domination Plan — Himsols ko har sustainability search pe top pe lana

Bhai sach batau — abhi tak hum "success" isliye nahi hain kyunki:
1. **Content volume kam hai** — Google ko ranking ke liye 50+ quality articles chahiye, abhi humare paas mutthi bhar blog posts hain.
2. **Koi sustainability-day landing pages nahi hain** — World Environment Day, Earth Day, Van Mahotsav pe log search karte hain, hum kahin nahi dikhte.
3. **Backlinks zero** — koi authority site humein link nahi karti.
4. **Local SEO missing** — "tree plantation Himachal", "plant trees Shimla" jaisi local queries optimize nahi.
5. **Programmatic SEO nahi hai** — har district/species/occasion ke liye alag page hona chahiye.

Yeh plan 3 phases mein full SEO machine banayega.

---

## Phase 1 — Sustainability Days Landing Pages (Quick Wins)

Har major eco-day ke liye dedicated, evergreen landing page. Yeh saal-dar-saal traffic dega.

**Pages to build** (`src/pages/days/`):
- `/world-environment-day` — June 5
- `/earth-day` — April 22
- `/van-mahotsav` — July 1-7 (India specific, kam competition!)
- `/world-nature-conservation-day` — July 28
- `/national-pollution-control-day` — December 2
- `/international-day-of-forests` — March 21
- `/world-ozone-day` — September 16
- `/world-water-day` — March 22

**Har page mein:**
- H1 with year ("World Environment Day 2026 — Plant a Tree in India")
- History, theme, why it matters (1500+ words, English + Hindi)
- "Celebrate by planting" CTA → Climate Impact Pack / Single Tree Pack
- FAQ section (5-7 questions) with FAQPage JSON-LD
- Article JSON-LD with author, datePublished
- Auto-update banner: "X days until [Day Name]"
- Internal links to /blog, /tree-plantation, /corporate

**Routing:** Add to `src/App.tsx`, add to `public/sitemap.xml` + `public/llms.txt`.

---

## Phase 2 — Programmatic SEO (Scale)

**Location pages** — `/plant-trees-in/:city` for top 20 Himachal cities (Shimla, Manali, Dharamshala, Kullu, Mandi, Solan, etc.) — auto-generated from a city list with local context.

**Species pages** — `/trees/:species-slug` per tree species (Deodar, Oak, Pine, Apple, Walnut) — pulled from existing `trees` table with SEO-optimized templates.

**Use case pages**:
- `/plant-trees-for-birthday`
- `/plant-trees-for-wedding`
- `/plant-trees-in-memory`
- `/corporate-gifting-trees`
- `/csr-tree-plantation-india`

Each generated from a template component with unique H1, intro, CTA, schema.

---

## Phase 3 — Content & Authority Layer

**Blog content calendar** — admin tab showing upcoming sustainability days with "Generate draft blog post" button (uses Lovable AI Gateway to draft article). Target: 2 posts/week.

**Content templates** to seed:
- "10 Native Trees of Himachal Pradesh"
- "CO2 Calculator: How Many Trees to Offset Your Car"
- "Agroforestry vs Monoculture — Hindi Guide"
- "How to Start a Plantation Drive in Your School"

**Technical SEO fixes:**
- Add `<link rel="alternate" hreflang="hi-IN">` and `en-IN` for bilingual pages
- BreadcrumbList JSON-LD on all interior pages
- `og:image` per page (auto-generated banner per day/page)
- Internal linking widget: "Related: [Day name], [Species], [City]"
- RSS feed `/rss.xml` for blog (helps content distribution)

**Off-page (instructions for you, not code):**
- Submit sitemap to Google Search Console (separate task)
- List Himsols on: India CSR directories, Better India guest post, LinkedIn company page, Google Business Profile
- Get backlinks from: partner schools, CSR clients (footer link), local news coverage

---

## Technical implementation

```text
src/
  pages/
    days/
      WorldEnvironmentDay.tsx
      EarthDay.tsx
      VanMahotsav.tsx
      ... (8 total)
      _DayPageTemplate.tsx        ← shared layout
    locations/
      PlantTreesInCity.tsx        ← dynamic /:city
    species/
      TreeSpeciesPage.tsx         ← dynamic /:slug
  lib/
    seo/
      sustainability-days.ts      ← data file (date, theme, copy)
      himachal-cities.ts          ← city list + local copy
      faq-schema.ts               ← FAQPage JSON-LD helper
      breadcrumb-schema.ts        ← BreadcrumbList helper
  components/
    seo/
      FAQSection.tsx              ← renders Q&A + injects schema
      Breadcrumbs.tsx             ← visible breadcrumbs + schema
      CountdownBanner.tsx         ← "X days until..."
```

- Sitemap generator extended to loop over days + cities + species.
- `llms.txt` updated with new sections.
- Each new page wraps existing `<SEO>` + adds FAQ/Breadcrumb schemas.
- No backend schema changes needed for Phase 1 & 2; Phase 3 admin tab uses existing `blog_posts` table + Lovable AI.

---

## Suggested execution order

1. **Sprint 1 (now):** Phase 1 — 8 sustainability day pages + sitemap/llms.txt update. Biggest ROI, evergreen traffic.
2. **Sprint 2:** Phase 2 — location + species programmatic pages.
3. **Sprint 3:** Phase 3 — content calendar admin + technical polish.

**Mera suggestion:** Sprint 1 se shuru karte hain — 8 day-pages ban jayein toh tu Earth Day, Environment Day, Van Mahotsav pe rank karna shuru karega within 2-3 months. Phir Sprint 2/3 alag-alag turns mein.

**Bata — Sprint 1 se start karun ya teeno ek saath?**
