
## Problem

**1. Carbon Dashboard (`/carbon-dashboard`) — inflated/misleading figures**

`CarbonDashboard.tsx` reads from `carbon_settings` table with **hardcoded fallbacks** (15,000 trees, 250 farmers, 12 sites). Current DB has manually-entered values (500 trees, 150 farmers, 8 sites) which don't match actual ground truth. The page is "admin-controlled" but the admin has to remember to update it — so it drifts from reality. Real verified data already lives in `orders` + `tree_allocations` + `survival_updates` + `land_partner_applications` (this is exactly what `/impact` page already uses).

**2. Schools admin tab — PDF button invisible when list is empty**

`SchoolPartnershipsTab.tsx` *does* have PDF buttons, but only inside each table row's Actions column and inside the row-details dialog. If there are **no applications yet** (likely current state), admin sees an empty table and zero PDF entry-point. There's no top-level "Download generic outreach kit" button.

## Fix

### A. Carbon Dashboard — switch to real, verified data (with safe admin overrides)

In `src/pages/CarbonDashboard.tsx`:

- Fetch live counts in parallel (same pattern as `src/pages/Impact.tsx`):
  - `currentTrees` = `SUM(tree_allocations.tree_count)` (verified allocated trees, not just sponsored)
  - `survivalRate` = % of `survival_updates` with `health_status='healthy'` (fallback 85% if no data)
  - `farmers` = `COUNT(land_partner_applications WHERE status='Verified')`
  - `activeSites` = `COUNT(DISTINCT villages WHERE status='active')` (or fallback to verified partners count)
- Keep `carbon_settings` only for two **knobs**, not for inventing numbers:
  - `tree_absorption_rate_kg` (formula input, default 22)
  - `target_trees` (admin goal, default 100,000)
- Remove the inflated hardcoded fallbacks (15000, 250, 12). If real data is 0, show 0 honestly with a "Be the first" style note — never fake numbers.
- Keep the existing "estimates / not certified credits" disclaimer.
- Plantation growth chart: derive monthly series from `orders.created_at` grouped by month instead of admin-typed JSON (drop `plantation_data` setting from UI dependency; still allow it as override if present).

In `src/components/admin/CarbonSettingsTab.tsx`:

- Trim the form to only the **knobs** that still make sense (`tree_absorption_rate_kg`, `target_trees`, `survival_rate_percent` as optional override).
- Remove the `current_trees`, `participating_farmers`, `active_sites`, `plantation_data` inputs (or label them clearly as "Override only — leave blank to use live data").
- Add a small note: "Live numbers are auto-computed from verified orders, allocations, and partner data."

### B. Schools admin tab — always-visible Outreach Kit PDF + WhatsApp

In `src/components/admin/SchoolPartnershipsTab.tsx`:

- Add a header action bar (right side of the "School Partnerships" heading) with:
  - **Button**: "Download Outreach Kit (PDF)" → calls `generateSchoolOutreachPdf("")` and saves the generic version.
  - **Button**: "Share on WhatsApp" → opens `https://wa.me/?text=<pre-filled program intro + link to /schools>` so admin can paste into any school chat after attaching the just-downloaded PDF (with a toast reminder).
- Keep existing per-row PDF/WhatsApp icons unchanged.
- Empty-state row: instead of just "No applications found", show a small card explaining the outreach kit usage with the same two buttons inline, so even with zero leads the admin can act.

## Files touched

- `src/pages/CarbonDashboard.tsx` — live data fetch, drop hardcoded fallbacks.
- `src/components/admin/CarbonSettingsTab.tsx` — slim form, clarify what's a knob vs auto.
- `src/components/admin/SchoolPartnershipsTab.tsx` — header action bar + better empty state.

## Out of scope

- No DB schema change (existing `carbon_settings` keys stay; we just stop relying on the inflated ones).
- No changes to `/impact` page, school PDF generator (`schoolOutreachPdf.ts`), or the public `/schools` page.
- No new admin permissions or RLS changes.
