// Use-case landing pages for occasion / intent-based SEO.
// Powers /plant-trees-for/:slug pages.

export interface UseCase {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  subhead: string;
  why: string;
  howItWorks: { step: string; detail: string }[];
  giftIdeas: string[];
  primaryCtaLabel: string;
  primaryCtaPath: string;
  faqs: { q: string; a: string }[];
  keywords: string;
}

export const USE_CASES: UseCase[] = [
  {
    slug: "birthday",
    title: "Plant Trees for a Birthday",
    metaTitle: "Plant Trees for Birthday Gift India — From ₹299 | Himsols",
    metaDescription:
      "Gift verified trees on someone's birthday. Geo-tagged certificate, 3-year survival tracking, instant digital delivery. From ₹299.",
    heroHeadline: "A Birthday Gift That Lives for 30 Years",
    subhead:
      "Skip the cake-and-card routine. Gift a verified, geo-tagged tree planted in Himachal Pradesh — they'll watch it grow for decades.",
    why: "Birthdays are one of the most common occasions for sustainable gifting in India. A Himsols tree gift arrives as a beautifully designed certificate within minutes, while the actual tree is planted on verified farmer land within 30 days and tracked for 3 years.",
    howItWorks: [
      { step: "Choose a pack", detail: "Single Tree (₹299) for a friend, Climate Impact Pack (10 trees, ₹2,999) for a milestone birthday." },
      { step: "Personalise the certificate", detail: "Add the recipient's name and a custom message. Delivered instantly by WhatsApp and email." },
      { step: "Plantation & proof", detail: "Within 30 days we plant on verified farmer land in Himachal — you receive geo-tagged photos and GPS coordinates." },
    ],
    giftIdeas: [
      "Single tree (₹299) — for a close friend's birthday",
      "10-tree Climate Impact Pack (₹2,999) — for a 30th, 40th or 50th birthday milestone",
      "Custom-quantity gift card — let the birthday person choose",
    ],
    primaryCtaLabel: "Gift a Tree — ₹299",
    primaryCtaPath: "/single-tree-pack",
    faqs: [
      { q: "How fast does the recipient get the gift?", a: "The personalised certificate is delivered in under 5 minutes via WhatsApp and email. The physical tree is planted within 30 days." },
      { q: "Can I gift trees anonymously?", a: "Yes — you can leave the certificate sender-blank or use a pen name." },
    ],
    keywords: "plant trees birthday gift India, eco birthday gift, sustainable birthday gift, tree gift certificate",
  },
  {
    slug: "wedding",
    title: "Plant Trees for a Wedding",
    metaTitle: "Wedding Return Gift — Plant Trees in Guests' Names | Himsols",
    metaDescription:
      "Replace plastic return gifts with verified trees planted in each guest's name. Bulk pricing, custom certificates, 3-year tracking.",
    heroHeadline: "The Wedding Return Gift Your Guests Will Remember",
    subhead:
      "One tree per guest, planted in their name on verified Himachali farmer land — with custom-branded certificates delivered on the wedding day.",
    why: "Indian weddings generate enormous amounts of single-use plastic in return gifts that get discarded within days. Himsols replaces that with personalised, verified tree plantation — each guest gets a certificate with their name and the couple's wedding date.",
    howItWorks: [
      { step: "Tell us the guest count", detail: "Get bulk pricing for 50, 100, 500 or 1000+ guests." },
      { step: "Custom-branded certificates", detail: "We design certificates with the couple's names, photo and wedding date." },
      { step: "Delivery + plantation", detail: "Guests receive their personalised certificate digitally; trees planted within 30 days with GPS proof." },
    ],
    giftIdeas: [
      "50–100 guests — Single tree per guest, bulk discount",
      "200–500 guests — Mixed-species plantation with co-branded certificates",
      "Destination weddings — Plantation in the same Himachal region as the wedding",
    ],
    primaryCtaLabel: "Get Bulk Wedding Quote",
    primaryCtaPath: "/bulk-plantation",
    faqs: [
      { q: "What's the minimum order for wedding gifting?", a: "We accept any quantity from 10 trees upwards; meaningful discounts kick in from 50+." },
      { q: "Can certificates carry our wedding date and photo?", a: "Yes — every wedding bulk order is custom-branded with the couple's names, date and optional photo." },
    ],
    keywords: "wedding return gift India, eco wedding favor, plant trees wedding guests, sustainable wedding gift",
  },
  {
    slug: "in-memory",
    title: "Plant Trees in Memory of a Loved One",
    metaTitle: "Plant Trees in Memory of a Loved One in India | Himsols",
    metaDescription:
      "Honour a loved one with a living memorial — verified trees planted in their name on Himachal farmer land. Geo-tagged, lifetime-tracked.",
    heroHeadline: "A Living Memorial That Grows for Decades",
    subhead:
      "Plant verified trees in memory of someone you've lost — geo-tagged, tracked, and visible to family across India.",
    why: "Many families want a lasting, meaningful way to honour someone who has passed. A Himsols memorial tree lives for decades, comes with GPS coordinates the family can visit, and contributes real climate impact in the deceased's name.",
    howItWorks: [
      { step: "Choose your tribute", detail: "1 tree, 10 trees, or a custom grove in their name." },
      { step: "Memorial certificate", detail: "Personalised certificate with the loved one's name, dates and a custom dedication message." },
      { step: "Geo-tagged proof", detail: "Within 30 days, receive GPS coordinates and photos of the actual planted memorial tree." },
    ],
    giftIdeas: [
      "Single memorial tree (₹299)",
      "10-tree memorial grove (₹2,999) — Climate Impact Pack",
      "Annual remembrance — replant on anniversaries",
    ],
    primaryCtaLabel: "Plant a Memorial Tree",
    primaryCtaPath: "/single-tree-pack",
    faqs: [
      { q: "Can family members visit the planted tree?", a: "Yes — you receive GPS coordinates and the farmer/village name. Visits can be arranged with the partner farmer." },
      { q: "Is there a special memorial certificate design?", a: "Yes — we provide a softer, condolence-appropriate certificate design for in-memory plantations." },
    ],
    keywords: "plant tree in memory India, memorial tree gift, living memorial, tree in loved ones name",
  },
  {
    slug: "corporate-gifting",
    title: "Corporate Tree Gifting",
    metaTitle: "Corporate Tree Gifting India — Client & Employee Gifts | Himsols",
    metaDescription:
      "Replace plastic corporate gifts with verified tree plantation in your clients' and employees' names. Custom-branded, ESG-aligned, bulk pricing.",
    heroHeadline: "Corporate Gifts That Build ESG Credentials",
    subhead:
      "Send your clients, employees and partners a verified tree planted in their name — with your company logo on every certificate.",
    why: "Modern corporate gifting must align with ESG and sustainability commitments. Himsols turns each gift into a measurable, verifiable carbon-positive action — and supplies you with aggregated impact reports for ESG disclosures.",
    howItWorks: [
      { step: "Tell us recipient count", detail: "Employees, clients, partners — bulk pricing from 25 units upwards." },
      { step: "Co-branded certificates", detail: "Your logo + recipient name + tree GPS on every certificate." },
      { step: "ESG report", detail: "Quarterly aggregated impact report with total trees, CO₂ estimate and survival rate for ESG filings." },
    ],
    giftIdeas: [
      "Employee Diwali / New Year gifting",
      "Client onboarding kit add-on",
      "Investor / partner appreciation",
    ],
    primaryCtaLabel: "Request Corporate Quote",
    primaryCtaPath: "/corporate",
    faqs: [
      { q: "Do you provide GST invoices and 80G receipts?", a: "Yes — GST invoices for all orders and 80G receipts where applicable for the donation portion." },
      { q: "Can certificates carry our company logo?", a: "Yes — all corporate bulk orders include logo and brand colour customisation." },
    ],
    keywords: "corporate tree gifting India, ESG corporate gifts, employee gift sustainable, client gift trees",
  },
  {
    slug: "csr-plantation",
    title: "CSR Tree Plantation in India",
    metaTitle: "CSR Tree Plantation India — Verified, ESG-Compliant | Himsols",
    metaDescription:
      "End-to-end CSR tree plantation across Himachal Pradesh. Verified land, geo-tagged proof, 3-year survival reports, 80G + ESG documentation.",
    heroHeadline: "CSR Plantation That Actually Survives",
    subhead:
      "Skip greenwashing. Himsols runs verified, geo-tagged, survival-tracked plantation drives across Himachal Pradesh — with full ESG and 80G documentation.",
    why: "Most corporate CSR plantation drives fail because trees aren't tracked after the photo-op. Himsols guarantees 3-year survival monitoring, geo-tagged proof of every planting, and quarterly impact reports built for ESG and Section 135 compliance.",
    howItWorks: [
      { step: "Scoping call", detail: "We understand your CSR objectives, district preferences and budget." },
      { step: "Land & farmer verification", detail: "We onboard verified farmer land aligned to your scale." },
      { step: "Plantation + reporting", detail: "On-ground plantation with geo-tagged photos; quarterly survival and CO₂ reports for 3 years." },
    ],
    giftIdeas: [
      "500–5,000 tree CSR drives",
      "Multi-year plantation MoUs",
      "District-focused programmes (Kullu post-flood, Spiti cold desert, Una air-quality)",
    ],
    primaryCtaLabel: "Request CSR Proposal",
    primaryCtaPath: "/corporate",
    faqs: [
      { q: "Are you 80G certified?", a: "Yes — Himsols issues 80G-eligible receipts for the donation portion of CSR plantation programmes." },
      { q: "What does survival tracking look like?", a: "Quarterly geo-tagged photos and a survival-rate dashboard for every planted batch, for 3 years." },
    ],
    keywords: "CSR tree plantation India, corporate plantation Himachal, ESG plantation, 80G tree plantation",
  },
];

export const getUseCaseBySlug = (slug: string): UseCase | undefined =>
  USE_CASES.find((u) => u.slug === slug);
