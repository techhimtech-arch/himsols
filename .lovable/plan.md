

# Himsols Platform — Gap Analysis & Remaining Work

## What's Already Built (Done)

| System | Status |
|--------|--------|
| Database: `orders`, `tree_allocations`, `survival_updates`, `villages`, `csr_partners`, `nurseries`, `allocation_logs`, `land_partner_applications` | Done |
| Admin tabs: Villages, CSR Partners, Nurseries, Orders with allocation, Land Partners, Sellers | Done |
| Public pages: `/village-register`, `/partner-with-us`, `/apply-land-partner`, `/impact` | Done |
| Land Partner verification workflow (Apply → Admin Review → Role grant) | Done |
| Tree allocation pipeline (Admin assigns batches of 10 to verified partners via `order_id`) | Done |
| Buyer Impact Dashboard (`/my-contributions`) — orders, allocations, survival updates | Done |
| Public Impact Dashboard (`/impact`) — aggregated stats from real data | Done |
| Homepage restructured as SaaS-style platform (Hero, How It Works, Impact Dashboard, ₹2,999 Pack, CSR, Partner Farmer) | Done |
| Role-based access (`user_roles` table, `has_role()` function) | Done |
| Wallet, Gift Cards, Campaigns, Marketplace — all functional | Done |
| Auth session self-healing (token refresh failure cleanup) | Done |
| Query caching optimized (5min stale, no refetch on focus) | Done |

---

## What's Remaining (4 Gaps)

### Gap 1: No Dedicated ₹2,999 Checkout Flow
**Current state:** The "Start Your Climate Impact" button on homepage goes to `/shop` — a generic tree catalog with individual tree selection, filters, cart, etc.
**Problem:** A user wanting the ₹2,999 pack has to manually browse, select trees, and build a cart. There's no single-click "Buy the Pack" experience.
**What to build:**
- A dedicated `/climate-impact-pack` page (or a streamlined checkout component) that:
  - Shows the pack details (10 trees, geo-tags, survival tracking, certificate)
  - Has a single "Buy Now — ₹2,999" button
  - Requires login → Creates a single order with quantity=10 and total_price=2999
  - Redirects to Razorpay payment
  - On success → order created → admin allocation pipeline kicks in
- Update all CTAs across the site (Hero, ClimateImpactPackSection, MobileStickyCTA, MyContributions empty state) to point to this new page instead of `/shop`

### Gap 2: Gift Card → Impact Pack Integration
**Current state:** Gift cards can only be redeemed for campaign donations or wallet credit. They can't be used to purchase the Climate Impact Pack directly.
**What to build:**
- Add a "Use Gift Card" payment option in the new Impact Pack checkout flow
- When a gift card code is applied, validate balance ≥ ₹2,999
- Deduct from gift card balance and create the order (similar to the existing `redeem-gift-card` edge function but creating an `orders` row instead of a `donations` row)
- Alternatively, allow wallet balance (already topped up from gift cards) as payment for tree orders

### Gap 3: Per-User CO₂ Reporting in My Contributions
**Current state:** CO₂ offset is only shown on the public `/impact` page as an aggregate. Individual users don't see their personal carbon impact.
**What to build:**
- In `/my-contributions`, add a "Your CO₂ Impact" card
- Calculate: user's allocated trees × survival rate × 22 kg/year
- Show it prominently alongside existing stats (Total Invested, Trees Sponsored, Trees Allocated, Survival Rate)

### Gap 4: Multi-State Region Filtering on Dashboards
**Current state:** State/district fields exist on `orders`, `villages`, `land_partner_applications`, etc. but no filtering UI uses them.
**What to build:**
- Admin dashboard: Add state/district filter dropdowns on Orders, Villages, Land Partners tabs
- Public `/impact` page: Optional state-based breakdown of metrics
- This enables the "Today Himachal, Tomorrow multi-state" scalability goal

---

## Implementation Plan (Priority Order)

### Task 1: Dedicated Climate Impact Pack Checkout Page
- Create `src/pages/ClimateImpactPack.tsx` — focused single-product page
- Add route `/climate-impact-pack` in App.tsx
- Integrate Razorpay payment (reuse existing `useRazorpay` hook)
- On payment success, create order in `orders` table (quantity=10, total_price=2999)
- Update all homepage CTAs to link to `/climate-impact-pack`

### Task 2: Per-User CO₂ Card in My Contributions
- Add a 5th stat card in the impact stats grid
- Formula: `totalAllocated × (survivalRate/100) × 22` kg CO₂/year
- Simple addition, no backend changes needed

### Task 3: Gift Card / Wallet Payment for Impact Pack
- Add wallet balance check + deduction in the checkout flow
- Add gift card code input as alternative payment method
- Create an edge function or extend existing logic to handle order creation via wallet/gift card

### Task 4: State/District Filters on Admin Tabs
- Add filter dropdowns to OrdersTab, VillagesTab, LandPartnersTab
- Filter queries by selected state/district
- Add state breakdown cards on `/impact` page

---

## Summary

Out of the full strategic vision, roughly **85% is built**. The 4 remaining gaps above are what separate the current state from a fully ship-ready, scalable climate business platform. Gap 1 (dedicated checkout) is the highest priority as it directly impacts conversion and revenue.

