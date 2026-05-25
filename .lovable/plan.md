
## Goal

Aap chahte ho: koi Panchayat ya CSR wale 500–800+ trees ek saath lagwa lein, subsidised bulk rate par, transport ki gaadi ka alag charge. Himsols ke through ye possible hai — already `ClimateImpactPack` (10 trees ₹2,999) aur `SingleTreePack` (1 tree ₹299) ka pattern hai. Bulk version usi ka bada bhai banega, lekin checkout instant nahi — **inquiry → quote → manual confirm → payment link** flow rahega, kyunki har bulk order mein site visit, species choice, gaadi distance, aur farmer/land allocation alag hota hai.

## What we'll build

### 1. Public page — `/bulk-plantation` (Panchayat & CSR Bulk Pack)

A dedicated landing + inquiry page. Sections:

- **Hero**: "Plant 100–10,000 Trees in Your Village / Campus" + 1 line for Panchayat, Schools, RWA, CSR.
- **Tiered pricing table** (subsidised, indicative — final per quote):
  - 100–249 trees → ₹249/tree
  - 250–499 trees → ₹229/tree
  - 500–999 trees → ₹199/tree
  - 1000+ trees → ₹179/tree (custom quote)
- **Transport line item** shown separately: "Transport charged separately based on distance from nearest Himsols nursery (₹/km, quoted after site location confirmed)." No hidden cost.
- **What's included**: native species selection, delivery to site, planting guidance, geo-tagged photos, 6-month survival report, certificate. (Same trust block as ClimateImpactPack, scaled up.)
- **Who buys**: Panchayats, Schools/Colleges, CSR teams, Housing societies, Temples/Trusts.
- **Inquiry form** (the main CTA — no instant checkout):
  - Organization name + type (Panchayat / CSR / School / NGO / Other)
  - Contact person, phone, email
  - State, district, village/area, pin code
  - Approx. tree quantity (number input, min 100)
  - Preferred plantation month
  - Land type (Panchayat land / school campus / private / other)
  - Notes (species preference, occasion, etc.)
  - Consent checkbox
- On submit: insert into a new `bulk_plantation_inquiries` table → toast "Humari team 24 ghante mein quote ke saath contact karegi" → WhatsApp prefilled message option to admin number.

### 2. Admin tab — "Bulk Plantation" (in existing Admin panel)

New tab `BulkPlantationInquiriesTab.tsx` (pattern: copy from `SchoolPartnershipsTab`):

- Table: org name, type, location, quantity, status, date.
- Status pipeline: `new` → `quoted` → `confirmed` → `paid` → `in_progress` → `completed` → `cancelled`.
- Row actions:
  - View details dialog.
  - Edit quote: admin types per-tree price, transport charge, total → status becomes `quoted`.
  - "Send WhatsApp" — prefilled message with quote summary + payment instructions.
  - "Mark Paid" — admin records payment_mode (Razorpay link / bank transfer / cheque) + reference id.
  - Update status.
  - Admin notes field.

No public checkout for bulk. Payment handled offline / via Razorpay payment link admin shares manually. This matches your existing `csr_partners` + `school_partnerships` workflow exactly — no new payment edge function needed.

### 3. Homepage discovery

- Add one card in `ActionableServicesSection.tsx` is too crowded — instead, extend the existing **PartnerFarmerSection** or **CSRSection** area with a small "Bulk Plantation for Panchayat / CSR" tile linking to `/bulk-plantation`.
- Add `/bulk-plantation` link in footer under "Services".

### 4. Database (migration)

New table `bulk_plantation_inquiries`:

- org_name, org_type, contact_person, phone, email
- state, district, village, pin_code
- tree_quantity (int), preferred_month, land_type
- notes, consent
- status (default `new`)
- **quote fields** (admin-filled): quoted_price_per_tree, quoted_transport_charge, quoted_total, quote_sent_at
- **payment fields** (admin-filled): payment_mode, payment_reference, paid_at
- admin_notes, reviewed_by, reviewed_at, created_at, updated_at

RLS:
- Anyone (incl. anon) can INSERT (public form, like `csr_partners` / `school_partnerships`).
- Only admins can SELECT / UPDATE / DELETE.

## What we deliberately skip (out of scope for now)

- **No instant online bulk checkout** — bulk needs a human quote (transport, species, land verification). Trying to auto-price it will mislead buyers.
- No changes to existing `ClimateImpactPack` (₹2,999 / 10 trees) or `SingleTreePack` (₹299 / 1 tree) — those stay as retail.
- No new Razorpay edge function — admin shares a Razorpay payment link manually after quote acceptance (same as how CSR partners are handled today).
- No transport calculator / distance API — admin types transport charge manually per inquiry (can be automated later once we have nursery lat/long).
- No PDF quote generator in v1 — admin sends quote via WhatsApp text. (Can reuse `schoolOutreachPdf.ts` pattern later.)

## Files to touch

```text
NEW   src/pages/BulkPlantation.tsx              -- public landing + inquiry form
NEW   src/components/admin/BulkPlantationInquiriesTab.tsx
EDIT  src/App.tsx                               -- add /bulk-plantation route
EDIT  src/pages/Admin.tsx                       -- add new tab
EDIT  src/components/home/CSRSection.tsx (or PartnerFarmerSection) -- add discovery tile
EDIT  public/sitemap.xml                        -- add new route
MIG   bulk_plantation_inquiries table + RLS
```

## Open question before I build

Confirm karo:

1. **Tiered prices** maine indicative rakhe hain (₹249 / ₹229 / ₹199 / ₹179). Kya ye theek hain, ya aap apne actual subsidised numbers dena chahoge? (Ye sirf public page par display ke liye — actual quote admin manually deta hai.)
2. **Minimum quantity** — main 100 trees soch raha hoon. Aap chahte ho 500 minimum rakhein (taaki sirf serious Panchayat/CSR inquiries aayein)?
