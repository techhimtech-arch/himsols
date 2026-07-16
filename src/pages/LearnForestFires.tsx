import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, useMotionValue, animate } from "framer-motion";
import { ArrowRight, Flame, TreePine, AlertTriangle, Wind, Sprout, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import fireImg from "@/assets/learn/forest-fire-aftermath.jpg";
import mistImg from "@/assets/learn/hero-forest-mist.jpg";

const Counter = ({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const val = useMotionValue(0);
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!inView) return;
    const c = animate(val, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString("en-IN")),
    });
    return () => c.stop();
  }, [inView, to, duration, val]);
  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
};

const ChapterLabel = ({ n, title }: { n: string; title: string }) => (
  <div className="mb-6">
    <p className="text-[11px] tracking-[0.4em] uppercase text-amber-400/80">{n}</p>
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
        <img src={fireImg} alt="" className="w-full h-full object-cover opacity-75" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
      <motion.div style={{ opacity }} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="text-[11px] tracking-[0.4em] uppercase text-amber-300/90 mb-6"
        >
          {isHi ? "जंगल की आग" : "Forest fires"}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.02] tracking-tight max-w-5xl"
        >
          {isHi ? (
            <>
              हर गर्मी.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400">
                पहाड़ जलते हैं.
              </span>
            </>
          ) : (
            <>
              Every summer.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400">
                The mountains burn.
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
            ? "अप्रैल से जून — हिमाचल के जंगलों की सबसे कमज़ोर घड़ी।"
            : "April to June — the most fragile weeks in Himachal's forests."}
        </motion.p>
      </motion.div>
    </section>
  );
};

const Scale = ({ isHi }: { isHi: boolean }) => (
  <section className="relative py-32 px-6 bg-[#0a0805] text-white">
    <div className="max-w-6xl mx-auto">
      <ChapterLabel n="01" title={isHi ? "पैमाना" : "The scale"} />
      <h2 className="text-4xl md:text-6xl font-bold leading-tight max-w-4xl mb-16">
        {isHi ? "एक सीज़न में हज़ारों घटनाएँ." : "Thousands of incidents in a single season."}
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            stat: <><Counter to={2000} suffix="+" /></>,
            label: isHi ? "आग की घटनाएँ (2022 सीज़न, HP)" : "Fire incidents (2022 season, HP)",
            note: isHi ? "स्रोत: FSI रिपोर्ट (अनुमान)।" : "Source: FSI reports (estimate).",
          },
          {
            stat: <>~<Counter to={90} suffix="%" /></>,
            label: isHi ? "मानव-जनित कारण" : "Human-caused",
            note: isHi ? "चरवाहों की आग, बीड़ी, कृषि जलाना।" : "Grazier fires, bidis, agri-burning.",
          },
          {
            stat: <><Counter to={22} suffix=" kg" /></>,
            label: isHi ? "CO₂ प्रति पेड़ प्रति वर्ष (खो जाता है)" : "CO₂ per tree per year — lost",
            note: isHi ? "अनुमान। जलने पर वापस हवा में।" : "Estimate. Released back into the air when burnt.",
          },
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.15 }}
            className="p-8 rounded-2xl bg-white/[0.03] border border-white/10"
          >
            <div className="text-5xl md:text-6xl font-bold text-amber-300 mb-3">{c.stat}</div>
            <p className="text-white/80 font-semibold">{c.label}</p>
            <p className="text-white/40 text-sm mt-2">{c.note}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const WhyItMatters = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-40, 60]);
  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center overflow-hidden bg-black text-white">
      <motion.div style={{ y }} className="absolute inset-0">
        <img src={mistImg} alt="" className="w-full h-full object-cover opacity-30" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <ChapterLabel n="02" title={isHi ? "आग सिर्फ पेड़ नहीं जलाती" : "It's not just trees that burn"} />
        <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
          {isHi ? "मिट्टी, पानी, हवा — और आजीविका." : "Soil, water, air — and livelihoods."}
        </h2>
        <div className="space-y-5 text-lg text-white/70 leading-relaxed max-w-3xl">
          <p>
            {isHi
              ? "आग के बाद ऊपरी मिट्टी की परत सूख जाती है। पहली बारिश में वो मिट्टी नदियों में बह जाती है — पानी गंदा, नीचे गाँवों में बाढ़, और पहाड़ पर पौधा दोबारा नहीं जमता।"
              : "After a fire, the topsoil goes brittle. The first monsoon washes it down into the rivers — muddy water, downstream floods, and a hillside that struggles to regrow."}
          </p>
          <p>
            {isHi
              ? "चीड़ पाइन (जिसमें राल होती है) सबसे तेज़ जलता है। ओक और देवदार धीरे जलते हैं। इसीलिए हम मिश्रित देशी बागान लगाते हैं — मोनोकल्चर नहीं।"
              : "Chir pine (heavy with resin) burns fastest. Oak and deodar burn slower. That's why we plant mixed native cohorts — never monoculture."}
          </p>
          <p>
            {isHi
              ? "किसान परिवार जिनके लिए ये जंगल चारा, ईंधन और शहद देता है — उनकी आजीविका सीधे इससे जुड़ी है।"
              : "For farmer families who depend on these forests for fodder, fuel and honey — livelihoods are directly tied to a healthy canopy."}
          </p>
        </div>
      </div>
    </section>
  );
};

