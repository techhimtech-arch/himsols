
# Verified Plantation Pipeline — from claim to reality

## Current honest state (verified from DB)

| Piece | Schema | Real data | Working UI |
|---|---|---|---|
| Order intake (`orders`, `tree_plantation_requests`) | ✅ | 59 orders, live | ✅ Checkout works |
| Farmer roster (`farmer_registrations`) | ✅ | Only 2 rows | Registration form exists |
| **Assign trees to farmer** (`tree_allocations`) | ✅ 21 cols ready | **0 rows** | ❌ No admin UI ever used |
| **Geo-tag + photo per batch** (`plantation_photos` w/ lat/lng) | ✅ | 3 rows manual | ❌ No farmer/admin upload flow |
| **Survival audit m3/m6/m12** (`survival_updates`) | ✅ | **0 rows** | ❌ No form, no reminder |
| **CSR report PDF (Section 135)** | — | — | ❌ Doesn't exist (only donation certificates exist) |

**Reality:** Jab CSR ya user tree kharidta hai, admin manually WhatsApp pe farmer ko bolta hai. Kaha laga, photo, survival — **kuch record nahi**. Homepage cards abhi aspirational hain.

## What we'll build (4 pieces, in order)

### 1. Admin: Allocate trees to farmer (fills `tree_allocations`)

New page `/admin/allocations`:
- List of paid orders + tree_plantation_requests with status = PAID and no allocation yet
- "Allocate" button → pick farmer from `farmer_registrations` (verified only) → enter tree_count, species, plantation_date, incentive_per_tree
- Creates row in `tree_allocations` linked to `order_id`; auto-generates `batch_id` (trigger already exists) and `review_date = plantation_date + 6 months`
- Order status → "ALLOCATED"

### 2. Farmer/field: Geo-tagged photo upload (fills `plantation_photos`)

New mobile-first page `/partner/upload/:allocation_id`:
- Land partner logs in (role already exists)
- Sees pending allocations
- Upload photo → **browser `navigator.geolocation` captures lat/lng automatically** + `Date.now()`
- Uploads to `tree-photos` bucket, inserts into `plantation_photos` with lat/lng/caption
- Admin can also upload on behalf (fallback)
- Order status → "PLANTED" once ≥1 photo exists

### 3. Survival audit form (fills `survival_updates`)

New page `/admin/survival-audit`:
- Lists allocations where `review_date` is due (month 3, 6, 12 from `plantation_date`)
- Team member submits: photo, health_status (healthy/stressed/dead), height_cm, trees_alive/trees_dead counts
- Updates `tree_allocations.trees_alive/trees_dead`
- Simple weekly email digest to admin listing due audits (edge function + cron via `pg_cron` or manual for now — cron adds later)

### 4. CSR "proof pack" PDF generator (real Section 135 report)

New edge function `generate-csr-report`:
- Input: `order_id` or `csr_partner_id` or date range
- Pulls from DB: trees planted (from allocations), farmers involved, GPS coordinates, photos with dates, survival data if any, ₹ amount, CO₂ estimate (labeled)
- Renders PDF (Deno + pdf-lib or existing `Himsols-CSR-Proposal.pdf` style) with:
  - Cover page: CSR partner name, order refs, plantation window
  - Page 2: Summary — trees, districts, farmers, ₹ contribution
  - Page 3+: **Per-batch geo-tagged photo grid** (photo + GPS + date)
  - Page 4: Survival snapshot (if audit done) or "next audit due" schedule
  - Page 5: Section 135 compliance note, Himsols registration details, signatures
- Download button on `/admin/orders/:id` and later on public CSR dashboard

## What stays the same

- Homepage "How we verify" cards — copy stays but each card links to a **real proof page** once section 1-2 have data
- Pilot cohort positioning stays (only 2 farmers → build UI first, then onboard 48 more)
- Zero changes to checkout, payment, wallet, or user-facing tree flows

## Order of build (small commits so you can review each)

1. **Admin allocations UI** (~1.5 hrs) — biggest unlock; fills empty `tree_allocations`
2. **Partner geo-photo upload** (~2 hrs) — this is the actual "geo-tagging" the homepage claims
3. **CSR PDF generator** (~2 hrs) — the deliverable CSR heads will actually ask for
4. **Survival audit form** (~1 hr) — can be simple admin form now, cron reminders later

Total ~6-7 hrs across 4 build steps. Har step ke baad tu preview me test kar sakta hai.

## Not in this plan (call out honestly)

- Automated month 3/6/12 reminders (needs `pg_cron` — add after step 4 works)
- Public per-tree tracking page for buyers (nice-to-have, after CSR pipeline works)
- Blockchain / third-party verification (out of scope; we do first-party evidence)

---

**Recommendation:** Step 1 pehle karte hain — bina allocations ke baaki sab empty rahenge. Approve karo to build mode me step 1 shuru karta hoon.
