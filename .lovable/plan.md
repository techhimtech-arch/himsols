

# Scrap Types with Predefined Rates — Workflow Plan

## What We're Building

A **scrap_types** master table with predefined rates (₹/kg) for each scrap category. This enables:
- Users see live rates on the WasteManagement page before submitting
- Users select multiple scrap types per request (with estimated qty each)
- Vendors enter actual weight per type during collection → auto-calculates payout
- Admin can manage scrap types and rates from admin panel

## Current State
- `waste_management_requests.waste_type` is a single text field (one type per request)
- Scrap types are hardcoded in `WasteManagement.tsx` (line 60-70) — no rates attached
- No scrap types table exists

---

## Technical Steps

### 1. New Table: `scrap_types`
```sql
scrap_types (
  id uuid PK,
  name text NOT NULL,           -- "Iron/Steel"
  name_hi text,                 -- Hindi name
  category text,                -- "Metal", "E-Waste", "Paper", etc.
  rate_per_kg numeric NOT NULL, -- ₹22/kg
  unit text DEFAULT 'kg',       -- kg, piece, etc.
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at, updated_at
)
```
RLS: Anyone can read active types. Admin can manage all.

### 2. New Table: `scrap_request_items` (many-to-many)
Links a waste_management_request to multiple scrap types with quantity info:
```sql
scrap_request_items (
  id uuid PK,
  request_id uuid FK → waste_management_requests,
  scrap_type_id uuid FK → scrap_types,
  estimated_qty_kg numeric,       -- user's estimate
  actual_qty_kg numeric,          -- vendor fills after collection
  rate_at_collection numeric,     -- snapshot of rate at time of collection
  line_total numeric,             -- actual_qty × rate (computed on update)
  created_at
)
```
RLS: Users can read own (via request ownership). Vendors can update assigned. Admin full access.

### 3. Seed Default Scrap Types with Rates
Insert common types with approximate Indian scrap market rates:
| Type | Rate/kg |
|------|---------|
| Iron/Steel | ₹22 |
| Copper | ₹450 |
| Aluminium | ₹110 |
| Paper/Cardboard | ₹12 |
| Plastic (mixed) | ₹10 |
| E-Waste | ₹15 |
| Glass | ₹3 |
| Batteries | ₹50 |
| Textile/Fabric | ₹8 |

### 4. Update WasteManagement Page
- Fetch `scrap_types` from DB and show a **rate card** section (user sees live rates before requesting)
- Replace single `wasteType` dropdown with multi-select checkboxes — user picks multiple types and enters estimated qty for each
- On submit: insert main request + `scrap_request_items` rows

### 5. Vendor Collection Flow (for later implementation)
- When vendor marks collected, they enter `actual_qty_kg` per scrap type
- `rate_at_collection` is auto-filled from current `scrap_types.rate_per_kg`
- `payout_amount` on the request = SUM of all line_totals

### 6. Admin: Scrap Types Tab
- New admin tab to CRUD scrap types and update rates
- Rates are editable — market prices change frequently

### 7. Keep backward compat
- Keep `waste_type` text column on requests for legacy/summary display
- New requests will also populate `scrap_request_items` for detailed tracking

---

## Implementation Order
1. DB migration: `scrap_types` table + `scrap_request_items` table + seed data
2. Admin ScrapTypesTab for managing rates
3. Update WasteManagement page: show rate card + multi-type selection
4. (Later with vendor workflow) Vendor enters actual weights per type

