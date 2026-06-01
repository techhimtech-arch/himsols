
# Monsoon Tree Orders Blitz — Himachal 2026

Goal: Iss monsoon (July–August 2026, Van Mahotsav window) maximum tree orders Himachal mein. SEO foundation ready hai — ab **conversion + distribution + urgency** pe focus.

## Strategy in one line
Monsoon = best plantation season. Iska scarcity + Van Mahotsav (July 1–7) + CSR financial year + school reopening — sab ek saath aata hai. Inhe ek campaign mein convert karna hai.

---

## Phase 1 — Monsoon Urgency Layer (highest ROI, 2–3 din)

### 1.1 Sitewide Monsoon Banner
- Top sticky banner: **"🌧️ Monsoon Plantation Window Open — Plant by Aug 31 for 90%+ survival"**
- Countdown to Aug 31 deadline
- CTA → Climate Impact Pack
- Dismissible but reappears next session

### 1.2 Homepage Monsoon Hero Variant
- Hero headline swap: "Monsoon hai. Best time to plant in Himachal."
- Trust line: "July–August plantation = 90% survival vs 60% off-season"
- Two CTAs: Plant 1 Tree ₹299 | 10-Tree Pack ₹2,999

### 1.3 Dedicated Monsoon Landing Page `/monsoon-plantation-himachal`
- H1: "Monsoon Tree Plantation in Himachal Pradesh 2026"
- Why monsoon = best season (science + soil moisture data)
- Van Mahotsav tie-in (July 1–7)
- Live counter: "X trees already booked for monsoon batch"
- City picker → routes to existing `/plant-trees-in/:city`
- FAQ + Article JSON-LD
- Added to sitemap + llms.txt

### 1.4 Scarcity on Pack Pages
- ClimateImpactPack + SingleTreePack pages: add "Monsoon Batch — limited slots" badge
- "Next plantation drive: [next Saturday]" auto-calculated

---

## Phase 2 — Conversion Lift on Existing Traffic (3–4 din)

### 2.1 Exit-Intent Popup
- On `/days/*`, `/plant-trees-in/*`, `/trees/*` pages
- Offer: "Pledge ₹299 for monsoon plantation — get free certificate"
- Email capture for non-converters → drip campaign

### 2.2 WhatsApp-First Checkout Nudge
- After 30s on tree pages: floating WA button with pre-filled message: "Hi, monsoon mein 1 tree plant karwana hai"
- Goes to existing WhatsApp number from site_settings

### 2.3 Group Plantation CTA
- "Plant 5 trees with friends — split ₹1,495" card on homepage
- Share link → group checkout (uses existing referral system)

### 2.4 Social Proof Boost
- "X trees planted this week" live counter on every tree page
- Recent orders ticker: "Rohan from Delhi just planted 10 trees in Manali" (anonymized from real orders)

---

## Phase 3 — CSR & Bulk Push (parallel, 5–7 din)

### 3.1 CSR Monsoon Campaign Page `/csr-monsoon-himachal-2026`
- Target: Indian companies with Q2 CSR budgets
- "Offset 100 tonnes CO2 this monsoon — verified Himachal plantation"
- Pricing tiers: 100 / 500 / 1000 / 5000 trees
- Downloadable monsoon CSR brochure (PDF)
- Bulk inquiry form (existing flow)

### 3.2 School Van Mahotsav Pack
- `/schools/van-mahotsav-2026` page
- "Adopt your school's plantation drive — ₹14,999 for 50 trees"
- Includes student certificate template, plantation kit
- Auto-emailed proposal PDF

### 3.3 Corporate Outreach Asset
- Lovable AI Gateway → generate personalized CSR email drafts in admin
- Admin tab: paste company name → get tailored pitch + impact projection

---

## Phase 4 — Distribution (ongoing through monsoon)

### 4.1 Bilingual Blog Surge (auto-drafted via Lovable AI)
- 8 monsoon-themed posts (Hindi + English), seeded in admin:
  - "Monsoon mein Himachal mein kaunse ped lagaye"
  - "Van Mahotsav 2026: kaise celebrate kare"
  - "5 reasons monsoon = best plantation season"
  - "Himachal landslides aur tree plantation"
- Each links to `/plant-trees-in/:city` + `/climate-impact-pack`

### 4.2 Shareable Pledge Card
- `/pledge` page: name + city → generates shareable pledge image
- "I pledged to plant a tree in Manali this monsoon 🌧️🌱"
- WhatsApp / Instagram share built-in
- Viral loop → captures email

### 4.3 Influencer & Press Kit
- `/press` page with logo, brand colors, founder quote, stats, photos
- One-click download

---

## Phase 5 — Retention & Repeat Orders (week 2)

- Post-purchase email: "Your tree is part of Monsoon Batch #X. Tracking link in 7 days."
- Day-15 email with geo-tagged photo → "Plant one more for ₹299?"
- Wallet bonus: "Plant 5 trees this monsoon → ₹500 wallet credit for next year"

---

## Execution Order (recommended)

```text
Day 1-2  → Phase 1.1, 1.2, 1.3, 1.4    (urgency layer)
Day 3-4  → Phase 2.1, 2.2, 2.3, 2.4    (conversion lift)
Day 5-7  → Phase 3.1, 3.2, 3.3         (CSR push)
Day 8-10 → Phase 4.1, 4.2, 4.3         (distribution)
Day 11+  → Phase 5                     (retention)
```

## Technical notes

- All new pages: existing `<SEO>` + Article/FAQ/Breadcrumb JSON-LD
- Monsoon banner: stored in `site_settings` (admin toggle) so you can disable Sept 1
- Live counters: pull from existing `live_stats` table — no hardcoding
- Pledge card image: client-side canvas, no backend cost
- CSR brochure PDF: reuse existing `Himsols-CSR-Pitch-Deck.pdf` infra
- Exit-intent + scarcity badges: pure frontend, zero DB impact
- Admin AI draft tab: Lovable AI Gateway (no API key needed)

## What I will NOT do without your nod

- Discounting (₹299 is already entry price — discounting hurts brand)
- Paid ads setup (out of code scope; can prep landing pages for it)
- Sending bulk email/SMS (needs your contact list + Resend domain)

---

**Bata — pura plan ek saath chalu karun, ya Phase 1 (monsoon urgency) se start karun jo sabse zyada immediate impact dega?**
