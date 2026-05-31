// Tree species data — powers /trees/:slug programmatic SEO pages.
// Each species page targets queries like "plant deodar tree", "buy walnut sapling India".

export interface TreeSpecies {
  slug: string;
  name: string;
  nameHi: string;
  scientific: string;
  category: "native" | "fruit" | "agroforestry" | "ornamental";
  bestFor: string;
  altitudeRange: string;
  growthYears: number;
  co2PerYearKg: number;
  overview: string;
  whyPlant: string;
  ecologicalRole: string;
  himachalContext: string;
  faqs: { q: string; a: string }[];
}

export const TREE_SPECIES: TreeSpecies[] = [
  {
    slug: "deodar",
    name: "Deodar",
    nameHi: "देवदार",
    scientific: "Cedrus deodara",
    category: "native",
    bestFor: "Mid-to-high altitude Himalayan slopes",
    altitudeRange: "1500–3000 m",
    growthYears: 80,
    co2PerYearKg: 28,
    overview:
      "Deodar — the divine cedar — is Himachal Pradesh's state tree and one of the longest-lived conifers of the western Himalayas. A single deodar can live for several centuries, anchoring slopes, regulating microclimate, and producing rot-resistant timber prized across north India.",
    whyPlant:
      "Deodar plantations stabilise fragile mountain slopes, recharge springs, and act as long-duration carbon sinks (a mature deodar sequesters an estimated 28 kg of CO₂ per year). Restoring deodar belts is critical to Himachal's water security and landslide resilience.",
    ecologicalRole:
      "Deodar canopies create cool, humid microclimates that support oak, rhododendron and ferns underneath, forming layered forests that hold more soil and water than any monoculture.",
    himachalContext:
      "Himachal's iconic deodar belts in Shimla, Kullu, Chamba and Kinnaur have been thinning for decades. Himsols replants deodar on verified farmer land in these districts, with 3-year survival tracking.",
    faqs: [
      { q: "How long does a deodar tree live?", a: "Deodar trees commonly live 200–500 years, with some Himalayan specimens over 700 years old." },
      { q: "Can I sponsor a deodar through Himsols?", a: "Yes — sponsor from ₹299, planted within 30 days on verified Himachal farmer land with geo-tagged proof." },
    ],
  },
  {
    slug: "himalayan-oak",
    name: "Himalayan Oak",
    nameHi: "बान",
    scientific: "Quercus leucotrichophora",
    category: "native",
    bestFor: "Mid-altitude broadleaf restoration",
    altitudeRange: "1500–2400 m",
    growthYears: 100,
    co2PerYearKg: 22,
    overview:
      "Banj oak is the keystone broadleaf species of the central and western Himalayas. Oak forests are the single most important freshwater factory of the Indian Himalayas — every spring and stream in mid-altitude Himachal traces back to an oak catchment.",
    whyPlant:
      "Oaks recharge springs, retain monsoon water, and build deep humus soils. Replacing degraded pine monoculture with oak directly restores water security for villages downstream.",
    ecologicalRole:
      "Oak supports the highest biodiversity of any Himalayan broadleaf — lichens, mosses, leopards, langurs and over a hundred bird species all depend on healthy oak forests.",
    himachalContext:
      "Decades of pine encroachment have hollowed Himachal's oak belt. Himsols prioritises oak plantation in Kangra, Shimla and Mandi districts to rebuild this catchment.",
    faqs: [
      { q: "Why is oak called a 'water tree'?", a: "Oak forests slow rain absorption into soil, dramatically increasing spring discharge — a single mature oak can boost local water tables." },
    ],
  },
  {
    slug: "walnut",
    name: "Walnut",
    nameHi: "अखरोट",
    scientific: "Juglans regia",
    category: "fruit",
    bestFor: "Farmer income + carbon (agroforestry)",
    altitudeRange: "1200–2700 m",
    growthYears: 60,
    co2PerYearKg: 20,
    overview:
      "Walnut is the most valuable agroforestry tree of the western Himalayas — yielding both premium timber and high-value nuts. A single mature walnut can earn a Himachali farmer ₹20,000–₹50,000 per year for decades.",
    whyPlant:
      "Walnut combines carbon sequestration with direct rural income — the strongest model for farmer retention in Himachal's mountain villages.",
    ecologicalRole:
      "Deep-rooted, drought-tolerant and pest-resistant. Walnut canopies allow intercropping of vegetables and fodder, supporting multi-layer rural farms.",
    himachalContext:
      "Kullu, Kinnaur, Shimla and Mandi farmers grow walnut alongside apple. Himsols' walnut plantation directly boosts long-term household income.",
    faqs: [
      { q: "When does a planted walnut start fruiting?", a: "Grafted walnut starts bearing in 5–7 years and reaches full yield by year 12–15." },
      { q: "Does the farmer keep the walnut income?", a: "Yes — 100% of fruit income stays with the partner farmer. Himsols only verifies plantation and survival." },
    ],
  },
  {
    slug: "blue-pine",
    name: "Blue Pine",
    nameHi: "कैल",
    scientific: "Pinus wallichiana",
    category: "native",
    bestFor: "High-altitude reforestation",
    altitudeRange: "1800–3000 m",
    growthYears: 70,
    co2PerYearKg: 24,
    overview:
      "Blue pine (kail) is a fast-growing native conifer of the upper Himalayas, often growing alongside deodar and fir. Its long needles and graceful form make it a signature tree of Manali, Kullu and Kinnaur.",
    whyPlant:
      "Blue pine establishes quickly on degraded slopes, providing rapid soil cover and a nurse canopy for slower-growing oak and deodar.",
    ecologicalRole:
      "Acts as a pioneer species on landslide scars and abandoned fields, eventually giving way to mixed conifer-broadleaf forest.",
    himachalContext:
      "Critical for post-flood slope stabilisation in Kullu, Manali and Mandi. Himsols uses blue pine as the first cohort in restoration zones.",
    faqs: [
      { q: "How is blue pine different from chir pine?", a: "Blue pine grows at higher altitudes, has softer 5-needle clusters and is less fire-prone than the 3-needle chir pine." },
    ],
  },
  {
    slug: "chir-pine",
    name: "Chir Pine",
    nameHi: "चीड़",
    scientific: "Pinus roxburghii",
    category: "native",
    bestFor: "Low-mid altitude erosion control",
    altitudeRange: "500–1800 m",
    growthYears: 60,
    co2PerYearKg: 18,
    overview:
      "Chir pine dominates Himachal's mid-hills below 1800 m. Tough, drought-tolerant and capable of growing on the poorest soils, it has been heavily planted by the Forest Department since the 1950s.",
    whyPlant:
      "Chir holds eroded Shivalik slopes together and provides resin income to local communities. When mixed with broadleaf species, it builds resilient multi-species forests.",
    ecologicalRole:
      "Pioneer species on degraded land — but pure chir monoculture is fire-prone. Himsols always interplants chir with oak, khair or mulberry to break monoculture risk.",
    himachalContext:
      "Widespread in Solan, Hamirpur, Bilaspur, Una and Mandi. Himsols focuses on mixed plantation to undo decades of pine monoculture.",
    faqs: [
      { q: "Is chir pine bad for biodiversity?", a: "Pure chir monoculture is — but mixed plantation with native broadleaves restores biodiversity quickly." },
    ],
  },
  {
    slug: "rhododendron",
    name: "Rhododendron",
    nameHi: "बुरांश",
    scientific: "Rhododendron arboreum",
    category: "native",
    bestFor: "High-altitude flowering, juice income",
    altitudeRange: "1500–3000 m",
    growthYears: 80,
    co2PerYearKg: 16,
    overview:
      "Rhododendron (buransh) blooms spectacularly across the Himalayas every spring and is Himachal's state flower. Its red flowers are processed into juice and syrup, supporting rural cottage industry.",
    whyPlant:
      "Buransh supports pollinators, prevents soil erosion on steep slopes, and provides rural women with a high-value, sustainable forest product.",
    ecologicalRole:
      "Key understorey species in oak and deodar forests; vital nectar source for Himalayan bees and birds.",
    himachalContext:
      "Planted across Shimla, Kullu, Chamba and Mandi as part of mixed restoration with oak and deodar.",
    faqs: [
      { q: "Can rhododendron juice be sold commercially?", a: "Yes — buransh juice is a recognised rural product and sells across north Indian markets." },
    ],
  },
  {
    slug: "mango",
    name: "Mango",
    nameHi: "आम",
    scientific: "Mangifera indica",
    category: "fruit",
    bestFor: "Low-altitude farmer income",
    altitudeRange: "0–1200 m",
    growthYears: 80,
    co2PerYearKg: 22,
    overview:
      "Mango is India's most important fruit tree and thrives in Himachal's lower belts — Una, Hamirpur, Kangra and Bilaspur. A single grafted mango produces fruit for 40+ years.",
    whyPlant:
      "Pure climate-and-income win: a mango tree delivers shade, carbon, fruit income, and biodiversity habitat — all on a small farmer's land.",
    ecologicalRole:
      "Dense canopy supports birds, pollinators and undergrowth; fallen leaves enrich soil.",
    himachalContext:
      "Himsols plants improved Dussehri, Langra and Chausa varieties on verified farmer land in lower Himachal.",
    faqs: [
      { q: "When does a planted mango start fruiting?", a: "Grafted mango starts bearing in 3–5 years and reaches full yield by year 8–10." },
    ],
  },
  {
    slug: "neem",
    name: "Neem",
    nameHi: "नीम",
    scientific: "Azadirachta indica",
    category: "agroforestry",
    bestFor: "Low-altitude air quality + medicinal",
    altitudeRange: "0–1000 m",
    growthYears: 70,
    co2PerYearKg: 25,
    overview:
      "Neem is one of India's most medicinally important trees and a powerful air purifier. Every part — leaves, bark, seeds, oil — has documented use across Ayurveda and modern pesticide research.",
    whyPlant:
      "Neem performs exceptionally well in degraded, polluted, low-altitude land. Plantation in Una and lower Bilaspur industrial belts directly improves air quality.",
    ecologicalRole:
      "Natural pest repellent; supports beneficial insects and provides year-round shade.",
    himachalContext:
      "Priority species for industrial-belt CSR plantation in Una, Paonta Sahib and Baddi.",
    faqs: [
      { q: "Does neem actually clean air?", a: "Yes — neem absorbs significant SO₂ and particulate matter and is recommended for roadside and industrial plantation." },
    ],
  },
];

export const getSpeciesBySlug = (slug: string): TreeSpecies | undefined =>
  TREE_SPECIES.find((s) => s.slug === slug);