const WhatHelps = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const items = isHi
    ? [
        { icon: TreePine, title: "मिश्रित देशी प्रजातियाँ", desc: "मोनोकल्चर नहीं। ओक + देवदार + बुरांश एक साथ आग को धीमा करते हैं।" },
        { icon: Wind, title: "फ़ायर लाइनें", desc: "बागान के चारों ओर 3-4 मीटर की खाली पट्टी — आग को फैलने से रोकती है।" },
        { icon: Sprout, title: "मानसून में लगाना", desc: "जुलाई-सितंबर। जब पौधा जड़ पकड़ता है, वो अगली गर्मी झेल सकता है।" },
        { icon: ShieldCheck, title: "किसान की निगरानी", desc: "स्थानीय किसान परिवार जो पौधे के साथ रहते हैं — बहु-वर्षीय इनसेंटिव पर।" },
      ]
    : [
        { icon: TreePine, title: "Mixed native species", desc: "No monoculture. Oak + deodar + rhododendron together slow a fire down." },
        { icon: Wind, title: "Fire lines", desc: "A 3–4 metre cleared strip around each cohort — stops a fire from jumping in." },
        { icon: Sprout, title: "Monsoon planting window", desc: "July–September. A sapling that roots deep in monsoon can survive the next dry summer." },
        { icon: ShieldCheck, title: "Farmer stewardship", desc: "Local farmer families who live beside the trees — on multi-year survival-linked incentives." },
      ];

  return (
    <section ref={ref} className="relative py-32 px-6 bg-[#050d09] text-white">
      <div className="max-w-6xl mx-auto">
        <ChapterLabel n="03" title={isHi ? "क्या मदद करता है" : "What actually helps"} />
        <h2 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl mb-16">
          {isHi ? "जल्दी नहीं. सही तरीके से." : "Not fast. Just right."}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/40 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <it.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">{it.title}</h3>
              <p className="text-white/60 leading-relaxed">{it.desc}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 text-sm text-white/40 max-w-2xl">
          {isHi
            ? "* आँकड़े FSI (भारत वन सर्वेक्षण) रिपोर्टों और सार्वजनिक स्रोतों पर आधारित अनुमान हैं।"
            : "* Figures are estimates based on public Forest Survey of India reports and open sources."}
        </p>
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
        {isHi ? "जो जल गया — उसे वापस लगाओ." : "What burned — bring it back."}
      </motion.h2>
      <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
        {isHi
          ? "हर पेड़ जो हम लगाते हैं वो एक मानसून की ज़मीन को थोड़ा और मज़बूत बनाता है।"
          : "Every tree we plant makes one more monsoon hillside a little more stable."}
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

const LearnForestFires = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  return (
    <div className="bg-black">
      <SEO
        title={
          isHi
            ? "हिमाचल में जंगल की आग — कारण, असर, और समाधान | Himsols"
            : "Forest fires in Himachal — causes, impact, and what actually helps | Himsols"
        }
        description={
          isHi
            ? "हिमाचल प्रदेश के जंगलों में हर गर्मी आग की सिनेमैटिक कहानी — पैमाना, कारण, और मिश्रित देशी बागान क्यों मायने रखते हैं।"
            : "A cinematic story of Himachal's summer forest fires — the scale, the causes, and why mixed native cohorts matter."
        }
        url="https://himsols.com/learn/forest-fires"
      />
      <Navbar />
      <main>
        <Hero isHi={isHi} />
        <Scale isHi={isHi} />
        <WhyItMatters isHi={isHi} />
        <WhatHelps isHi={isHi} />
        <CTA isHi={isHi} />
      </main>
      <Footer />
    </div>
  );
};

export default LearnForestFires;
