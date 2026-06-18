// Top Himachal Pradesh cities/towns for programmatic "plant trees in {city}" SEO pages.
// Each city gets a unique landing page at /plant-trees-in/:slug.
// lat/lng power LocalBusiness geo schema + OpenStreetMap embed for local SEO.

export interface HPCity {
  slug: string;
  name: string;
  nameHi: string;
  district: string;
  altitudeM: number;
  lat: number;
  lng: number;
  knownFor: string;
  localAngle: string;
  nativeSpecies: string[];
  faqs: { q: string; a: string }[];
}

export const HP_CITIES: HPCity[] = [
  {
    slug: "shimla", name: "Shimla", nameHi: "शिमला", district: "Shimla",
    altitudeM: 2276, lat: 31.1048, lng: 77.1734,
    knownFor: "Colonial capital, Mall Road, deodar forests",
    localAngle: "Shimla's deodar belt has been thinning rapidly due to construction pressure, landslides and unmanaged tourism. Planting native deodar, oak and rhododendron on verified farmer land in surrounding villages like Kufri, Mashobra and Theog directly stabilises the hills that the city sits on.",
    nativeSpecies: ["Deodar", "Himalayan Oak", "Rhododendron", "Walnut"],
    faqs: [
      { q: "Can I plant a tree in Shimla through Himsols?", a: "Yes — Himsols plants on verified farmer land across Shimla district (Kufri, Mashobra, Theog, Rohru and more). You sponsor online and get a geo-tagged certificate within 48 hours." },
      { q: "Which trees grow best around Shimla?", a: "Deodar, Himalayan oak, blue pine, rhododendron and walnut are the most climate-suited native species for the 1800-2500m elevation around Shimla." },
      { q: "Will I get GPS coordinates of my Shimla tree?", a: "Every Himsols tree comes with GPS coordinates, geo-tagged photos, farmer details and 3-year survival tracking." },
      { q: "How much does it cost to plant a tree in Shimla?", a: "₹299 plants one verified tree in Shimla district. The ₹2,999 Climate Impact Pack covers 10 trees with a full CSR/CO₂ report." },
    ],
  },
  {
    slug: "manali", name: "Manali", nameHi: "मनाली", district: "Kullu",
    altitudeM: 2050, lat: 32.2396, lng: 77.1887,
    knownFor: "Beas valley, apple orchards, adventure tourism",
    localAngle: "Manali and the upper Beas valley have lost significant tree cover to road expansion, hotels and the 2023 floods. Plantation in surrounding villages like Naggar, Jagatsukh and Burwa reinforces fragile slopes and protects apple farmer livelihoods downstream.",
    nativeSpecies: ["Deodar", "Blue Pine", "Apple", "Walnut", "Horse Chestnut"],
    faqs: [
      { q: "How can tourists offset their Manali trip carbon?", a: "Sponsor one Himsols tree (₹299) per traveller — it offsets roughly 22 kg of CO₂ per year (estimate) for the next 30+ years and is planted in the Kullu-Manali region itself." },
      { q: "Does Himsols work with Manali apple farmers?", a: "Yes — many of our partner farmers in the Kullu district grow apple alongside agroforestry species like walnut and chestnut on the same land." },
      { q: "How quickly can my Manali tree be planted?", a: "Sponsorship to planting usually takes 15-30 days depending on season; geo-tagged proof is shared on your dashboard within 48 hours of plantation." },
    ],
  },
  {
    slug: "dharamshala", name: "Dharamshala", nameHi: "धर्मशाला", district: "Kangra",
    altitudeM: 1457, lat: 32.2190, lng: 76.3234,
    knownFor: "Dalai Lama residence, Dhauladhar range, McLeod Ganj",
    localAngle: "The Dhauladhar foothills around Dharamshala have seen aggressive deforestation for construction. Planting oak and pine on Kangra valley farmer land restores the catchment that feeds the entire region's springs and streams.",
    nativeSpecies: ["Himalayan Oak", "Chir Pine", "Deodar", "Mulberry"],
    faqs: [
      { q: "Where exactly does Himsols plant trees near Dharamshala?", a: "On verified farmer land across Kangra district — villages around Palampur, Baijnath, Yol and Shahpur." },
      { q: "Can monasteries or NGOs in Dharamshala partner with Himsols?", a: "Yes. Visit our Partner with Us page or write to us — we run dedicated plantation drives for institutions." },
    ],
  },
  {
    slug: "kullu", name: "Kullu", nameHi: "कुल्लू", district: "Kullu",
    altitudeM: 1278, lat: 31.9578, lng: 77.1095,
    knownFor: "Valley of Gods, Dussehra, apple belt",
    localAngle: "Kullu valley supports thousands of small apple and walnut farmers whose income is directly tied to forest health and water availability. Himsols' verified plantation across Kullu villages keeps farmers on the land instead of migrating to cities.",
    nativeSpecies: ["Walnut", "Apple", "Deodar", "Blue Pine", "Chestnut"],
    faqs: [
      { q: "Is Kullu a good place for CSR tree plantation?", a: "Absolutely — Kullu has high CSR appeal (post-flood recovery), verified farmer land, and species that yield long-term carbon plus livelihood impact." },
    ],
  },
  {
    slug: "mandi", name: "Mandi", nameHi: "मंडी", district: "Mandi",
    altitudeM: 800, lat: 31.7080, lng: 76.9318,
    knownFor: "Choti Kashi, Beas-Sutlej confluence, IIT Mandi",
    localAngle: "Mandi sits at the heart of Himachal's road and rail corridor. Plantation on Mandi district farmer land reduces dust, stabilises slopes along the Mandi-Manali highway, and supports rural farming families.",
    nativeSpecies: ["Chir Pine", "Mulberry", "Toon", "Mango"],
    faqs: [
      { q: "Can IIT Mandi students or alumni partner with Himsols?", a: "Yes — we welcome institutional plantation drives and student CSR projects. Reach us via the Partner with Us page." },
    ],
  },
  {
    slug: "solan", name: "Solan", nameHi: "सोलन", district: "Solan",
    altitudeM: 1502, lat: 30.9045, lng: 77.0967,
    knownFor: "Mushroom city, pharma hub, gateway to Himachal",
    localAngle: "Solan houses a dense cluster of pharma and FMCG units that need credible carbon offset and CSR documentation. Local plantation through Himsols gives Solan-based companies a verified, traceable offset right at their doorstep.",
    nativeSpecies: ["Chir Pine", "Oak", "Khair", "Mulberry"],
    faqs: [
      { q: "Can Solan-based companies offset emissions locally?", a: "Yes — Himsols runs CSR plantation across Solan district with full 80G + carbon offset reports tailored for pharma and manufacturing units." },
    ],
  },
  {
    slug: "dalhousie", name: "Dalhousie", nameHi: "डलहौजी", district: "Chamba",
    altitudeM: 1970, lat: 32.5448, lng: 75.9618,
    knownFor: "Colonial hill town, Khajjiar, deodar forests",
    localAngle: "Dalhousie's iconic deodar belt is vulnerable to fire and unregulated tourism. Planting in Chamba district villages around Banikhet and Bakloh extends the deodar corridor and supports remote tribal communities.",
    nativeSpecies: ["Deodar", "Blue Pine", "Rhododendron"],
    faqs: [
      { q: "Why plant trees in Dalhousie?", a: "Dalhousie's old-growth deodar is irreplaceable. Every new tree planted in surrounding villages buys time for the ecosystem and keeps tribal farming families on their land." },
    ],
  },
  {
    slug: "palampur", name: "Palampur", nameHi: "पालमपुर", district: "Kangra",
    altitudeM: 1219, lat: 32.1109, lng: 76.5360,
    knownFor: "Tea gardens, Dhauladhar views, IHBT",
    localAngle: "Palampur's tea-growing belt sits below the Dhauladhar range and depends on consistent rainfall and healthy upper catchments. Plantation on Palampur farmer land protects tea-growing microclimates and farmer income.",
    nativeSpecies: ["Oak", "Toon", "Mulberry", "Walnut"],
    faqs: [
      { q: "Can tea estates in Palampur participate?", a: "Yes — Himsols partners with progressive estates for agroforestry plantation along boundaries and barren patches." },
    ],
  },
  {
    slug: "kasauli", name: "Kasauli", nameHi: "कसौली", district: "Solan",
    altitudeM: 1927, lat: 30.8978, lng: 76.9647,
    knownFor: "Cantonment town, pine forests, panoramic views",
    localAngle: "Kasauli's chir pine belt is highly fire-prone in summer. Mixed-species plantation in surrounding Solan villages reduces monoculture risk and builds long-term forest resilience.",
    nativeSpecies: ["Chir Pine", "Oak", "Rhododendron", "Khair"],
    faqs: [
      { q: "Is Kasauli safe for tree plantation given pine fires?", a: "Yes — Himsols specifically plants mixed broadleaf species (oak, khair, mulberry) alongside pine to break monoculture fire risk." },
    ],
  },
  {
    slug: "chamba", name: "Chamba", nameHi: "चंबा", district: "Chamba",
    altitudeM: 996, lat: 32.5534, lng: 76.1258,
    knownFor: "Ancient temples, Chamba rumal, Ravi valley",
    localAngle: "Chamba district has some of Himachal's most remote villages and highest poverty rates. Plantation here doubles as climate action and direct rural livelihood support.",
    nativeSpecies: ["Toon", "Mulberry", "Walnut", "Chir Pine"],
    faqs: [
      { q: "Does Himsols support remote Chamba villages?", a: "Yes — Chamba is one of our priority districts for verified farmer plantation, with families earning recurring income through 3-year survival incentives." },
    ],
  },
  {
    slug: "hamirpur", name: "Hamirpur", nameHi: "हमीरपुर", district: "Hamirpur",
    altitudeM: 785, lat: 31.6862, lng: 76.5213,
    knownFor: "Education hub, NIT Hamirpur, agrarian belt",
    localAngle: "Hamirpur's lower-altitude farmland is ideal for agroforestry species that yield fruit, fodder and fuelwood alongside carbon. Himsols' Hamirpur plantation supports small farmers transitioning to multi-layer cropping.",
    nativeSpecies: ["Mango", "Mulberry", "Toon", "Khair"],
    faqs: [
      { q: "Can college students from Hamirpur join Himsols?", a: "Yes — NIT Hamirpur and other colleges can run plantation drives with us. Email partnerships@himsols.com." },
    ],
  },
  {
    slug: "una", name: "Una", nameHi: "ऊना", district: "Una",
    altitudeM: 369, lat: 31.4685, lng: 76.2708,
    knownFor: "Industrial belt, lowest district by altitude, Shiv Bari",
    localAngle: "Una's flat industrial belt has high air-pollution load and limited tree cover. Plantation on Una farmer land is one of the highest-ROI air-quality interventions in Himachal.",
    nativeSpecies: ["Neem", "Peepal", "Mango", "Mulberry"],
    faqs: [
      { q: "Can Una-based factories sponsor plantation?", a: "Yes — Himsols offers air-quality-focused CSR plantation packages for Una industrial units with measurable PM10 impact reports." },
    ],
  },
  {
    slug: "bilaspur", name: "Bilaspur", nameHi: "बिलासपुर", district: "Bilaspur",
    altitudeM: 673, lat: 31.3326, lng: 76.7625,
    knownFor: "Govind Sagar lake, AIIMS Bilaspur",
    localAngle: "Bilaspur's reservoir catchment urgently needs upper-slope greening to prevent siltation. Plantation on Bilaspur farmer land protects water security for downstream Punjab and Himachal.",
    nativeSpecies: ["Khair", "Toon", "Mulberry", "Chir Pine"],
    faqs: [
      { q: "Why is plantation important around Govind Sagar?", a: "Healthy upper catchments reduce siltation and extend the lake's useful life — directly benefitting irrigation and hydropower." },
    ],
  },
  {
    slug: "kangra", name: "Kangra", nameHi: "कांगड़ा", district: "Kangra",
    altitudeM: 733, lat: 32.0997, lng: 76.2691,
    knownFor: "Kangra valley, fort, tea, Brajeshwari Temple",
    localAngle: "Kangra valley is Himachal's largest agricultural district. Plantation across Kangra blends climate action with agri-resilience for thousands of small farming households.",
    nativeSpecies: ["Mango", "Mulberry", "Toon", "Walnut"],
    faqs: [
      { q: "How many trees has Himsols planted in Kangra?", a: "Live counts are visible on our Impact Dashboard — Kangra is one of our highest-volume districts." },
    ],
  },
  {
    slug: "kinnaur", name: "Kinnaur", nameHi: "किन्नौर", district: "Kinnaur",
    altitudeM: 2320, lat: 31.5891, lng: 78.4742,
    knownFor: "Apple orchards, Kinnauri culture, Indo-Tibetan border",
    localAngle: "Kinnaur faces escalating glacial-lake and landslide risk. High-altitude agroforestry plantation here directly stabilises slopes and protects apple farmer income.",
    nativeSpecies: ["Apple", "Walnut", "Chilgoza Pine", "Apricot"],
    faqs: [
      { q: "Can Himsols plant chilgoza pine in Kinnaur?", a: "Yes — chilgoza and walnut are part of our Kinnaur agroforestry mix, planted with verified farmer families." },
    ],
  },
  {
    slug: "sirmaur", name: "Sirmaur", nameHi: "सिरमौर", district: "Sirmaur",
    altitudeM: 932, lat: 30.5733, lng: 77.2922,
    knownFor: "Renuka lake, Paonta Sahib, ginger farming",
    localAngle: "Sirmaur's mid-hills support ginger and turmeric farmers whose land is ideal for shade-tree agroforestry. Plantation here doubles as soil-cover and shade for cash crops.",
    nativeSpecies: ["Toon", "Mulberry", "Mango", "Khair"],
    faqs: [
      { q: "Does Himsols work in Paonta Sahib industrial belt?", a: "Yes — we run CSR plantation for Paonta Sahib factories with full ESG documentation." },
    ],
  },
  {
    slug: "nahan", name: "Nahan", nameHi: "नाहन", district: "Sirmaur",
    altitudeM: 932, lat: 30.5594, lng: 77.2966,
    knownFor: "District HQ of Sirmaur, Shivalik foothills",
    localAngle: "Nahan's Shivalik foothills are highly erosion-prone. Native tree plantation on surrounding farmer land is the cheapest, most durable soil-stabilisation intervention available.",
    nativeSpecies: ["Khair", "Toon", "Neem", "Mulberry"],
    faqs: [
      { q: "Why are Shivalik foothills a priority?", a: "Soft, young geology means soil loss is high — fast-growing native species rebuild root mass within a single monsoon cycle." },
    ],
  },
  {
    slug: "spiti", name: "Spiti", nameHi: "स्पीति", district: "Lahaul & Spiti",
    altitudeM: 3800, lat: 32.2464, lng: 78.0349,
    knownFor: "Cold desert, ancient monasteries, sea buckthorn",
    localAngle: "Spiti is a high-altitude cold desert where every tree counts. Himsols supports community plantation of sea buckthorn and hardy willows that protect Spiti's villages from cold winds and erosion.",
    nativeSpecies: ["Sea Buckthorn", "Willow", "Apricot"],
    faqs: [
      { q: "Can trees survive in Spiti's cold desert?", a: "Yes — sea buckthorn and certain willow species thrive at 3000m+ and double as livelihood crops for Spiti villagers." },
    ],
  },
  {
    slug: "kufri", name: "Kufri", nameHi: "कुफरी", district: "Shimla",
    altitudeM: 2720, lat: 31.0975, lng: 77.2667,
    knownFor: "Winter sports, panoramic views, near Shimla",
    localAngle: "Kufri's tourism load far exceeds its ecological carrying capacity. Plantation in surrounding villages buffers the area's deodar belt from tourist-related stress.",
    nativeSpecies: ["Deodar", "Rhododendron", "Blue Pine"],
    faqs: [
      { q: "Can I offset my Kufri visit by planting a tree?", a: "Yes — ₹299 plants one tree in the same Shimla district, with geo-tagged proof in 48 hours." },
    ],
  },
  {
    slug: "mcleodganj", name: "McLeod Ganj", nameHi: "मैक्लोडगंज", district: "Kangra",
    altitudeM: 2082, lat: 32.2427, lng: 76.3234,
    knownFor: "Tibetan settlement, Dalai Lama, Bhagsu",
    localAngle: "McLeod Ganj's hillsides are visibly degraded from cafés, guesthouses and trekking traffic. Plantation on adjacent Kangra farmer land helps rebalance the local ecosystem.",
    nativeSpecies: ["Oak", "Rhododendron", "Deodar"],
    faqs: [
      { q: "Can travellers to McLeod Ganj plant a tree?", a: "Yes — sponsor online in 60 seconds, your tree is planted within 30 days on verified Kangra farmer land and tracked for 3 years." },
    ],
  },
];

export const getCityBySlug = (slug: string): HPCity | undefined =>
  HP_CITIES.find((c) => c.slug === slug);
