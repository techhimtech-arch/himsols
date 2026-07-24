import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, TreePine, Leaf, Mountain, Bird, Droplets } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import jungleHero from "@/assets/learn/himachal-jungle.jpg";
import mountainsMist from "@/assets/learn/hero-forest-mist.jpg";

const ChapterLabel = ({ n, title }: { n: string; title: string }) => (
  <div className="mb-6">
    <p className="text-[11px] tracking-[0.4em] uppercase text-emerald-400/80">{n}</p>
    <p className="text-xs tracking-[0.3em] uppercase text-white/40 mt-1">{title}</p>
  </div>
);

const Hero = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden bg-black">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={jungleHero} alt="" className="w-full h-full object-cover opacity-70" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black" />
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="text-[11px] tracking-[0.4em] uppercase text-emerald-300/90 mb-6"
        >
          {isHi ? "हिमाचल के जंगल" : "The forests of Himachal"}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.02] tracking-tight max-w-5xl"
        >
          {isHi ? (
            <>
              देवदार. ओक.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-400 to-teal-300">
                बुरांश की आग.
              </span>
            </>
          ) : (
            <>
              Deodar. Oak.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-400 to-teal-300">
                Rhododendron fire.
              </span>
            </>
          )}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-8 max-w-2xl text-lg text-white/60"
        >
          {isHi
            ? "समुद्र तल से 300 मीटर से 6000 मीटर तक — एक ही राज्य में चार अलग जंगल।"
            : "From 300 metres to 6000 metres — four distinct forests, one state."}
        </motion.p>
      </motion.div>
    </section>
  );
};

