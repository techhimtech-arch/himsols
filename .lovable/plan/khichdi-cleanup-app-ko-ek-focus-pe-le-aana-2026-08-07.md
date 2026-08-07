# Khichdi Cleanup — App ko ek focus pe le aana

Abhi app 60+ pages aur 12 alag programs try kar rahi hai (trees, marketplace, gift cards, wallet, referral, scrap, campaigns, quiz, learn hub, school, land partner, vendor, carbon dashboard). Data bata raha hai ki asli traction sirf ek jagah hai:

- Orders: 18 · Trees catalog: 59 · Contributions: 6 · Gift cards: 9
- Marketplace orders: 0 · Tree allocations: 0 · Survival updates: 0 · Activities: 0
- Campaigns: 2 · Plants (ornamental): 1 · Villages: 0 · Nurseries: 0 · School partnerships: 0 · CSR partners: 0 · Referrals: 0 · Learn videos: 0 · Lessons: 2

Yaani 40% features me ek bhi row nahi hai. Wo maintain karne me energy jaa rahi hai aur visitor confuse ho raha hai.

## Naya focus (ek line)

**Himsols = verified tree plantation partner for CSR + individuals in Himachal.** Baaki sab ya hide, ya baad ke liye.

## Kya rakhna hai (core)

- Home, About, Contact
- Plant/Contribute funnel: `/shop`, `/shop/:id`, `/climate-impact-pack`, `/single-tree-pack`, `/cart`
- CSR funnel: `/corporate`, `/csr-carbon-offset`, `/csr/guide-to-csr-plantation-india`, `/bulk-plantation`, `/schools`
- Trust/proof: `/impact`, `/gallery`, `/track-request`
- Account: `/auth`, `/profile`, `/order-history`, `/my-contributions`, forgot/reset password
- SEO pages jo free traffic laate hain: `/blog`, `/days`, `/plant-trees-in/:city`, `/trees/:slug`, `/plant-trees-for/:slug`, `/monsoon-plantation-himachal`
- Admin (jo tabs core ke hain)
- Learn: sirf 4 cinematic pages (`why-trees-matter`, `how-we-plant`, `himachal-jungles`, `forest-fires`, `sustainability-habits`) + hub

## Kya hide karna hai (Phase 1 — turant)

Ye sab **delete nahi, hide** — route rahega but koi link/menu/section nahi, aur sitemap + llms.txt se nikal dena. Jab chalane layak ho, ek line me wapas on.

| Feature | Kyun |
|---|---|
| Marketplace (`/marketplace`, product, checkout, cart sheet) | 0 orders, 3 products, alag COD flow maintain karna pad raha hai |
| Ornamental Plants (`/plants`) | 1 plant, purple theme brand se match nahi karta |
| Campaigns / fundraisers (`/campaigns`) | 2 campaigns, koi active fundraising nahi |
| Gift Cards (`/gift-cards`, redeem) | 9 cards, sales channel nahi, checkout complexity zyada |
| Wallet + Referral tabs (profile) | 0 referrals, wallet sirf gift-card ke liye tha |
| Green Quiz (`/green-quiz`) | lead capture chal nahi raha, distraction |
| Learn Lessons / Daily / Videos | 0 videos, 2 lessons, 0 completions — adhoora dikhta hai |
| Village Register, Partner-with-us, Vendor Dashboard, Carbon Dashboard | 0 rows sab me |
| Waste management / Scrap | pehle se hidden — hidden hi rahega |

Farmer Registration + Partner Dashboard **rakhna** (pilot cohort ke liye zaroori hai, 2 rows hain).

## Phase 2 — Home page ko simple karna

Aaj home pe 14 sections hain. 8 pe le aate hain:

```text
Hero (3D tree)  →  How it works  →  CSR strip  →  Impact numbers
→  Trust/proof (geo-tag + photos)  →  Impact Pack pricing  →  FAQ  →  Final CTA
```

Hataane wale sections: Where-tree-lives scene, How-we-verify tilt (Trust me merge), Partner farmer, School program strip (CSR strip me merge), Testimonials (sirf 3 hain), Learn hub strip.

## Phase 3 — Admin declutter

Admin me ~30 tabs hain. Hidden features ke tabs (Marketplace products/orders, Plants, Campaigns, Gift cards + content, Sellers, Scrap types, Villages, Nurseries, Lessons/Videos, External apps) ek "Archive" group me daal denge — dikhenge nahi, but delete bhi nahi honge.

## Technical notes

- Routes ko `App.tsx` se hataaya nahi jayega — sirf navigation se unlink honge, plus `<SEO noindex>` add hoga taaki Google inhe rank na kare.
- Nav aur footer DB-driven hain (`navigation_items`, `footer_links`) — un rows ko `is_active = false` karna hoga, code se nahi.
- `public/sitemap.xml`, `scripts/generate-sitemap.ts` aur `public/llms.txt` se hidden URLs nikalna.
- Cart context (`useCart` / `useMarketplaceCart`) mounted rahega — sirf navbar se CartSheet hatega, koi crash nahi.
- Koi table drop nahi, koi data delete nahi. Sab reversible.

## Result

~60 pages → ~25 focused pages. Ek hi message: "CSR ya individual, Himachal me verified tree plantation." Baaki sab tab wapas aayega jab uske peeche real operations honge.
