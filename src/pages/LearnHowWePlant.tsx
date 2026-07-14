import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, useMotionValue, animate } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Sprout,
  CloudRain,
  Users,
  ShieldCheck,
  FileCheck,
  Leaf,
  Camera,
  TreePine,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import forestHero from "@/assets/learn/forest-hero.jpg";
import mountains from "@/assets/learn/himachal-mountains.jpg";
import monsoonHills from "@/assets/learn/monsoon-hills.jpg";
import planting from "@/assets/learn/planting-day.jpg";
import saplingGrowth from "@/assets/learn/sapling-growth.jpg";
import farmerPortrait from "@/assets/learn/farmer-portrait.jpg";
import saplingHands from "@/assets/learn/sapling-hands.jpg";

/* --------------------------- helpers --------------------------- */

const Counter = ({ to, duration = 2, suffix = "" }: { to: number; duration?: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const val = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(val, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString("en-IN")),
    });
    return () => controls.stop();
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
    <p className="text-[11px] tracking-[0.4em] uppercase text-emerald-400/80">{n}</p>
    <p className="text-xs tracking-[0.3em] uppercase text-white/40 mt-1">{title}</p>
  </div>
);

/* --------------------------- chapters --------------------------- */

const Hero = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const words = isHi
    ? ["एक", "बीज", "से", "एक", "जंगल", "तक."]
    : ["From", "one", "seed.", "To", "a", "forest."];

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden bg-black">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={forestHero} alt="" className="w-full h-full object-cover opacity-70" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black" />

      <motion.div
        style={{ opacity }}
        className="relative h-full flex flex-col justify-center items-center text-center px-6 text-white"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xs tracking-[0.5em] uppercase text-emerald-300 mb-8"
        >
          {isHi ? "हम कैसे लगाते हैं" : "How we plant"}
        </motion.p>
        <h1 className="text-5xl md:text-8xl font-bold leading-[0.95] max-w-5xl flex flex-wrap justify-center gap-x-4 gap-y-2">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.7 }}
            >
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="mt-10 text-lg text-white/70 max-w-xl"
        >
          {isHi
            ? "छह असली कदम. हिमाचल की मिट्टी में. किसानों के साथ."
            : "Six real steps. In Himachal soil. With verified farmers."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 text-xs tracking-widest"
        >
          <span>{isHi ? "स्क्रॉल करें" : "SCROLL"}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="w-px h-10 bg-white/30"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

const Step1Land = ({ isHi }: { isHi: boolean }) => (
  <section className="relative py-32 px-6 bg-gradient-to-b from-black to-emerald-950 text-white overflow-hidden">
    <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <ChapterLabel n={isHi ? "अध्याय 01" : "Chapter 01"} title={isHi ? "ज़मीन" : "The land"} />
        <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          {isHi ? "पहले किसान. फिर पेड़." : "First the farmer. Then the tree."}
        </h2>
        <p className="text-lg text-white/70 leading-relaxed mb-8">
          {isHi
            ? "हिमाचल के कांगड़ा, मंडी, कुल्लू, शिमला की छोटी टेरेस्ड ज़मीनें. हर किसान वेरिफ़ाई होता है — आधार, ज़मीन के कागज़, और साइट विज़िट. बिना असली मालिक, कोई पेड़ नहीं."
            : "Small terraced plots across Kangra, Mandi, Kullu, and Shimla in Himachal Pradesh. Every partner farmer is verified — Aadhaar, land ownership documents, and an on-site check. No verified owner, no planting."}
        </p>
        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
          {[
            { icon: Users, n: 50, s: "", l: isHi ? "पायलट किसान (मानसून 2026)" : "Pilot farmers (Monsoon 2026)" },
            { icon: MapPin, n: 7, s: "", l: isHi ? "ज़िले" : "Districts" },
            { icon: ShieldCheck, n: 100, s: "%", l: isHi ? "आधार + ज़मीन वेरिफ़ाई" : "Aadhaar + land verified" },
          ].map((s, i) => (
            <div key={i}>
              <s.icon className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="text-3xl font-bold text-emerald-300">
                <Counter to={s.n} />
                {s.s}
              </p>
              <p className="text-xs text-white/50 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(16,185,129,0.4)]"
      >
        <img src={mountains} alt="" loading="lazy" className="w-full h-[520px] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-xs tracking-widest uppercase text-emerald-300">Site</p>
          <p className="text-2xl font-semibold">Himachal Pradesh · 900–2100 m</p>
        </div>
      </motion.div>
    </div>
  </section>
);

const Step2Species = ({ isHi }: { isHi: boolean }) => {
  const species = [
    { name: "Deodar", hi: "देवदार", note: isHi ? "उच्च हिमालयी, दीर्घायु" : "High altitude, long-lived" },
    { name: "Oak (Ban)", hi: "बान ओक", note: isHi ? "जल-संचय, देशी" : "Water-retaining, native" },
    { name: "Kail Pine", hi: "कैल", note: isHi ? "ठंडी ढलानें" : "Cool slopes" },
    { name: "Horse Chestnut", hi: "बनखोर", note: isHi ? "छायादार" : "Broad canopy" },
    { name: "Walnut", hi: "अखरोट", note: isHi ? "किसान आमदनी" : "Farmer income" },
    { name: "Wild Apricot", hi: "चुल्ली", note: isHi ? "मिट्टी बंधक" : "Slope binder" },
    { name: "Rhododendron", hi: "बुरांश", note: isHi ? "मध्य ऊँचाई" : "Mid altitude" },
    { name: "Toon", hi: "तून", note: isHi ? "तेज़ बढ़त" : "Fast growth" },
  ];
  return (
    <section className="py-32 px-6 bg-emerald-950 text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <ChapterLabel n={isHi ? "अध्याय 02" : "Chapter 02"} title={isHi ? "प्रजाति" : "Species match"} />
          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            {isHi ? "कोई विदेशी नहीं. सिर्फ़ देशी." : "No exotics. Only native."}
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            {isHi
              ? "हर साइट के लिए ऊँचाई, बारिश, मिट्टी और ढलान देखकर देशी प्रजाति चुनी जाती है. Eucalyptus या तेज़ बढ़ने वाले विदेशी पेड़ नहीं लगाते — वो पानी सोख लेते हैं और ज़मीन को कमज़ोर करते हैं."
              : "Every site is matched by altitude, rainfall, soil and slope to a Himalayan native. We do not plant Eucalyptus or fast-growing exotics — they deplete groundwater and destabilise soil."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
          {species.map((sp, i) => (
            <motion.div
              key={sp.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition-colors"
            >
              <Leaf className="h-5 w-5 text-emerald-400 mb-3" />
              <p className="font-semibold text-lg">{isHi ? sp.hi : sp.name}</p>
              {!isHi && <p className="text-xs text-white/40 mt-0.5">{sp.hi}</p>}
              <p className="text-xs text-white/60 mt-2">{sp.note}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Step3Monsoon = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  return (
    <section ref={ref} className="relative h-[100vh] w-full overflow-hidden bg-black text-white">
      <motion.div style={{ y }} className="absolute inset-0">
        <img src={monsoonHills} alt="" loading="lazy" className="w-full h-[120%] object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      <div className="relative h-full flex items-center px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <ChapterLabel n={isHi ? "अध्याय 03" : "Chapter 03"} title={isHi ? "मानसून" : "The monsoon window"} />
            <h2 className="text-5xl md:text-7xl font-bold leading-[1] mb-8 max-w-3xl">
              {isHi
                ? "जुलाई से सितंबर. सिर्फ़ तीन महीने."
                : "July to September. Only three months."}
            </h2>
            <p className="text-lg text-white/75 max-w-2xl leading-relaxed">
              {isHi
                ? "हिमाचल का मानसून पौधे की जड़ों को बिना सिंचाई के बसाने का सबसे अच्छा मौसम है. इस विंडो के बाहर लगाना — पानी बर्बाद करना और मरने की दर बढ़ाना है."
                : "The Himachal monsoon is the only window where a young sapling can establish its root system without artificial irrigation. Planting outside it wastes water and pushes mortality up."}
            </p>

            <div className="mt-14 flex flex-wrap gap-3">
              {["JUL", "AUG", "SEP"].map((m, i) => (
                <motion.div
                  key={m}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="px-6 py-3 rounded-full border border-emerald-400/40 bg-emerald-400/10 backdrop-blur-sm text-emerald-300 font-mono tracking-widest text-sm flex items-center gap-2"
                >
                  <CloudRain className="h-4 w-4" />
                  {m}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Step4PlantingDay = ({ isHi }: { isHi: boolean }) => {
  const steps = isHi
    ? [
        { t: "गड्ढा", d: "45 × 45 × 45 सेमी — जड़ों को साँस लेने की जगह." },
        { t: "मिट्टी", d: "स्थानीय टॉपसॉइल + जैविक खाद. कोई रसायन नहीं." },
        { t: "पौधा", d: "6–12 महीने का नर्सरी सैप्लिंग, स्वस्थ जड़ें." },
        { t: "जियो-टैग", d: "GPS पिन, तारीख, फोटो — रिकॉर्ड में सेव." },
      ]
    : [
        { t: "The pit", d: "45 × 45 × 45 cm — enough room for roots to breathe." },
        { t: "The soil", d: "Local topsoil mixed with organic compost. No chemicals." },
        { t: "The sapling", d: "6–12 month nursery sapling with a healthy root ball." },
        { t: "The geo-tag", d: "GPS pin, date and photo — logged into the record." },
      ];

  return (
    <section className="py-32 px-6 bg-white">
      <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden order-2 md:order-1 shadow-2xl"
        >
          <img src={planting} alt="" loading="lazy" className="w-full h-[560px] object-cover" />
          <div className="absolute top-4 left-4 rounded-full bg-emerald-500/90 text-white px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
            <Camera className="h-3 w-3" /> {isHi ? "जियो-टैग्ड" : "Geo-tagged"}
          </div>
        </motion.div>

        <div className="order-1 md:order-2">
          <p className="text-[11px] tracking-[0.4em] uppercase text-emerald-700 mb-1">
            {isHi ? "अध्याय 04" : "Chapter 04"}
          </p>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
            {isHi ? "प्लांटिंग डे" : "Planting day"}
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-emerald-950 leading-tight mb-10">
            {isHi ? "एक पेड़. चार क़दम." : "One tree. Four steps."}
          </h2>

          <div className="space-y-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono text-sm font-bold">
                  0{i + 1}
                </div>
                <div>
                  <p className="text-lg font-semibold text-emerald-950">{s.t}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Step5Survival = ({ isHi }: { isHi: boolean }) => (
  <section className="py-32 px-6 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white">
    <div className="container mx-auto max-w-6xl">
      <div className="max-w-3xl mb-16">
        <ChapterLabel n={isHi ? "अध्याय 05" : "Chapter 05"} title={isHi ? "जीवित रखना" : "Keeping it alive"} />
        <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          {isHi
            ? "लगाना आसान है. जिंदा रखना असली काम है."
            : "Planting is easy. Keeping it alive is the real work."}
        </h2>
        <p className="text-lg text-white/70 leading-relaxed">
          {isHi
            ? "हर पेड़ के लिए किसान को बहु-वर्षीय सर्वाइवल इंसेंटिव मिलता है — पेड़ जिंदा रहा, तो पैसा मिला. इसलिए किसान खुद पानी, बाड़ और देखभाल करता है."
            : "For every tree, the partner farmer earns a multi-year survival incentive — the tree lives, the farmer earns. That flips the incentive: the farmer waters, fences and cares for it themselves."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Sprout,
            title: isHi ? "साल 1 — बसना" : "Year 1 — Establishment",
            desc: isHi
              ? "साप्ताहिक चेक, पानी, बाड़. सबसे कमज़ोर साल."
              : "Weekly checks, watering, fencing. The most fragile year.",
          },
          {
            icon: TreePine,
            title: isHi ? "साल 2–3 — जड़ें" : "Year 2–3 — Rooting",
            desc: isHi
              ? "जानवरों से सुरक्षा, ज़रूरत पर खाद. सर्वाइवल फोटो."
              : "Animal protection, compost if needed. Survival photos logged.",
          },
          {
            icon: ShieldCheck,
            title: isHi ? "किसान इंसेंटिव" : "Farmer incentive",
            desc: isHi
              ? "बहु-वर्षीय भुगतान जो सर्वाइवल पर टिका है — जिंदा पेड़, टिकाऊ आमदनी."
              : "Multi-year payout tied to survival — a living tree means recurring income.",
          },
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-8"
          >
            <c.icon className="h-8 w-8 text-emerald-400 mb-5" />
            <h3 className="text-xl font-semibold mb-3">{c.title}</h3>
            <p className="text-sm text-white/60 leading-relaxed">{c.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-16 grid md:grid-cols-2 gap-10 items-center"
      >
        <div className="relative rounded-3xl overflow-hidden">
          <img src={farmerPortrait} alt="" loading="lazy" className="w-full h-[420px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-xs tracking-widest uppercase text-emerald-300">
              {isHi ? "साझेदार किसान" : "Partner farmer"}
            </p>
            <p className="text-xl font-semibold">Kangra district, HP</p>
          </div>
        </div>
        <blockquote className="text-2xl md:text-3xl font-light leading-relaxed border-l-4 border-emerald-400 pl-6">
          {isHi
            ? "\"मेरा पेड़ जिंदा है, तो मेरी आमदनी भी. यही सबसे सीधा हिसाब है.\""
            : "\"My tree stays alive — my income stays alive. It is the simplest deal there is.\""}
        </blockquote>
      </motion.div>
    </div>
  </section>
);

const Step6Certificate = ({ isHi }: { isHi: boolean }) => (
  <section className="py-32 px-6 bg-white">
    <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
      <div>
        <p className="text-[11px] tracking-[0.4em] uppercase text-emerald-700 mb-1">
          {isHi ? "अध्याय 06" : "Chapter 06"}
        </p>
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
          {isHi ? "आपका रिकॉर्ड" : "Your record"}
        </p>
        <h2 className="text-4xl md:text-6xl font-bold text-emerald-950 leading-tight mb-6">
          {isHi ? "प्रमाण. कागज़ पर नहीं — असल में." : "Proof. Not on paper — in the ground."}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          {isHi
            ? "हर योगदान पर आपको मिलता है — प्रजाति का नाम, GPS निर्देशांक, किसान की डिटेल, प्लांटिंग फोटो और डाउनलोड करने योग्य सर्टिफ़िकेट. सर्वाइवल अपडेट अलग से ट्रैक होता है."
            : "For every contribution you receive the species name, GPS coordinates, partner farmer detail, planting photo and a downloadable certificate. Survival updates are tracked separately over time."}
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: MapPin, l: isHi ? "GPS निर्देशांक" : "GPS coordinates" },
            { icon: Camera, l: isHi ? "प्लांटिंग फोटो" : "Planting photo" },
            { icon: Users, l: isHi ? "किसान डिटेल" : "Farmer detail" },
            { icon: FileCheck, l: isHi ? "PDF सर्टिफ़िकेट" : "PDF certificate" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
              <f.icon className="h-5 w-5 text-emerald-700" />
              <span className="text-sm font-medium text-emerald-950">{f.l}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          {isHi
            ? "CO₂ प्रभाव अनुमान है — 22 किग्रा CO₂ / पेड़ / साल के मानक फ़ॉर्मूले पर."
            : "CO₂ impact is an estimate — based on the standard 22 kg CO₂ / tree / year formula."}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative rounded-3xl overflow-hidden shadow-2xl"
      >
        <img src={saplingGrowth} alt="" loading="lazy" className="w-full h-[560px] object-cover" />
      </motion.div>
    </div>
  </section>
);

const Finale = ({ isHi }: { isHi: boolean }) => (
  <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-black text-white">
    <div className="absolute inset-0 opacity-30">
      <img src={saplingHands} alt="" loading="lazy" className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/70 via-emerald-950/60 to-black/90" />

    <div className="relative container mx-auto max-w-4xl text-center">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-xs tracking-[0.4em] uppercase text-emerald-300 mb-6"
      >
        {isHi ? "अंतिम अध्याय" : "Final chapter"}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-5xl md:text-7xl font-bold leading-[1.05] mb-8"
      >
        {isHi ? "अगला पेड़ आपका." : "The next tree is yours."}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-lg text-white/70 max-w-2xl mx-auto mb-12"
      >
        {isHi
          ? "एक असली किसान. एक असली ज़मीन. एक असली सर्टिफ़िकेट."
          : "A real farmer. A real plot. A real record."}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          asChild
          size="lg"
          className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300 text-base h-14 px-8 rounded-full font-semibold"
        >
          <Link to="/single-tree-pack">
            {isHi ? "पेड़ लगाओ — ₹269" : "Plant a tree — ₹269"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-white/30 text-white bg-white/5 hover:bg-white/10 text-base h-14 px-8 rounded-full"
        >
          <Link to="/corporate">{isHi ? "कॉर्पोरेट CSR" : "Corporate CSR"}</Link>
        </Button>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
        className="mt-16 text-xs tracking-widest uppercase text-white/40"
      >
        Himsols · Himachal Pradesh · {new Date().getFullYear()}
      </motion.p>
    </div>
  </section>
);

/* --------------------------- page --------------------------- */

const LearnHowWePlant = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  return (
    <>
      <SEO
        title={
          isHi
            ? "हम कैसे पेड़ लगाते हैं — असली प्रक्रिया | Himsols"
            : "How We Plant — The Real Process | Himsols"
        }
        description={
          isHi
            ? "हिमाचल में सत्यापित किसानों के साथ मानसून में देशी पेड़ लगाने की छह-चरणीय प्रक्रिया. जियो-टैग, सर्वाइवल ट्रैकिंग, असली रिकॉर्ड."
            : "The six-step process behind every tree we plant — verified Himachal farmers, native species, monsoon timing, geo-tags, and survival tracking."
        }
        keywords="how we plant trees, tree plantation process, Himachal reforestation, native species plantation, geo-tagged trees, verified farmer"
        url="https://himsols.com/learn/how-we-plant"
      />
      <Navbar />
      <main>
        <Hero isHi={isHi} />
        <Step1Land isHi={isHi} />
        <Step2Species isHi={isHi} />
        <Step3Monsoon isHi={isHi} />
        <Step4PlantingDay isHi={isHi} />
        <Step5Survival isHi={isHi} />
        <Step6Certificate isHi={isHi} />
        <Finale isHi={isHi} />
      </main>
      <Footer />
    </>
  );
};

export default LearnHowWePlant;
