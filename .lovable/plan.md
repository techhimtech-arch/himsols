# Himsols — ek identity, 4 doors (bacha hua kaam)

Positioning already tay hai: **Himachal ka plantation implementation partner** — companies, schools, individuals ke liye trees; farmer ke liye service ka koi charge nahi. Homepage pe 4-doors grid, simplified navbar, aur marketplace/scrap/wallet/campaigns/ornamental sab band — ye ho chuka hai.

Neeche sirf wo cheezein hain jo abhi bhi khichdi bana rahi hain.

## 1. Homepage: teen jagah wahi baat (overlap hatao)

Aaj homepage pe `FourDoorsSection`, `FreePlantationSection` aur `CSRSection` teeno kaafi overlap karte hain — visitor ko lagta hai teen alag offer hain.

- `FourDoorsSection` = single decision block (Companies / Schools / Individuals / Farmers), har card ka apna CTA.
- `FreePlantationSection` ko "how a plantation request works" (3 steps + tracking + certificate) mein badal do — dobara offer pitch nahi.
- `CSRSection` ko chhota proof-led band bana do: ek line + "See CSR proposal" CTA.
- Final order: Hero → 4 Doors → How it works → Request flow → Impact → Trust proof → Learn/Quiz/Blog strip → FAQ → Final CTA.

Wording neutral rahega (jaisa pichle turn mein tay hua) — "free" ka loud promise nahi, "support optional" theek hai.

## 2. Footer: doors ke hisaab se rows theek karo (DB se, code se nahi)

`footer_links` mein abhi:
- "Plant Trees" → `/shop` ke bajaye `/tree-plantation` hona chahiye.
- Farmers row: `Partner With Us` inactive hai — decide karo ek hi farmer entry (`/farmer-registration`) rahegi.
- `Gift Cards`, `Marketplace`, `Waste Management`, `Plant Nursery`, `Village Registration`, `Carbon Dashboard` — inactive hi rehne dein (permanent band).
- Sections ko 4 doors + Proof + Learn ke hisaab se label karo: Companies · Schools · Plant a Tree · Farmers · Proof (Impact/Gallery/Track) · Learn (Blog/Learn/Quiz/Days) · Support (Contact/Legal).

## 3. Nav DB cleanup

`navigation_items` mein 18 inactive/duplicate rows padi hain (do "Home", do "Corporate", do "Contact", Shop/Marketplace/Plants/Campaigns/Gift Cards). Active set sahi hai; duplicate inactive rows ko admin se hata denge taaki galti se koi wapas on na kar de. Learn ko dropdown parent bana ke Blog / Learn pages / Green Quiz / Days uske andar rakhenge (`parent_id` support already hai).

## 4. Gift cards ka naya role

Nav se already hata hua hai. Ab `/gift-cards` ko standalone program ki tarah promote nahi karenge — `/tree-plantation` aur `/corporate` ke andar ek "gift it to someone" option ke roop mein link karenge. Page zinda rahega (direct links kaam karenge), sitemap mein low priority.

## 5. SEO files ko positioning ke saath align karo

- `scripts/generate-sitemap.ts`: `/shop` aur `/services` hatao (ye ab doors ka part nahi), `/partner-with-us` ka faisla farmer entry ke saath, baaki 4 doors + proof + learn + programmatic pages rahenge.
- `public/llms.txt`: abhi "sponsor trees from ₹299", "48 hours geo-tag proof", "3-year survival tracking", `/shop`, Razorpay lines hain — inko pilot-phase-honest banao: plantation request flow, monsoon season plantation, proof pipeline ka current status, CSR/schools paid + individual/farmer requests. Jo abhi actually nahi hota, wo claim nahi.
- `index.html` + `SEO.tsx` descriptions ek hi one-liner par set — koi "marketplace/scrap" ya donate language nahi.
- `robots.txt` already private routes block karta hai — verify only.

## 6. Request thank-you page

`/tree-plantation` success screen pe tracking ID + optional UPI + CSR link already hai. Bacha kaam: ek saaf soft-upsell block (Company ho? → CSR proposal; ya paid pack) aur "certificate tracking page se milega" line — clutter ke bina.

## Technical notes

- Sirf frontend copy/layout changes + DB rows ka `is_active` / label / sort_order update. Koi table drop nahi, koi data delete nahi, sab reversible.
- Touched files: `src/pages/Index.tsx`, `src/components/home/{FourDoorsSection,FreePlantationSection,CSRSection}.tsx`, `src/pages/TreePlantation.tsx`, `scripts/generate-sitemap.ts`, `public/llms.txt`, `index.html`, `src/components/SEO.tsx`.
- Nav/footer changes migration ke through `navigation_items` / `footer_links` par (code mein hardcode nahi).
- Band features ke routes as-is rahenge (direct link kaam karega), sirf discovery surfaces se bahar.
