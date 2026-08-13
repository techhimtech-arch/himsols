# Himsols positioning — ek hi identity, 4 doors

## Sach sach: khichdi kyun lag rahi hai

Problem features ki nahi hai, problem **ek hi jagah 4 alag business models** dikhne ki hai:

| Aap jo karte ho | Business model | Paisa kahan se |
|---|---|---|
| Kisi ko plants chahiye → bhej dete ho | product/supply | thoda margin |
| Koi bolta hai "mere naam se laga do" | sponsorship | per-tree |
| Farmer bolta hai "mujhe trees dilwa do" | service to farmer | **kuch nahi** |
| CSR company plantation karwaye | B2B contract | **asli paisa** |
| Gift card | retail gifting | chhota |
| Marketplace saamaan | e-commerce | almost zero |

Visitor 10 second me decide karta hai "ye kya hai?" — abhi answer nahi milta, isliye na CSR trust karta hai na individual pay karta hai.

## Business ya NGO — seedha jawab

**Dono me se ek chuno nahi — "for-profit plantation partner" bano jo farmer ko free service deta hai.**

- NGO ban gaye to: 12A/80G registration, audit, board, donation compliance — aur donation-based income India me chhote players ke liye sabse mushkil raasta hai. Aur "NGO" sunke CSR company aapse **paisa maangne wala** samajhti hai, partner nahi.
- Business (for-profit) raho to: CSR aapko **vendor/implementation partner** samajhti hai. CSR budget vendor ko pay karne me kisi 80G ki zaroorat nahi (Section 135 spend implementing agency ke through hota hai — aur wahan bhi registered entity chahiye, par aap uske liye NGO partner tie-up kar sakte ho).

Recommended one-liner:

> **Himsols — Himachal ka plantation implementation partner. Companies, schools aur individuals ke liye trees lagate hain; farmer ke liye ye service free hai.**

Farmer aur free-tree wale log = **supply side + proof**, revenue side nahi. Unko monetize karne ki koshish hi confusion bana rahi hai.

## Ek business, 4 clearly labelled doors

Site pe har cheez in 4 me se ek door ke andar jaaye — bahar sirf ye 4 dikhein:

```text
                    HIMSOLS (plantation partner)
   ┌───────────────┬───────────────┬──────────────┬──────────────┐
   │ 1. COMPANIES  │ 2. SCHOOLS    │ 3. INDIVIDUAL│ 4. FARMERS   │
   │    (CSR)      │               │   / GIFT     │  (free)      │
   │ PAISA ★★★     │ PAISA ★★      │ PAISA ★      │ PAISA — none │
   │ proposal +    │ campaign +    │ free request │ registration │
   │ invoice       │ certificates  │ + optional   │ + land       │
   │               │               │ pay + gift   │ + payout     │
   └───────────────┴───────────────┴──────────────┴──────────────┘
                    ek hi plantation + proof engine
```

Har door ke liye ek hi primary page, ek hi CTA. Homepage sirf ye 4 doors dikhaye + proof.

## Kya rakhna, kya band karna

**Rakho (ye chaar door hain):**
- CSR: `/corporate`, `/csr-carbon-offset`, `/bulk-plantation`, CSR guide + proposal PDF
- Schools: `/schools`
- Individual: `/tree-plantation` (free request), `/climate-impact-pack` + `/single-tree-pack` (jo pay karna chahe), `/gift-cards` **CSR/individual gifting ke roop me hi** — apna alag program nahi
- Farmers: `/partner-with-us` / farmer registration + partner dashboard
- Proof: `/impact`, `/gallery`, `/track-request`, blog + SEO pages
- Account + Admin

**Band karo (already mostly hidden — permanent band):**
- Marketplace, ornamental plants, campaigns/fundraisers, wallet, referral, quiz, learn lessons/videos, scrap
- Wajah: ye alag business hain, alag operations maangte hain, aur "hum kya karte hain" ka answer todte hain. Zero traction bhi hai.

**Gift card ka naya role:** apna hero program nahi — CSR/individual checkout ka ek option ("kisi ko gift karo"). Nav se hata, corporate + individual page ke andar rakho.

## Revenue reality (sirf 3 lines)

1. **CSR contracts** — 1 deal = poora saal ka kharcha. 90% energy yahan.
2. **Paid packs (₹299 / ₹2,999)** — individual door me impulse revenue; free request ke thank-you page pe soft upsell.
3. **Free requests + farmers** — revenue nahi, **proof aur SEO** hain. Isse hi CSR pitch me photos aur numbers aate hain.

Free tree model band nahi karna — usko lead engine ke roop me treat karo, product ke roop me nahi.

## Kya karna hoga site pe (implementation)

1. **Homepage restructure** — hero ke turant baad ek "4 doors" grid section (Companies / Schools / Individuals / Farmers) jisme har card ka apna CTA. Hero ka primary CTA free plantation hi rahe, secondary "For companies".
2. **Positioning copy** — hero subheading, About, footer tagline sab me ek hi line: plantation implementation partner + "farmers ke liye free". Koi NGO/charity language nahi, koi "donate" nahi.
3. **Navbar simplify** — Home · For Companies · Schools · Plant a Tree · For Farmers · Impact · Blog. Gift cards nav se hatakar Companies + Plant-a-Tree page ke andar.
4. **Free request thank-you page** — tracking ID + optional UPI ke saath ek soft line: "Company ho? CSR proposal dekho" + paid pack option.
5. **Sitemap/llms.txt/SEO** — sirf 4 doors + proof pages; band features permanently out.
6. **DB-driven nav/footer** rows (`navigation_items`, `footer_links`) ko is structure ke hisaab se on/off karna — code se nahi.

Koi table drop nahi, koi data delete nahi. Sab reversible.

## Nateeja

Ek line jo aap kahin bhi bol sakte ho: **"Hum Himachal me trees lagate hain — companies aur schools ke liye paid, farmers ke liye free, aur har tree ka proof dete hain."** Baaki sab ya iske andar fit ho jaata hai, ya band.
