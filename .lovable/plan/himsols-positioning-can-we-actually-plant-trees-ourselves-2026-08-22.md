# Himsols positioning — "Can we actually plant trees ourselves?"

## Seedha jawab

Haan. Lekin positioning mein yeh nahi bolna chahiye ki "hum personally har tree lagate hain." Sahee tarika yeh hai:

> **Himsols is Himachal's plantation implementation partner.** We coordinate native tree plantation on verified farmer land and forest patches, then deliver geo-tagged photos, survival tracking and certificates to the requester.

Matlab:
- **Aap implementation partner ho** — request collect karte ho, land/farmer verify karte ho, sapling supply + plantation event coordinate karte ho, proof collect karte ho.
- **Farmer/labor physically plant karte hain**, aap pay/support karte ho.
- **CSR/School/Individual** se request aati hai, aap delivery ensure karte ho.

## Kyun yeh positioning kaam karegi

| Audience | Unka sawaal | Aapka jawab |
|---|---|---|
| CSR company | "Tum NGO ho ya vendor?" | "Vendor/implementation partner. Aapka CSR budget direct implementation mein jaata hai, no 80G confusion." |
| School | "Bacche kya karenge?" | "We run a structured drive: saplings, site, photos, certificates, report." |
| Individual | "Mere paise se sach mein tree lagega?" | "Tracking ID + geo-tagged photo + certificate." |
| Farmer | "Mujhe kya milega?" | "Free saplings + plantation support + survival payout." |

## Do operational models — choose one

```text
Model A: Direct Implementation          Model B: Partner-Led
─────────────────────────────           ─────────────────────
Aapka team physically plant kare         Verified farmer/labor plant kare
Full control, high effort              Scalable, lower per-tree effort
Best for: pilot events, CSR demos      Best for: bulk monsoon plantation
```

**Recommended: Hybrid**
- Pilot / CSR demo drives: aapka team directly execute kare (photos, control, trust build).
- Monsoon bulk plantation: verified farmers/partners ke through scale kare.
- Har case mein proof aap collect karo.

## Abhi kya sach hai, usko accept karo

Agar aaj 0 verified farmers hain, toh public site par "250+ farmers" ya "verified network" mat dikhao. Honest version:

> "Pilot cohort · Monsoon 2026. We are onboarding verified farmers and land patches across Himachal. Be a founding partner."

Yeh CSR ke liye attractive hai — "founding partner" banna chahte hain companies.

## Kya band karna hai positioning mein

- "Free" ka loud promise hatao. Individual request page par "support optional" theek hai.
- Marketplace, scrap, wallet, gift cards ko hero program mat banao.
- "Donation" language poori tarah band.
- "250+ farmers" jaisa unverified number band.

## Concrete next steps (2-4 hafte)

1. **Farmer onboarding flow theek karo**
   - `/farmer-registration` already hai. Admin mein `FarmerRegistrationsTab` se review karo.
   - Har approved farmer ko ek land patch record do (`land_partner_applications` / `farmer_registrations` table).

2. **Pilot cohort declare karo**
   - Homepage / CSR pages par "Pilot cohort · Monsoon 2026" line fixed karo.
   - Target: 25-50 farmers/land patches across 3-5 Himachal districts.

3. **Proof pipeline chalu karo**
   - Admin `AllocationsTab` mein order → farmer assign karo.
   - Planting ke baad geo-tagged photo upload karo (`tree_photos` bucket).
   - Survival update har 3-6 mahine mein (`survival_updates` table).

4. **Sales collateral banao**
   - CSR proposal PDF (already `Himsols-CSR-Pitch-Deck.pdf` hai — update karo).
   - School program one-pager.
   - Email template for CSR/school outreach.

5. **Public trust page**
   - `/impact` aur `/gallery` ko real data se bharo.
   - Agar abhi photos nahi hain, toh "Monsoon 2026 planting season" ka preview dikhao.

6. **Homepage final polish**
   - 4 doors section already sahi hai.
   - Bas CSR door ko zyada prominent karo (primary CTA).

## Success metric

30 din mein:
- 5+ serious CSR/school inquiries
- 25+ farmer registrations
- 1+ paid pilot plantation drive booked

## Files to touch

- `src/lib/positioning.ts` — already centralised; no change unless line refine karni ho.
- `src/pages/CSRGuide.tsx`, `src/pages/CSRCarbonOffset.tsx`, `src/pages/B2BCorporate.tsx` — "Pilot cohort" messaging.
- `src/components/home/FourDoorsSection.tsx` — CSR door primary CTA.
- `src/pages/TreePlantation.tsx` — already view-first + optional support; keep as-is.
- Admin: `FarmerRegistrationsTab.tsx`, `AllocationsTab.tsx`, `TreesTab.tsx` — operational proof pipeline.
- `public/Himsols-CSR-Pitch-Deck.pdf` — update for Monsoon 2026.

## Nateeja

Aapko ek hi line bolni hai har jagah:

> **"Himsols Himachal mein native trees lagata hai — CSR/school/individual ki request collect karke, verified farmer/partner ke zameen par plant karke, aur har tree ka geo-tagged proof dekar."**

Baaki sab isi line ke andar fit hota hai.
