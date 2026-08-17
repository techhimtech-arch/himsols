# Ab kya karna hai — Monsoon 2026 se pehle

Positioning, navbar, footer, 4 doors, SEO files — sab ho chuka hai. Ab jo bacha hai wo do cheezon par focus karta hai: **CSR enquiry aana** aur **proof dikhna**. Baaki sab uske baad.

## 1. CSR enquiry engine (sabse pehle — yahan se paisa aata hai)

- `/corporate` page ko ek hi kaam karne wala banao: form bhare → turant proposal PDF email/download mile. Abhi form submit hone ke baad kuch strong nahi hota.
- **CO₂ / budget calculator**: company apna budget ya trees daale → estimated CO₂ (estimate label ke saath), cost, timeline dikhe. Yahi sabse zyada CSR leads laata hai.
- Enquiry aate hi admin ko email + WhatsApp-ready message, aur user ko auto-reply with pitch deck link.
- Admin me ek saaf **CSR Leads** view: naya / contacted / proposal bheja / won-lost, ek note field. Abhi enquiries bikhri hui hain.

## 2. Proof pipeline (CSR isi par haan bolti hai)

- Plantation batch ka public page: `/batch/:code` — photos, location (approx), species, date, survival updates. Yehi link CSR report me jaata hai.
- Admin me ek simple flow: batch banao → photos upload → status update → auto public page live.
- Homepage/Gallery ye batches pull kare, hardcoded numbers hataake.
- Pilot cohort counter honest rahe: "X farmers registered, Y batches planted" — jo actually DB me hai wahi.

## 3. Request → user ko wapas laana (engagement)

- Request submit hone ke baad **email/WhatsApp updates**: "request received", "planted", "certificate ready". Abhi user ko dobara aane ki koi wajah nahi.
- `/my-contributions` ko "My Forest" jaisa banao: trees, batch photos, certificate, CO₂ estimate — ek jagah.
- Tracking page par share button (WhatsApp) — free organic reach.

## 4. Schools door

- `/schools` par ek downloadable outreach letter/PDF (principal ko forward karne layak) + simple enquiry form, wahi lead flow jaisa CSR.

## 5. Farmers door

- `/farmer-registration` ko 3-step chhota form (land photo optional) — abhi lamba lagta hai.
- Partner dashboard me ek hi cheez saaf: mere trees, survival update daalo, payout status.

## 6. SEO / content lane (background me chalti rahe)

- Blog me hafte me 1 post: monsoon plantation, native species, CSR compliance — jo pages already bane hain unko internal links do.
- City pages (`/plant-trees-in/:city`) me local proof (batch photos) inject karo — tabhi rank karenge.
- Search Console: sitemap submit + coverage check ek baar.

## Suggested order

1. CSR calculator + proposal auto-delivery + CSR Leads admin (item 1)
2. Batch public proof pages (item 2)
3. Request status emails + My Forest (item 3)
4. Schools PDF + farmer form simplify (4, 5)
5. Content/SEO ongoing (6)

## Technical notes

- Naye tables sirf zaroorat par: `plantation_batches` (public read), `batch_photos`; leads existing `corporate_inquiries` / `bulk_plantation_inquiries` me status + notes column add karke chalega. Har new public table par RLS + GRANT.
- Emails Resend edge function se (jaise password reset already hai). WhatsApp abhi manual link-based (API baad me).
- Koi feature delete nahi, koi paid gating nahi — trees/certificate free hi rahenge.
