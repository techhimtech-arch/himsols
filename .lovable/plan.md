# Free Tree Planting + Voluntary Support

Focus shift: paise pehle maangna band. Koi bhi banda **free tree plantation request** bhej sake, hum farmer land / jungle me lagayein, aur plant hone ke baad **certificate download** kar sake. Payment optional — UPI QR "support the cause" ke roop me, Razorpay pe depend nahi.

## What changes for the user

1. **Homepage primary CTA = "Plant Trees Free"**
   - Hero aur mobile sticky button `/tree-plantation` pe jayenge (₹269/₹2,699 wale checkout CTA ki jagah).
   - Climate Impact Pack section homepage se hata denge; page `/climate-impact-pack` zinda rahega (CSR/direct link ke liye), homepage pe uski jagah ek chhoti line: "CSR ya bulk plantation? → proposal".

2. **Free request page (`/tree-plantation`) upgrade**
   - Form pehle se hai (name, phone, location, tree type, quantity) — usko "Free Tree Plantation Request" ke roop me clearly label karenge: koi payment nahi, koi price nahi.
   - Login abhi mandatory hai (tracking + certificate ke liye zaroori) — rakhenge, lekin hard redirect ki jagah friendly login prompt with `?redirect=/tree-plantation`.
   - Quantity ka realistic cap (max 25 free trees per request) + note: "Plantation monsoon window me hoti hai".
   - Sabse important line: "Aapke paas extra/abundant saplings hain? Humein de dijiye — hum farmer land aur jungle areas me lagate hain."

3. **Voluntary support (UPI QR)**
   - Request submit hone ke baad thank-you card: tracking ID + "Chaho to cause support karo" — UPI QR + UPI ID + Copy button.
   - QR client-side generate hoga UPI ID se (koi image upload nahi). UPI ID admin panel se editable hogi (`site_settings` key `upi_id`, `upi_payee_name`) — pehle aap UPI ID bata do ya seed value me daal dunga.
   - Bilkul clear: **support optional hai, tree free hi lagega**.
   - Same card `/track-request` pe bhi (soft, ek line).

4. **Certificate for free plantations**
   - Certificate abhi sirf paid `orders` ke liye banta hai. Isko `tree_plantation_requests` ke liye bhi enable karenge.
   - Request `completed` hone par `/track-request` aur `/my-contributions` pe "Download Certificate" button aayega.
   - Certificate me: naam, tracking ID, tree type, quantity, location, plantation date. Koi paid amount nahi. CO₂ line "estimate" label ke saath (22kg/tree/yr).

## Technical notes

- `supabase/functions/generate-certificate/index.ts` me `requestId` support add karenge (existing `orderId` path untouched): request fetch, owner-or-admin check, status must be `completed`, wahi PDF layout amount field ke bina.
- Frontend: `TreePlantation.tsx` (copy + thank-you state + support card), naya `src/components/UpiSupportCard.tsx` (QR generate — `qrcode` npm package), `TrackRequest.tsx` + `MyContributions.tsx` me certificate download (blob validation existing pattern jaisa).
- Homepage: `Index.tsx` se `ClimateImpactPackSection` hataana, `HeroSection.tsx` + `MobileStickyCTA.tsx` ke CTA `/tree-plantation`.
- `site_settings` me `upi_id` / `upi_payee_name` rows + admin SettingsTab field. Koi schema change nahi (site_settings pehle se key/value hai).
- SEO: `/tree-plantation` title/description "Free tree plantation request Himachal Pradesh" ke around, sitemap me already hai.

## Out of scope

- Razorpay ko theek karna (abhi bypass — voluntary UPI hi).
- Nayi community/forum feature (baad me).
