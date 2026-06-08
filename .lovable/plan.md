
## Goal
Create a polished, ready-to-email **CSR Plantation Proposal PDF** (Himsols branded, Forest Green #2e8b57) that you can attach when reaching out to companies for Monsoon 2026 plantation drives.

This is a **one-off downloadable artifact** — not a code change to the app.

## Deliverable
`Himsols-CSR-Monsoon-2026-Proposal.pdf` saved to `/mnt/documents/` — you download it and email it to CSR contacts.

## Proposal Structure (8–10 pages)

1. **Cover** — "Monsoon 2026 CSR Plantation Proposal", Himsols logo, contact details, date
2. **Why Monsoon 2026** — Why July–Sept is the optimal plantation window in Himachal (survival rate, soil moisture, native sapling readiness)
3. **About Himsols** — 1-page company intro, mission, Himachal farmer network, ESG alignment
4. **What You Get (CSR Deliverables)** —
   - Geo-tagged plantation photos with GPS proof
   - 1-year survival monitoring & updates
   - Plantation certificate (PDF)
   - CO₂ offset impact report (clearly labelled as estimate, 22kg/tree/yr)
   - CSR-1 / 80G documentation support
   - Optional employee engagement drive
5. **Plantation Packages & Pricing** — table with 4 tiers:
   - **Starter** — 500 trees, ~₹1.5L
   - **Growth** — 1,000 trees, ~₹3L
   - **Impact** — 5,000 trees, ~₹15L
   - **Village Adoption** — 10,000+ trees, custom quote
   Each row shows: trees, villages covered, employee event included Y/N, reporting cadence
6. **Our Process** — 5-step workflow: Inquiry → MoU → Plantation → Monitoring → Impact Report
7. **Why Himsols** — 250+ farmer network, transparent tracking, ESG-aligned, local community impact
8. **Compliance & Trust** — Schedule VII CSR alignment, documentation, audit-ready reports
9. **Call to Action** — "Reserve your Monsoon 2026 slot before June 30" + contact details (email, phone, WhatsApp from site_settings)
10. **Annexure** — sample certificate preview + sample impact report screenshot

## Design
- Forest Green (#2e8b57) primary, white/cream backgrounds, clean SaaS-style typography
- No NGO / charity aesthetic — corporate-credible
- Inline branded headers/footers on each page
- All CO₂ numbers explicitly labelled as "estimate"

## Technical Approach
- Python + ReportLab (Platypus) → generates the PDF in `/mnt/documents/`
- Pull contact details (email/phone/WhatsApp) from `site_settings` table so proposal stays in sync with live site
- Run visual QA: convert PDF → JPEGs → inspect each page for overflow/contrast/layout issues, fix, re-render
- Deliver as `<presentation-artifact>` so you can download directly

## Out of Scope
- School outreach proposal (you said you'll handle that yourself)
- Sending emails from the app — this is just the attachment PDF
- Any code changes to the Himsols web app

Ready to generate this PDF on approval.
