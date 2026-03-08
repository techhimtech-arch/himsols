
# Himsols Platform — Refactoring Progress

## ✅ Phase 1: Clean Up Duplicates (DONE)
1. ✅ Deleted redundant `LiveStatsSection.tsx` — only `ImpactDashboardSection.tsx` remains
2. ✅ Added `land_partner` to `app_role` enum via migration
3. ✅ Seeded "Climate Impact Pack" tree product so edge function never fails

## ✅ Phase 2: Fix Core Flow Reliability (DONE)
4. ✅ Added `state` column to `farmer_registrations` (default: Himachal Pradesh)
5. ✅ FarmerRegistration now uses `INDIAN_STATES` + `getDistrictsForState()` for multi-state support
6. ✅ CO₂ formula in MyContributions corrected to: `totalTreesAlive × (survivalRate/100) × 22 kg/year`

## 🔲 Phase 3: Performance & Scalability (NEXT)
7. Lazy-load Admin tabs — each tab fetches its own data, remove monolithic `loadData()`
8. Create a DB view for impact stats aggregation (avoid client-side 1000-row limit)
9. Add state/district filters to admin tabs (Orders, Allocations, Farmer Registrations)

## 🔲 Phase 4: UX Polish
10. Demote `/shop` from main nav; ensure all primary CTAs → `/climate-impact-pack`
11. Move old service pages (`/tree-plantation`, `/waste-management`, `/services`) to footer links only
12. Deprecate `/apply-land-partner` route (redirect to `/farmer-registration`)

---

## Key Decisions
- `/farmer-registration` is the single entry point for partner applications
- `land_partner_applications` table kept for backward compat (existing admin tabs use it)
- Climate Impact Pack tree seeded with `stock_quantity: 9999` as virtual product
