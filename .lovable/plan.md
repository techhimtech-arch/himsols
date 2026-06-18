# Top-Rank SEO Upgrade — Himsols

Goal: rank #1 for "tree plantation Himachal", show ⭐ stars in Google results, get cited in ChatGPT/Perplexity, and dominate local searches across HP cities.

---

## Track 1 — Google Reviews (GMB) Integration

Pull live reviews from your verified Google Business Profile and display them on the site + feed them to schema.

**Backend:**
- New edge function `fetch-google-reviews` → calls Google Places API (New) `places:searchText` + `places.reviews` field
- Caches response in a new table `google_reviews_cache` (refresh every 6h) to avoid quota burn
- Returns: rating, total review count, top 5 reviews (author, stars, text, time)

**Frontend:**
- New `<GoogleReviewsSection />` on homepage (above existing Testimonials)
- Each review card: stars, author name + photo, snippet, "View on Google" link
- "See all reviews on Google" CTA → opens GMB listing in new tab

**Required from you (one-time):**
1. **Google Places API Key** — Google Cloud Console → enable "Places API (New)" → create API key, restrict to your domain. I'll request it via secrets tool.
2. **Your Google Place ID** — find at <https://developers.google.com/maps/documentation/places/web-service/place-id> (search "Himsols")

---

## Track 2 — Aggregate Rating Schema (⭐ in Google snippets)

Show star ratings directly in Google search results.

- Compute `aggregateRating` from `testimonials` table (avg of `rating`, count of active rows)
- Inject `Organization` + `LocalBusiness` JSON-LD with `aggregateRating` block on homepage
- Once GMB reviews are live, blend GMB rating into the schema (weighted avg)
- Also emit `Review` schema for top 3 testimonials → eligible for review-rich-results

---

## Track 3 — Local SEO / GEO (Himachal Cities)

You already have `/plant-trees-in/:city` programmatic pages. Upgrade them:

- **Per-city LocalBusiness schema** with `geo.latitude` / `geo.longitude` + `areaServed` polygon
- **Add NAP block** (Name, Address, Phone) at footer of every city page — consistency is Google's #1 local ranking signal
- **Google Maps embed** on each city page (centered on city, marked with Himsols pin)
- **City-specific FAQ schema** ("How much does tree plantation cost in Shimla?", etc.) — these win Featured Snippets
- **Hindi h2 subheadings** on each city page for `hi-IN` queries

Add 5 more high-search HP cities to `src/lib/seo/himachal-cities.ts` if missing (Solan, Bilaspur, Hamirpur, Una, Chamba).

---

## Track 4 — AI Search Optimization (ChatGPT / Perplexity / Gemini)

Get cited when users ask AI assistants about tree plantation in India / Himachal.

- **Expand `public/llms.txt`** — currently minimal; add structured sections (About, Services, Pricing, Cities, FAQs, Contact) with one-line summaries per URL
- **New `/public/llms-full.txt`** — long-form markdown dump of your top 20 pages (AI assistants prefer this for deep citations)
- **FAQPage schema on homepage** — 8 high-intent Q&As ("How does Himsols plant trees?", "Is the ₹299 pack legit?", "Does Himsols give 80G receipt?")
- **HowTo schema** on `/single-tree-pack` and `/climate-impact-pack` (steps: choose → pay → certificate → monitoring)
- **Add semantic `<article>` + `<section>` wrappers** with `itemscope` where missing — AI crawlers parse these heavily

---

## Track 5 — Misc Rank Boosters

- **Breadcrumb schema** on every non-home page (already partially done; complete it)
- **Internal linking audit** — add contextual links from blog posts → city pages, city pages → climate-impact-pack
- **Image alt text scan** — many `<img>` lack descriptive alt (hurts image search)
- **Open Graph image generator** — branded 1200x630 OG image per page (city name + tree count overlay) — boosts CTR on social shares

---

## Out of Scope (mention only)

- **Backlinks** — Google's #2 ranking factor, but happens off-site. I'll add a "Press / Media" page so journalists can find your story.
- **Performance / Core Web Vitals** — separate task; ask if you want it next.
- **Paid Google Ads** — separate budget conversation.

---

## Execution Order

1. Ask you for Google Places API key + Place ID (Track 1 blocker)
2. **In parallel meanwhile**: ship Tracks 2, 3, 4, 5 (no external deps)
3. Once you provide the key: ship Track 1
4. Submit updated sitemap to Google Search Console (you do this via GSC connector — I can guide)

Approve and I'll start with Tracks 2–5 immediately while you grab the Google credentials.
