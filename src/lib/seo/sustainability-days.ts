// Sustainability days data — each entry powers a dedicated SEO landing page at /days/:slug
// Keep copy long-form (1000+ words across sections) for ranking power.

export interface FAQ {
  q: string;
  a: string;
}

export interface SustainabilityDay {
  slug: string;
  name: string;
  nameHi: string;
  date: string; // MM-DD
  dateLabel: string; // human readable e.g. "June 5"
  theme: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroHeadlineHi: string;
  subhead: string;
  history: string;
  whyItMatters: string;
  howToCelebrate: string[];
  himachalAngle: string;
  faqs: FAQ[];
  keywords: string;
}

const Y = new Date().getFullYear();

export const SUSTAINABILITY_DAYS: SustainabilityDay[] = [
  {
    slug: "world-environment-day",
    name: "World Environment Day",
    nameHi: "विश्व पर्यावरण दिवस",
    date: "06-05",
    dateLabel: "June 5",
    theme: "Beat Plastic Pollution & Restore Our Land",
    metaTitle: `World Environment Day ${Y} — Plant a Tree in India | Himsols`,
    metaDescription: `Celebrate World Environment Day ${Y} by sponsoring a verified tree in Himachal Pradesh. Get geo-tagged proof, survival tracking & carbon impact report from ₹299.`,
    heroHeadline: `World Environment Day ${Y} — Plant a Tree, Leave a Legacy`,
    heroHeadlineHi: `विश्व पर्यावरण दिवस ${Y} — एक पेड़ लगाएं, विरासत छोड़ें`,
    subhead: "Join thousands of Indians turning June 5 into real, verified climate action with Himsols.",
    history: `World Environment Day was established by the United Nations General Assembly in 1972 during the Stockholm Conference on the Human Environment, and has been celebrated on June 5 every year since 1973. It is the UN's flagship day for promoting worldwide awareness and action to protect our environment. Over five decades, it has grown into the largest global platform for environmental outreach, with millions of people from more than 150 countries taking part. India has hosted the global celebrations multiple times and remains one of the most active participating nations, with schools, corporates and citizens organizing tree plantation drives, clean-up campaigns and awareness workshops every year.`,
    whyItMatters: `India is among the countries most vulnerable to climate change. Rising temperatures, erratic monsoons, glacial retreat in the Himalayas, and increasing air pollution are no longer future risks — they are today's reality. World Environment Day is the one day a year when individuals, schools, companies and governments come together with a shared purpose: to make measurable, on-ground impact. Planting trees on this day isn't symbolic — it kickstarts a 30+ year carbon sequestration cycle, protects topsoil, recharges groundwater, and provides livelihoods to rural farmers. A single sponsored tree on Himsols offsets an estimated 22 kg of CO₂ per year over its lifetime, while supporting a verified Himachali farmer who plants and protects it on real, geo-tagged land.`,
    howToCelebrate: [
      "Sponsor a verified tree (from ₹299) and receive a geo-tagged certificate within 48 hours.",
      "Gift a Climate Impact Pack (10 trees, ₹2,999) to a colleague, client or loved one.",
      "Organize an office plantation drive — we handle land, saplings, transport and reporting.",
      "Donate to an active campaign and watch the live tree-count grow in real time.",
      "Share your impact certificate on LinkedIn, WhatsApp and Instagram with #HimsolsPlanted.",
    ],
    himachalAngle: `Himachal Pradesh is India's green lung — forests cover over 27% of its area and the state is home to deodar, oak, pine, walnut and apple ecosystems that regulate climate for the entire northern plains. By planting on Himachal farmer land, you don't just offset carbon; you stabilize Himalayan slopes, prevent flash floods downstream, and put real income into the hands of small farmers who would otherwise migrate to cities. Every tree on Himsols is planted, photographed, GPS-tagged and survival-tracked for at least three years.`,
    faqs: [
      { q: "When is World Environment Day celebrated?", a: "World Environment Day is celebrated globally on June 5 every year, as declared by the United Nations." },
      { q: "What is the theme of World Environment Day this year?", a: `The ${Y} theme focuses on land restoration, ending plastic pollution, and accelerating climate solutions. Himsols' contribution is verified tree plantation across Himachal Pradesh.` },
      { q: "How can I plant a tree on World Environment Day in India?", a: "The fastest way is to sponsor a tree through Himsols — you pay online, we plant within 30 days on verified farmer land in Himachal, share a geo-tagged certificate, and update you with survival reports." },
      { q: "How much CO₂ does one tree absorb?", a: "A mature tree absorbs an estimated 22 kg of CO₂ per year. Over a 30-year lifespan that's roughly 660 kg of CO₂ sequestered per tree — the exact figure varies by species and site." },
      { q: "Can my company organize a CSR plantation on Environment Day?", a: "Yes. Himsols runs end-to-end corporate CSR plantations — visit our Corporate page to get a custom proposal with carbon offset reports and 80G-compliant documentation." },
      { q: "Will I get proof that my tree was actually planted?", a: "Every Himsols tree comes with a geo-tagged photo, GPS coordinates, farmer details and a publicly verifiable certificate. You can track survival updates for up to 3 years." },
    ],
    keywords: "World Environment Day 2026, plant a tree India, environment day tree plantation, June 5 environment day, विश्व पर्यावरण दिवस, CSR plantation environment day, Himsols",
  },
  {
    slug: "earth-day",
    name: "Earth Day",
    nameHi: "पृथ्वी दिवस",
    date: "04-22",
    dateLabel: "April 22",
    theme: "Planet vs. Plastics & Trees for Earth",
    metaTitle: `Earth Day ${Y} — Plant Trees in India to Heal the Planet | Himsols`,
    metaDescription: `This Earth Day ${Y}, sponsor a verified tree in Himachal Pradesh from ₹299. Geo-tagged proof, 3-year survival tracking, and real climate impact.`,
    heroHeadline: `Earth Day ${Y} — Trees for the Planet, Income for Farmers`,
    heroHeadlineHi: `पृथ्वी दिवस ${Y} — पृथ्वी के लिए पेड़, किसानों के लिए आय`,
    subhead: "Turn April 22 from a hashtag into a verified, geo-tagged tree planted in your name.",
    history: `Earth Day was first observed on April 22, 1970 in the United States, when 20 million Americans demonstrated for a healthy, sustainable environment. It is widely credited as the launch event of the modern environmental movement. Today, Earth Day is coordinated globally by EARTHDAY.ORG and is observed in more than 193 countries by over a billion people, making it the largest civic observance in the world. In India, Earth Day has become a major rallying point for schools, colleges, urban citizens and progressive companies running ESG and CSR programs.`,
    whyItMatters: `Earth Day matters because it converts climate anxiety into climate action. Every April 22, more trees are planted globally than on almost any other day. But planting alone isn't enough — without verification, survival tracking and farmer accountability, most "Earth Day trees" die within a year. Himsols was built to fix exactly this. Each tree you sponsor on Earth Day is planted on the land of a verified Himachali farmer, photographed, GPS-tagged, and survival-monitored for three years. You don't just plant a tree — you create a permanent, traceable climate asset.`,
    howToCelebrate: [
      "Sponsor a single tree for ₹299 — instant certificate, planted within 30 days.",
      "Buy a Climate Impact Pack (10 trees for ₹2,999) — perfect for Earth Day gifting.",
      "Start a fundraising campaign for your school, society or workplace.",
      "Take the Green Quiz and discover your annual carbon footprint.",
      "Share your Earth Day certificate with the hashtag #EarthDayHimsols.",
    ],
    himachalAngle: `Himachal Pradesh contains some of the most carbon-rich ecosystems in India — old-growth deodar forests, oak woodlands, and high-altitude apple orchards that act as massive carbon sinks. Sponsoring an Earth Day tree here means investing in a region that protects the Indo-Gangetic plains from glacial flash floods, regulates monsoon patterns, and supports thousands of marginal farmers.`,
    faqs: [
      { q: "When is Earth Day celebrated?", a: "Earth Day is observed globally on April 22 every year since 1970." },
      { q: "What is the difference between Earth Day and World Environment Day?", a: "Earth Day (April 22) is a citizen-led environmental movement that began in the US. World Environment Day (June 5) is a UN-organized observance. Both promote climate action — Himsols supports plantations for both." },
      { q: "How many trees should I plant on Earth Day?", a: "Even one tree is meaningful. To meaningfully offset an average Indian's annual carbon footprint, scientists estimate 7–10 trees per person per year — exactly why our Climate Impact Pack contains 10 trees." },
      { q: "Is Earth Day plantation tax deductible in India?", a: "Donations to registered Himsols campaigns may qualify for 80G tax exemption. Contact our team for the latest eligibility and corporate CSR documentation." },
    ],
    keywords: "Earth Day 2026, Earth Day India, plant trees Earth Day, April 22 Earth Day, पृथ्वी दिवस, Himsols Earth Day plantation",
  },
  {
    slug: "van-mahotsav",
    name: "Van Mahotsav",
    nameHi: "वन महोत्सव",
    date: "07-01",
    dateLabel: "July 1–7",
    theme: "India's National Festival of Trees",
    metaTitle: `Van Mahotsav ${Y} — India's Tree Plantation Festival | Himsols`,
    metaDescription: `Celebrate Van Mahotsav ${Y} (July 1–7) by sponsoring verified trees in Himachal Pradesh. Started in 1950 by K.M. Munshi, India's biggest plantation drive.`,
    heroHeadline: `Van Mahotsav ${Y} — India's Festival of Trees Lives On`,
    heroHeadlineHi: `वन महोत्सव ${Y} — पेड़ों का राष्ट्रीय उत्सव`,
    subhead: "Join the 75-year-old movement started by K.M. Munshi — plant a verified tree in Himachal this Van Mahotsav.",
    history: `Van Mahotsav, literally "Festival of Forests", was started in July 1950 by India's then Union Minister for Agriculture and Food, Kanaiya Lal Maneklal Munshi (K.M. Munshi). It was conceived as a nationwide annual tree-planting festival to create enthusiasm in the minds of citizens for the preservation of forests and tree planting. Celebrated in the first week of July — perfectly timed with the monsoon — Van Mahotsav has become India's largest annual plantation festival, with state forest departments, schools, NGOs and citizens planting millions of saplings each year.`,
    whyItMatters: `India's forest cover, though officially around 24% of its geographical area, is under continuous pressure from urbanization, mining and climate change. Van Mahotsav is the cultural anchor that keeps tree-planting in the national consciousness. But mass plantation drives have historically suffered from poor survival rates — saplings planted without follow-up rarely cross year three. Himsols solves this with verified farmer plantation, geo-tagging, and a 3-year survival tracking system. When you sponsor a tree this Van Mahotsav, you're not adding to forgotten statistics — you're funding a tree that will be checked on, photographed, and reported back to you year after year.`,
    howToCelebrate: [
      "Sponsor a Van Mahotsav tree (₹299) on verified Himachali farmer land.",
      "Organize a Van Mahotsav drive at your school — Himsols handles saplings, planting and reporting.",
      "Run a corporate CSR campaign across July's monsoon planting window.",
      "Gift Van Mahotsav certificates to clients and employees.",
      "Share photos from your planting and tag #VanMahotsav.",
    ],
    himachalAngle: `Van Mahotsav coincides perfectly with the Himachal monsoon — the ideal window for sapling survival. Soil moisture is high, temperatures are moderate, and young trees get a 3–4 month head-start before winter. This is the single best week of the year to plant in Himachal, and Himsols runs its largest annual plantation drives during this period.`,
    faqs: [
      { q: "When is Van Mahotsav celebrated?", a: "Van Mahotsav is celebrated in the first week of July every year, traditionally from July 1 to July 7." },
      { q: "Who started Van Mahotsav?", a: "Van Mahotsav was started in July 1950 by K.M. Munshi, India's then Union Minister for Agriculture and Food." },
      { q: "Why is Van Mahotsav celebrated in July?", a: "July marks the peak of India's monsoon, providing ideal soil moisture and rainfall for sapling survival — making it the best month of the year to plant trees." },
      { q: "How can I participate in Van Mahotsav?", a: "Sponsor a verified tree on Himsols, organize a school/office plantation drive through us, or contribute to an active campaign. Every contribution is tracked end-to-end." },
    ],
    keywords: "Van Mahotsav 2026, वन महोत्सव, Van Mahotsav K.M. Munshi, July plantation India, Van Mahotsav tree plantation, India tree festival",
  },
  {
    slug: "international-day-of-forests",
    name: "International Day of Forests",
    nameHi: "अंतरराष्ट्रीय वन दिवस",
    date: "03-21",
    dateLabel: "March 21",
    theme: "Forests and Innovation: New Solutions for a Better World",
    metaTitle: `International Day of Forests ${Y} — Protect Indian Forests | Himsols`,
    metaDescription: `Mark International Day of Forests ${Y} on March 21 by sponsoring trees in Himachal Pradesh. Verified, geo-tagged plantations starting ₹299.`,
    heroHeadline: `International Day of Forests ${Y} — Protect What Protects Us`,
    heroHeadlineHi: `अंतरराष्ट्रीय वन दिवस ${Y} — वनों को बचाएं`,
    subhead: "March 21 is the UN's day to celebrate forests — make yours count with a verified Himachali tree.",
    history: `The International Day of Forests was proclaimed on December 21, 2012, by the United Nations General Assembly. Celebrated every year on March 21, it is observed to raise awareness about the importance of all types of forests and trees outside forests. Each year a different theme is chosen — past themes have included forests and biodiversity, forests and sustainable production and consumption, forests and innovation, and forest restoration.`,
    whyItMatters: `Forests cover 31% of the earth's land surface and are home to 80% of terrestrial biodiversity. They absorb roughly 2.6 billion tonnes of CO₂ each year — about one-third of the CO₂ released from burning fossil fuels. Despite this, the world loses around 10 million hectares of forest every year to deforestation. India's forest cover has been slowly increasing, but quality forest is in decline. By planting verified, native and agroforestry species in Himachal Pradesh, Himsols contributes to genuine forest restoration — not just tree count.`,
    howToCelebrate: [
      "Sponsor a native Himachali tree (₹299).",
      "Buy a Climate Impact Pack — 10 trees, full impact report.",
      "Start a workplace forest sponsorship program.",
      "Read our blog on agroforestry vs monoculture plantations.",
    ],
    himachalAngle: `Himachal's forest cover is among the richest in India per capita. The state's deodar, oak, kail and chil forests are critical to Himalayan biodiversity, water cycles and slope stability. Every Himsols tree extends this living infrastructure.`,
    faqs: [
      { q: "When is International Day of Forests?", a: "The International Day of Forests is observed every year on March 21, as declared by the UN General Assembly in 2012." },
      { q: "Why are forests important?", a: "Forests host 80% of terrestrial biodiversity, absorb 2.6 billion tonnes of CO₂ annually, regulate water cycles, prevent soil erosion, and support over 1.6 billion livelihoods globally." },
      { q: "What can I do for forests in India?", a: "Sponsor verified plantations, avoid products linked to deforestation, support agroforestry initiatives, and contribute to organizations like Himsols that track plantations long-term." },
    ],
    keywords: "International Day of Forests 2026, March 21 forest day, अंतरराष्ट्रीय वन दिवस, save forests India, Himachal forests",
  },
  {
    slug: "world-water-day",
    name: "World Water Day",
    nameHi: "विश्व जल दिवस",
    date: "03-22",
    dateLabel: "March 22",
    theme: "Water for Peace & Glaciers Preservation",
    metaTitle: `World Water Day ${Y} — Trees Save Water | Himsols`,
    metaDescription: `World Water Day ${Y}: trees recharge groundwater and protect Himalayan glaciers. Sponsor a tree in Himachal Pradesh from ₹299.`,
    heroHeadline: `World Water Day ${Y} — Plant Trees, Save Water`,
    heroHeadlineHi: `विश्व जल दिवस ${Y} — पेड़ लगाओ, पानी बचाओ`,
    subhead: "Trees are nature's water infrastructure. Sponsor a Himachali tree this World Water Day.",
    history: `World Water Day has been observed on March 22 every year since 1993, when the United Nations General Assembly designated it to highlight the importance of freshwater. The day is coordinated by UN-Water and supports the achievement of Sustainable Development Goal 6: water and sanitation for all by 2030. Each year, a new theme draws attention to a specific aspect of freshwater — from groundwater to glaciers to water and peace.`,
    whyItMatters: `Over 2 billion people live without access to safely managed drinking water. In India, groundwater depletion is among the fastest in the world. Trees are critical to the water cycle — they recharge groundwater, reduce surface runoff, stabilize riverbanks, and (in Himalayan regions) protect glacier-fed catchments. A mature tree can transpire hundreds of litres of water daily, regulating microclimates and rainfall patterns. Planting trees in the Himachal catchment directly supports the water security of millions downstream.`,
    howToCelebrate: [
      "Sponsor a tree in a Himalayan catchment (₹299).",
      "Read our blog on how trees recharge groundwater.",
      "Run a school awareness program on water and forests.",
    ],
    himachalAngle: `Himachal Pradesh feeds five major Indian rivers — the Sutlej, Beas, Ravi, Chenab and Yamuna tributaries. Plantations on Himachali slopes directly protect the water security of Punjab, Haryana, Delhi and the entire northern plains.`,
    faqs: [
      { q: "When is World Water Day?", a: "World Water Day is observed every year on March 22, since 1993." },
      { q: "How do trees help save water?", a: "Trees intercept rainfall, slow runoff, increase soil infiltration, recharge groundwater aquifers, and reduce evaporation by shading the ground." },
      { q: "Why plant trees in Himachal for water security?", a: "Himachal's slopes feed major Indian rivers. Healthy forests here mean steady river flows, reduced flash floods, and reliable water for the entire northern plains." },
    ],
    keywords: "World Water Day 2026, विश्व जल दिवस, March 22, save water trees, Himalayan water security",
  },
  {
    slug: "world-nature-conservation-day",
    name: "World Nature Conservation Day",
    nameHi: "विश्व प्रकृति संरक्षण दिवस",
    date: "07-28",
    dateLabel: "July 28",
    theme: "Conserve Nature for Future Generations",
    metaTitle: `World Nature Conservation Day ${Y} — Conserve India's Forests | Himsols`,
    metaDescription: `World Nature Conservation Day ${Y} (July 28) — protect biodiversity by sponsoring verified trees in Himachal Pradesh from ₹299.`,
    heroHeadline: `World Nature Conservation Day ${Y} — Action Over Awareness`,
    heroHeadlineHi: `विश्व प्रकृति संरक्षण दिवस ${Y}`,
    subhead: "Turn July 28 into a planted tree on Himachali farmer land — verified, tracked, real.",
    history: `World Nature Conservation Day is observed on July 28 every year. While its exact origin is debated, the day has become a global occasion to recognize that a healthy environment is the foundation of a stable and productive society. It encourages individuals and organizations to participate in the conservation of natural resources — water, soil, air, biodiversity and forests.`,
    whyItMatters: `Conservation is no longer optional. India has lost significant biodiversity in the last 50 years to urbanization, agriculture expansion and monoculture plantations. Genuine conservation means planting native, biodiverse species — not just any tree. Himsols' agroforestry model emphasizes mixed-species, native plantations that rebuild soil, support pollinators, and create farmer income simultaneously.`,
    howToCelebrate: [
      "Sponsor a native tree species on Himsols.",
      "Donate to a conservation-focused campaign.",
      "Educate your community about agroforestry.",
    ],
    himachalAngle: `Himachal hosts species like the Himalayan monal, snow leopard, musk deer and over 3,000 plant species. Conserving Himachali land conserves a national biodiversity treasure.`,
    faqs: [
      { q: "When is World Nature Conservation Day?", a: "World Nature Conservation Day is observed every year on July 28." },
      { q: "What is the purpose of Nature Conservation Day?", a: "It highlights the importance of conserving natural resources — water, soil, air, biodiversity and forests — for present and future generations." },
      { q: "How can I conserve nature on a personal level?", a: "Reduce waste, choose verified plantation programs over greenwashing, support local farmers, and minimize fossil-fuel-intensive consumption." },
    ],
    keywords: "World Nature Conservation Day 2026, July 28, nature conservation India, biodiversity Himachal, सरंक्षण दिवस",
  },
  {
    slug: "world-ozone-day",
    name: "World Ozone Day",
    nameHi: "विश्व ओजोन दिवस",
    date: "09-16",
    dateLabel: "September 16",
    theme: "Montreal Protocol — Healing the Ozone Layer",
    metaTitle: `World Ozone Day ${Y} — Climate Action in India | Himsols`,
    metaDescription: `World Ozone Day ${Y} (September 16) marks the Montreal Protocol. Take climate action — sponsor a verified tree in Himachal from ₹299.`,
    heroHeadline: `World Ozone Day ${Y} — From Treaty to Trees`,
    heroHeadlineHi: `विश्व ओजोन दिवस ${Y}`,
    subhead: "The Montreal Protocol proved global climate action works. Take yours — plant a verified tree.",
    history: `World Ozone Day, officially the International Day for the Preservation of the Ozone Layer, is observed on September 16 each year. It commemorates the date of the signing of the Montreal Protocol on Substances that Deplete the Ozone Layer in 1987. The Montreal Protocol is widely considered the most successful environmental treaty in history — every UN member nation has ratified it, and the ozone layer is now on track to recover by mid-century.`,
    whyItMatters: `The Montreal Protocol's success proves that coordinated global climate action works. World Ozone Day is a reminder that climate problems are solvable — but only with sustained, verified action. Tree plantation is the citizen-level equivalent of treaty-level action: small individual commitments, aggregated and verified, compound into climate-scale impact.`,
    howToCelebrate: [
      "Sponsor a tree on Himsols (₹299).",
      "Learn about HFC alternatives and reduce your refrigeration footprint.",
      "Run an office awareness session.",
    ],
    himachalAngle: `Himachal's high-altitude plantations are particularly important — UV stress is higher and tree cover regulates surface temperatures across the Himalayas.`,
    faqs: [
      { q: "When is World Ozone Day?", a: "World Ozone Day is observed every year on September 16, marking the signing of the Montreal Protocol in 1987." },
      { q: "What is the Montreal Protocol?", a: "An international treaty signed in 1987 to phase out the production of substances that deplete the ozone layer. It is the most successful environmental treaty in history." },
      { q: "How is the ozone layer doing today?", a: "Thanks to the Montreal Protocol, the ozone layer is recovering and is expected to return to 1980 levels by around 2066 over Antarctica." },
    ],
    keywords: "World Ozone Day 2026, September 16, Montreal Protocol, विश्व ओजोन दिवस, ozone layer protection",
  },
  {
    slug: "national-pollution-control-day",
    name: "National Pollution Control Day",
    nameHi: "राष्ट्रीय प्रदूषण नियंत्रण दिवस",
    date: "12-02",
    dateLabel: "December 2",
    theme: "Remembering Bhopal — Acting on Pollution",
    metaTitle: `National Pollution Control Day ${Y} — Fight Pollution with Trees | Himsols`,
    metaDescription: `National Pollution Control Day ${Y} (December 2) honours Bhopal victims. Fight pollution with verified Himachali trees from ₹299.`,
    heroHeadline: `National Pollution Control Day ${Y} — Trees Against Toxicity`,
    heroHeadlineHi: `राष्ट्रीय प्रदूषण नियंत्रण दिवस ${Y}`,
    subhead: "December 2 honours the Bhopal Gas Tragedy victims. Honour them with action.",
    history: `National Pollution Control Day is observed in India on December 2 every year in memory of the thousands of people who lost their lives in the Bhopal Gas Tragedy of December 2–3, 1984 — the world's worst industrial disaster, caused by the leak of methyl isocyanate gas from the Union Carbide pesticide plant. The day is observed to spread awareness about industrial disasters, the importance of pollution control, and to honour those who died.`,
    whyItMatters: `India ranks among the most polluted countries in the world. Delhi, Kolkata, Mumbai and most tier-1 cities routinely register AQI levels considered hazardous. Trees are nature's air filters — a single mature tree can absorb up to 22 kg of CO₂ per year, plus particulate matter, sulphur dioxide and nitrogen oxides. Large-scale, verified plantation is one of the most cost-effective long-term tools against air pollution.`,
    howToCelebrate: [
      "Sponsor a tree (₹299) in memory of Bhopal victims.",
      "Read about the Bhopal Gas Tragedy and industrial safety.",
      "Pledge to reduce your household pollution footprint.",
    ],
    himachalAngle: `Trees planted in Himachal protect air quality across northern India — Himalayan forests act as a regional buffer against pollution drift from the plains.`,
    faqs: [
      { q: "When is National Pollution Control Day?", a: "National Pollution Control Day is observed in India on December 2 every year." },
      { q: "Why is National Pollution Control Day observed on December 2?", a: "It marks the anniversary of the 1984 Bhopal Gas Tragedy, the world's worst industrial disaster, in which thousands lost their lives to a methyl isocyanate gas leak." },
      { q: "How do trees reduce pollution?", a: "Trees absorb CO₂, particulate matter, SO₂ and NOx, release oxygen, and cool urban heat islands. Large-scale plantation is among the most cost-effective long-term pollution control measures." },
    ],
    keywords: "National Pollution Control Day 2026, December 2, Bhopal Gas Tragedy, राष्ट्रीय प्रदूषण नियंत्रण दिवस, pollution control India",
  },
];

export const getDayBySlug = (slug: string) =>
  SUSTAINABILITY_DAYS.find((d) => d.slug === slug);
