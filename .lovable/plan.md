
# Real talk pehle

Bhai, honest baat — abhi tak jo bana hai woh **80% enough hai**. Product problem nahi hai. Aapke apne data se:

- **Signup: 0**
- **Consumer orders: 0**
- **Sirf CSR waale phone karke aaye** (2 calls website dekh ke)

Iska matlab clear hai:
1. **B2C (₹269 tree) abhi kaam nahi karega** — koi ajnabi Himachal ke chhote brand se ₹269 online nahi dega. Zero trust, zero traffic.
2. **B2B / CSR working hai** — 2 calls bina kisi marketing ke aaye. Yahi asli darwaza hai.
3. **Traffic zero hai** — matlab aur features banane ka koi fayda nahi. Jo hai woh bhi koi dekh nahi raha.

Toh plan feature-building nahi hai. Plan hai: **CSR pipeline tight karna + traffic laana**. Bas.

---

# Kya karenge (4 hafte, sirf yehi)

## Week 1 — CSR ko primary bana do

Site abhi tree-selling jaisi dikhti hai. Real customer CSR hai. Toh site ko CSR-first kar do:

1. **Homepage hero rewrite** — headline: "Verified plantation partner for CSR & ESG teams in Himachal." Sub: "Geo-tagged, survival-tracked, report-ready." Primary CTA: **"Get CSR Proposal"** (not "Plant a Tree").
2. **Second CTA rakho** "Plant a single tree ₹269" — but chhota, secondary.
3. **CSR landing page (`/csr`) upgrade** — case study section (jo 2 calls aaye unke saath baat karo, ek ka logo/quote lo free plantation ke badle), downloadable 1-page PDF pitch (already hai — homepage se link karo prominently).
4. **Trust block** — "Registered entity, GST, based in HP, farmer network of 250+" — hero ke neeche.

Ye pure frontend + copy hai. 2 din ka kaam.

## Week 2 — Ek proper CSR magnet banao

Ek cheez jo CSR/ESG manager Google karta hai:
- **"CSR tree plantation vendor India"**
- **"Section 135 CSR compliant plantation"**
- **"carbon offset India small company"**

Iske liye ek **long-form guide page** banao: `/csr/guide-to-csr-plantation-india` — 2000+ words, real information (Section 135, ESG reporting, kaise vendor choose karein, cost per tree benchmarks). Ismein lead form embedded. Ye ek page 6 mahine mein 5-10 warm leads la sakta hai. Aur features se zyada.

## Week 3 — LinkedIn outreach system

Website pe traffic zero hai — matlab SEO 3-6 mahine lagega. Fast channel = **LinkedIn direct outreach**. Iske liye site pe zaroorat hai:

1. **Founder page / About** — aapka face, story, credentials. CSR waale insaan dekhte hain, company nahi.
2. **"Book a 15-min call" widget** — Cal.com / Google Calendar embed on `/csr`.
3. **Sample impact report PDF** — ek fake but realistic report banao (10 pages, geo-tagged photos, survival data). Ye lead magnet hai — email do, PDF milega.

Fir aap khud roz 20 sustainability heads ko LinkedIn pe message karo. Website unka trust check karne ke liye hai, sales website nahi karegi.

## Week 4 — Content flywheel (ek hi cheez)

Consumer traffic ke liye **sirf ek** channel pakdo, sab nahi. Recommendation: **Instagram Reels + WhatsApp broadcast**.

- Site pe already Learn Hub hai — usko feed karne ke liye admin ko chahiye ek "share this reel" button har tip/lesson pe.
- Add ek **"WhatsApp updates ke liye join karo"** bar (free — number collect karo, khud broadcast karo har hafte). Ye email newsletter se 10x better hai Indian audience ke liye.

Bas. Baaki sab band.

---

# Kya NAHI karenge

- ❌ Nayi feature (koi encyclopedia expansion, koi videos section, koi gamification — abhi nahi)
- ❌ Homepage redesign
- ❌ Marketplace / gift cards / referrals pe koi kaam (ye tab kaam karenge jab traffic aayega)
- ❌ Mobile app, PWA improvements, animations

Traffic + CSR leads aane ke baad hi in cheezon ka matlab hai.

---

# Sirf ek metric next 90 days

**Har hafte 2 CSR conversations** (email/call/LinkedIn se). Bas.
- Agar ye hit hua → 90 days mein 1-2 deals close hongi (₹1-5L each) → real trees zameen pe.
- Agar ye miss hua → site pe kuch bhi karlo, kuch nahi hoga.

Sab kuch is metric ke around banega.

---

# Technical scope (Week 1 se start)

Sirf frontend + copy work. Backend/DB kuch nahi.

```text
Files to edit:
- src/components/home/HeroSection.tsx        (CSR-first headline, CTA swap)
- src/pages/CSRCarbonOffset.tsx              (case study + PDF pitch prominent)
- src/components/home/CSRSection.tsx         (move higher on homepage)
- src/pages/Index.tsx                        (section reorder: CSR above impact pack)

Files to create (Week 2):
- src/pages/CSRGuide.tsx                     (long-form SEO magnet)
- src/pages/BookCall.tsx                     (Cal.com embed OR simple form)

No DB migrations. No edge functions. No new tables.
```

---

# Confirm karo

Ye plan seedha bolta hai: **feature banana band karo, distribution + CSR pe focus karo**. Agar sahi lagta hai bolo "haan Week 1 chalu karo" — main homepage aur CSR page rewrite se shuru karunga.

Agar aap chahte ho ki B2C (₹269 tree) hi push karein instead — bata do, but honestly usmein 6 mahine lagenge aur paid ads chahiye honge.
