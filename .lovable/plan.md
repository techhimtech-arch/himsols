# Himsols Native Plant Nursery — zero-inventory start

## Seedha idea

Himsols ko Himachal ka **native plant nursery** banao, lekin pehle stock khareedne ya warehouse lene ki zaroorat nahi.

Model: website par native saplings dikhayo → order lo → paise lo → uske baad local verified nursery/farmer se source karo → deliver karo. Margin 20-30% rake karke.

Ye existing `plants`, `nurseries`, `marketplace_orders` tables se fit hota hai. Plantation service ke saath bundle bhi ban sakta hai.

## Kyun yeh business chal sakta hai

- Himachal mein native plants (deodar, rhododendron, oak, maple, kafal, etc.) ki organic demand hai — gardeners, hotels, schools, CSR.
- Tumhe nursery banana nahi padega; tum **aggregator + last-mile delivery** banoge.
- Monsoon 2026 ke baad plantation season ke liye lead capture bhi karega.
- Existing code mein `Plants`, `PlantDetail`, `PlantsTab`, `NurseriesTab` already bana hua hai — bas revive aur repurpose karna hai.

## Business model (4 phases)

```text
Phase 0: Validate demand (Week 1-2)
  - 5-10 native species ka simple catalog page
  - "Pre-order · made to order · 3-7 days" messaging
  - WhatsApp/UPI inquiry form, no payment gateway pehle
  - Goal: 10 serious inquiries

Phase 1: Online pre-order flow (Week 3-4)
  - /plants aur /plant/:id revive karo
  - Cart + checkout: address collect karo, order "pending sourcing"
  - Admin manually sources from `nurseries` table
  - UPI QR payment (Razorpay domain fix ke baad add karna)

Phase 2: Sapling + Plantation bundle (Month 2)
  - "Buy saplings + we plant them" package
  - Existing tree plantation request se link karo
  - Higher ticket: individual lawns, schools, small hotels

Phase 3: B2B bulk supply (Month 3+)
  - Schools, hotels, CSR, government nurseries ko bulk quote
  - Use existing `csr_partners` / `school_partnerships` lead tables
  - Recurring monsoon/seasonal orders
```

## Operational truth (no false promise)

- **No live inventory**: `stock_quantity` = pre-order slots, not physical stock.
- **Lead time**: har product page par "3-7 days sourcing time" clearly likho.
- **Sourcing**: 2-3 local Himachal nurseries ko `nurseries` table mein add karo; order aane par unse rate poochh ke final price confirm karo.
- **Delivery**: shuru mein khud bike/tempo se ek district mein deliver karo. Delivery charge alag se show karo.
- **Payment**: shuru mein UPI QR + manual verification. Razorpay tab jab domain issue resolve ho.

## Technical changes

### Frontend
- `src/pages/Plants.tsx` / `PlantDetail.tsx`: copy update — "Native Plants of Himachal", "Pre-order", "Sourced from verified local nurseries".
- `src/components/Navbar.tsx`: "Native Plants" link add karo (top-level ya Individuals ke dropdown mein).
- New `src/pages/NativePlantsLanding.tsx` (optional Phase 0): 5-10 hero species + WhatsApp lead form.
- `src/components/SEO.tsx`: Product schema add karo for plant pages.

### Backend / DB
- Reuse `marketplace_orders` table for plant nursery orders (items jsonb already supports multiple products).
- Add `order_type` enum or use `notes` field to distinguish plant orders from marketplace.
- `plants` table mein optional `lead_time_days` integer add karo (no migration risk).
- Populate `nurseries` table with 2-3 real local nurseries via admin `NurseriesTab`.

### Admin
- `PlantsTab` already exists — use it to manage catalog.
- `MarketplaceOrdersTab` ya new `PlantOrdersTab` mein order lifecycle: pending → sourcing → ready → out_for_delivery → delivered.
- Add payout/sourcing cost field so margin track ho sake.

### SEO
- City pages: "buy native plants in Shimla", "saplings in Mandi", etc. — existing `PlantTreesInCity` template reuse kar sakte ho.
- Target keywords: "Himachal native plants", "deodar sapling", "rhododendron plant", "buy plants in Himachal".

## Go-to-market (free)

- Instagram/WhatsApp status: daily 1 plant photo + "DM to pre-order".
- Local Facebook/gardening groups mein post karo.
- Schools/hotels ko direct WhatsApp karo: "Monsoon ke liye native saplings pre-book karo".
- CSR clients ko bundle pitch karo: saplings + plantation + report.

## Success metrics (first 90 days)

- 10 pre-orders in Month 1
- 3 repeat buyers in Month 2
- ₹10,000 revenue in Month 1, ₹25,000 by Month 3
- 2-3 reliable nursery suppliers onboard

## Risks

| Risk | Mitigation |
|------|------------|
| Demand na bane | Phase 0 mein sirf landing page + WhatsApp form; code tab validate ho jaye |
| Supplier unreliable | 2-3 nursery option rakhkar order confirm karo |
| Delivery damage | Local short-distance delivery only; hardy species pehle |
| Payment friction | UPI QR + manual verification; Razorpay baad mein |

## Suggested build order

1. Phase 0 landing page + WhatsApp lead form (1-2 days)
2. Revive `/plants` catalog with pre-order messaging (1-2 days)
3. Plant checkout using `marketplace_orders` + UPI manual flow (2-3 days)
4. Admin order lifecycle + nursery sourcing notes (2 days)
5. SEO city pages + social posts (2 days)

## Notes

- No new heavy features like wallet, gift cards, or marketplace needed.
- No false "in stock" claims. Every product page must say "made to order".
- Trees/certificate free model ko alag rakho — nursery ek alag paid lane hai.
