## Goal
Sabhi trees + marketplace products pe **₹30 flat off** as permanent price drop, strike-through MRP ke saath dikhayenge (jaise `~~₹299~~ ₹269`). Discount **display-only** with real DB price reduced.

## Approach
DB me `mrp` (original) column add karenge dono product tables mein. `price` field actual paid price rahega (already integrated with checkout, wallet, Razorpay — kuch nahi todega). UI mein jab `mrp > price` ho tab strike-through + savings badge dikhayenge.

## Changes

### 1. Database migration
- `trees` table: `mrp NUMERIC` column add
- `marketplace_products` table: `mrp NUMERIC` column add
- Backfill: `UPDATE ... SET mrp = price, price = GREATEST(price - 30, 1)` for all active rows where price > 30
- Special packs handled separately:
  - Single Tree Pack tree: `mrp=299, price=269`
  - Climate Impact Pack (10 trees): pack ka effective mrp 2999, naya price 2699 (₹300 off — 10 × ₹30 logic)

### 2. Hardcoded constants update
- `supabase/functions/purchase-single-tree-pack/index.ts` → `PACK_PRICE = 269`
- `supabase/functions/purchase-climate-pack/index.ts` → `PACK_PRICE = 2699`
- `src/pages/SingleTreePack.tsx` → `PACK_PRICE = 269`, MRP badge `₹299` strike-through, all copy updates (title, meta, hero, CTA button "Pay ₹269")
- `src/pages/ClimateImpactPack.tsx` → `PACK_PRICE = 2699` + strike MRP `₹2999`
- `src/components/home/HeroSection.tsx` → button text pulls from query (already dynamic-ish, will show ₹269), add small strike `₹299` next to it
- `src/components/home/MobileStickyCTA.tsx` → `"Plant a Tree – ₹269"` + strike `₹299`
- `src/components/home/KeyOffersSection.tsx` → show `~~₹299~~ ₹269 onwards`
- Update `useMinTreePrice` hero query fallback: `299 → 269`

### 3. Product card MRP display
Add strike-through MRP + "Save ₹X" pill wherever `mrp > price`:
- `src/components/home/FeaturedTreesSection.tsx`
- `src/components/home/FeaturedProductsSection.tsx`
- `src/components/marketplace/MarketplaceProductCard.tsx`
- `src/pages/Shop.tsx` (tree list)
- `src/pages/Marketplace.tsx` / `src/pages/MarketplaceProduct.tsx`
- `src/pages/TreeCheckout.tsx` (line item shows mrp cut)

Small reusable presentation snippet inline (no new component needed unless duplication grows):
```tsx
{mrp && mrp > price && (
  <span className="text-sm text-muted-foreground line-through mr-2">₹{mrp}</span>
)}
<span className="font-bold">₹{price}</span>
{mrp && mrp > price && (
  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Save ₹{mrp - price}</span>
)}
```

### 4. Types
After migration approval, `src/integrations/supabase/types.ts` regenerates automatically. Then TS reads `mrp` cleanly.

## Not changing
- Checkout logic, wallet, Razorpay, gift-card flows (they all use `price`, unchanged behavior)
- Admin panel: `mrp` field can be edited later — for now admins edit `price` as usual. (Add admin `mrp` input if you want — say the word.)
- Gift cards / donations / campaigns
- RLS, roles, auth

## Notes
- Permanent drop = no expiry/scheduling logic needed
- Discount purely visual via `mrp` column — future promotions ka same infra reuse hoga
- Bulk plantation quotes: unaffected (custom pricing)

Confirm karo to migration + code edits ek saath push kar deta hun.