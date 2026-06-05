## Good news — Fix 4 is already done

Project mein already `src/components/SEO.tsx` hai jo per-route title, description, canonical, OG tags, aur JSON-LD set karta hai. `BlogPost.tsx` mein `BlogPostSchema` aur `MarketplaceProduct.tsx` mein `ProductSchema` already use ho rahe hain. Toh per-route meta + schemas — done.

So sirf **Fix 3** baaki hai: dynamic sitemap.

## Current problem

`public/sitemap.xml` hand-edited static file hai. Jab kal Env Day pe naye blog posts, photos, ya campaigns add karoge, woh sitemap mein nahi aayenge → Google ko discover nahi honge.

Database mein abhi 4 blogs, 2 campaigns, 3 products, 1 plant published hain. Sitemap mein in mein se kuch already hain par stale — naye add hone par sync nahi honge.

## Plan

### 1. Create `scripts/generate-sitemap.ts`

Node script (runs via `bunx tsx`) jo:

- Saare **static routes** include kare (current sitemap ke saare 30+ entries — homepage, services, climate-pack, single-tree-pack, gift-cards, blog index, etc.)
- **Programmatic SEO arrays** import kare aur include kare:
  - `src/lib/seo/sustainability-days.ts` → `/days/:slug`
  - `src/lib/seo/himachal-cities.ts` → `/plant-trees-in/:slug`
  - `src/lib/seo/tree-species.ts` → `/trees/:slug`
  - `src/lib/seo/use-cases.ts` → `/plant-trees-for/:slug`
- **Live DB content** fetch kare PostgREST + anon key se (public data, no service role):
  - `blog_posts` jahaan `is_published = true` → `/blog/:slug` (+ lastmod from `updated_at`)
  - `campaigns` → `/campaign/:id`
  - `marketplace_products` jahaan `is_active = true` → `/marketplace/:id`
  - `plants` jahaan `is_active = true` → `/plants/:id`
- `public/sitemap.xml` overwrite kare with proper `<lastmod>` tags

### 2. Wire in `package.json`

```json
"predev": "bunx tsx scripts/generate-sitemap.ts || true",
"prebuild": "bunx tsx scripts/generate-sitemap.ts"
```

- `predev` failure-tolerant (network down ho to dev server still start ho)
- `prebuild` strict (production build mein sitemap refresh mandatory)

### 3. Run once now

Script ko abhi execute karke `public/sitemap.xml` regenerate karenge, taaki kal publish karne se pehle sitemap up-to-date ho.

## Technical details

- Supabase URL aur anon key script mein hardcode honge (yeh public values hain, already client.ts mein hain — koi secret leak nahi).
- No new dependencies — `tsx` `bunx` ke through chalega (already available).
- `BASE_URL` = `https://himsols-web-companion.lovable.app` (project domain).
- Robots.txt untouched — already correct hai.

## Kal ke baad

Jab bhi tum admin se new blog/product/campaign add karoge aur project publish karoge, prebuild hook automatically sitemap refresh kar dega — GSC mein naye URLs index hone lagenge bina kuch manual karne ke.