const Zones = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const zones = isHi
    ? [
        { alt: "300–900 m", name: "तराई और उप-उष्णकटिबंधीय", trees: "साल, शीशम, आम, नीम", note: "ऊना, बिलासपुर की गर्म तलहटी।" },
        { alt: "900–1800 m", name: "चीड़ पाइन बेल्ट", trees: "चीड़ पाइन, बान ओक", note: "शिमला, सोलन, कुल्लू निचला — जहाँ हम पौधे लगाते हैं।" },
        { alt: "1800–3000 m", name: "मिश्रित शीतोष्ण", trees: "देवदार, नीली पाइन, बुरांश, कैल", note: "मनाली, नारकंडा, धर्मशाला।" },
        { alt: "3000+ m", name: "अल्पाइन", trees: "जुनिपर, बिर्च, अल्पाइन घास", note: "स्पीति, लाहौल — बहुत नाज़ुक।" },
      ]
    : [
        { alt: "300–900 m", name: "Tropical foothills", trees: "Sal, sheesham, mango, neem", note: "Warm belts of Una and Bilaspur." },
        { alt: "900–1800 m", name: "Chir pine belt", trees: "Chir pine, ban oak", note: "Shimla, Solan, lower Kullu — where we plant." },
        { alt: "1800–3000 m", name: "Mixed temperate", trees: "Deodar, blue pine, rhododendron, kail", note: "Manali, Narkanda, Dharamshala." },
        { alt: "3000+ m", name: "Alpine", trees: "Juniper, birch, alpine meadow", note: "Spiti, Lahaul — very fragile." },
      ];

  return (
    <section ref={ref} className="relative py-32 px-6 bg-[#050d09] text-white">
      <div className="max-w-6xl mx-auto">
        <ChapterLabel n="01" title={isHi ? "ऊँचाई की सीढ़ी" : "The altitude ladder"} />
        <h2 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl mb-16">
          {isHi
            ? "हर 500 मीटर पर, जंगल बदल जाता है."
            : "Every 500 metres, the forest changes."}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {zones.map((z, i) => (
            <motion.div
              key={z.alt}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/40 transition-colors"
            >
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-emerald-300 font-mono text-sm">{z.alt}</span>
                <Mountain className="h-4 w-4 text-white/30" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{z.name}</h3>
              <p className="text-emerald-200/80 text-sm mb-2">{z.trees}</p>
              <p className="text-white/50 text-sm leading-relaxed">{z.note}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Biodiversity = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-40, 60]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center overflow-hidden bg-black text-white">
      <motion.div style={{ y }} className="absolute inset-0">
        <img src={mountainsMist} alt="" className="w-full h-full object-cover opacity-40" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <ChapterLabel n="02" title={isHi ? "क्यों ये जंगल मायने रखते हैं" : "Why these forests matter"} />
        <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
          {isHi
            ? "पानी, हवा, और उत्तर भारत की मिट्टी — सब यहीं से आती है."
            : "Water, air, and the soil of north India — all begin here."}
        </h2>
        <div className="space-y-6 text-lg text-white/70 leading-relaxed max-w-3xl">
          <p>
            {isHi
              ? "हिमाचल का 27% भूभाग जंगल है (FSI 2021)। ये जंगल यमुना, ब्यास, सतलुज और रावी को पानी देते हैं — जिनसे उत्तर भारत के करोड़ों लोग पीते हैं।"
              : "Forests cover ~27% of Himachal (Forest Survey of India 2021). They feed the Yamuna, Beas, Sutlej and Ravi — the rivers that hundreds of millions across north India drink from."}
          </p>
          <p>
            {isHi
              ? "एक स्वस्थ देवदार जंगल एक हेक्टेयर में लगभग 20 टन CO₂ प्रति वर्ष अवशोषित करता है (अनुमान)। हिमालयी काला भालू, कस्तूरी मृग, मोनाल तीतर, और सैकड़ों औषधीय पौधे यहीं मिलते हैं।"
              : "A healthy deodar forest sequesters roughly 20 tonnes of CO₂ per hectare per year (estimate). Himalayan black bear, musk deer, monal pheasant, and hundreds of medicinal plants live only here."}
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: TreePine, label: isHi ? "देशी प्रजातियाँ" : "Native species" },
            { icon: Droplets, label: isHi ? "4 नदियाँ" : "4 major rivers" },
            { icon: Bird, label: isHi ? "500+ पक्षी" : "500+ birds" },
            { icon: Leaf, label: isHi ? "औषधीय पौधे" : "Medicinal plants" },
          ].map((c) => (
            <div key={c.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <c.icon className="h-5 w-5 text-emerald-400" />
              <span className="text-xs text-white/60 text-center">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhereWePlant = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section ref={ref} className="relative py-32 px-6 bg-[#050d09] text-white">
      <div className="max-w-4xl mx-auto">
        <ChapterLabel n="03" title={isHi ? "जहाँ हम पेड़ लगाते हैं" : "Where we plant"} />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold leading-tight mb-8"
        >
          {isHi
            ? "मध्य पहाड़ी बेल्ट — 900 से 2200 मीटर."
            : "The middle hill belt — 900 to 2200 metres."}
        </motion.h2>
        <div className="space-y-5 text-lg text-white/70 leading-relaxed">
          <p>
            {isHi
              ? "यहीं मानसून सबसे उदार है, मिट्टी गहरी है, और किसान परिवार पीढ़ियों से पेड़ों के साथ रहते हैं। हम केवल इसी बेल्ट में लगाते हैं — अल्पाइन में नहीं, क्योंकि वहाँ इकोसिस्टम बहुत नाज़ुक है।"
              : "This is where monsoon is most generous, soils are deep, and farmer families have lived alongside trees for generations. We plant only in this belt — never in alpine zones, whose ecosystems are too fragile."}
          </p>
          <p>
            {isHi
              ? "हम केवल देशी प्रजातियाँ लगाते हैं जो उस विशेष ऊँचाई और मिट्टी के अनुकूल हों — देवदार, बुरांश, बान ओक, वालनट, आँवला, बेदमी। कोई विदेशी सजावटी नहीं।"
              : "We plant only native species matched to that specific altitude and soil — deodar, rhododendron, ban oak, walnut, amla, bedmi. No exotic ornamentals."}
          </p>
        </div>
      </div>
    </section>
  );
};

const CTA = ({ isHi }: { isHi: boolean }) => (
  <section className="relative py-32 px-6 bg-gradient-to-b from-[#050d09] to-emerald-950 text-white overflow-hidden">
    <div className="max-w-3xl mx-auto text-center">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="text-4xl md:text-6xl font-bold leading-tight mb-6"
      >
        {isHi ? "इन जंगलों का हिस्सा बनो." : "Be part of these forests."}
      </motion.h2>
      <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
        {isHi
          ? "एक पेड़ लगाओ — जियो-टैग होगा, ट्रैक होगा, हिमाचल की मिट्टी में रहेगा।"
          : "Plant one tree — geo-tagged, tracked, rooted in Himachal soil."}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/single-tree-pack">
          <Button size="lg" className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold px-8 py-6 rounded-xl group">
            <TreePine className="h-4 w-4" /> {isHi ? "एक पेड़ लगाओ ₹269" : "Plant a tree ₹269"}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link to="/csr-carbon-offset">
          <Button size="lg" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-xl">
            {isHi ? "CSR प्रस्ताव" : "Get CSR Proposal"}
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

const LearnHimachalJungles = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  return (
    <div className="bg-black">
      <SEO
        title={
          isHi
            ? "हिमाचल के जंगल — देवदार, ओक और बुरांश की कहानी | Himsols"
            : "The forests of Himachal — Deodar, Oak, and Rhododendron | Himsols"
        }
        description={
          isHi
            ? "हिमाचल प्रदेश के जंगलों की सिनेमैटिक कहानी — ऊँचाई की सीढ़ी, देशी प्रजातियाँ, और क्यों ये जंगल उत्तर भारत के लिए ज़रूरी हैं।"
            : "A cinematic look at Himachal Pradesh's forests — altitude zones, native species, and why these mountains water half of north India."
        }
        url="https://himsols.online/learn/himachal-jungles"
      />
      <Navbar />
      <main>
        <Hero isHi={isHi} />
        <Zones isHi={isHi} />
        <Biodiversity isHi={isHi} />
        <WhereWePlant isHi={isHi} />
        <CTA isHi={isHi} />
      </main>
      <Footer />
    </div>
  );
};

export default LearnHimachalJungles;
