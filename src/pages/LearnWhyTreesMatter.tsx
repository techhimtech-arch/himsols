import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, useSpring, useMotionValue, animate } from "framer-motion";
import { ArrowRight, Wind, Droplets, Bird, Sun, Sprout, Mountain, Leaf, Heart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import forestHero from "@/assets/learn/forest-hero.jpg";
import saplingHands from "@/assets/learn/sapling-hands.jpg";
import mountains from "@/assets/learn/himachal-mountains.jpg";
import barrenLand from "@/assets/learn/barren-land.jpg";
import greenLand from "@/assets/learn/green-land.jpg";
import farmerPortrait from "@/assets/learn/farmer-portrait.jpg";

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

  return <span ref={ref}>{display}{suffix}</span>;
};

const LeafParticles = () => {
  const leaves = Array.from({ length: 14 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {leaves.map((_, i) => {
        const left = (i * 73) % 100;
        const delay = (i * 0.7) % 6;
        const dur = 10 + (i % 5) * 2;
        return (
          <motion.div
            key={i}
            className="absolute text-emerald-300/60"
            style={{ left: `${left}%`, top: "-10%" }}
            initial={{ y: 0, rotate: 0, opacity: 0 }}
            animate={{
              y: ["0vh", "110vh"],
              rotate: [0, 360],
              x: [0, 30, -20, 10, 0],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
          >
            <Leaf className="h-5 w-5" />
          </motion.div>
        );
      })}
    </div>
  );
};

/* --------------------------- chapters --------------------------- */

const Hero = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const words = isHi
    ? ["एक", "पेड़.", "एक", "साँस.", "एक", "कल."]
    : ["One", "tree.", "One", "breath.", "One", "tomorrow."];

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-black">
      <motion.div style={{ scale, y }} className="absolute inset-0">
        <img src={forestHero} alt="" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80" />
      </motion.div>
      <LeafParticles />
      <motion.div style={{ opacity }} className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs md:text-sm tracking-[0.4em] uppercase text-emerald-300/90 mb-8"
        >
          {isHi ? "हिमसोल्स · एक कहानी" : "Himsols · a story"}
        </motion.p>
        <h1 className="text-5xl md:text-8xl font-bold text-white leading-[1.05] tracking-tight max-w-5xl flex flex-wrap justify-center gap-x-4 gap-y-2">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={i % 2 === 1 ? "text-emerald-300" : ""}
            >
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-10 text-white/70 text-lg max-w-xl"
        >
          {isHi
            ? "नीचे स्क्रॉल करें — हिमाचल में पेड़ लगाने की असली कहानी।"
            : "Scroll down — the real story of planting trees in the Himalayas."}
        </motion.p>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 text-white/60"
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 bg-white/80 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

const Crisis = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const revealX = useTransform(scrollYProgress, [0.2, 0.7], ["0%", "100%"]);

  return (
    <section ref={ref} className="py-32 px-6 bg-neutral-950 text-white relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-amber-400/80 mb-4">
            {isHi ? "अध्याय 01 · संकट" : "Chapter 01 · The crisis"}
          </p>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight max-w-4xl mx-auto">
            {isHi ? "भारत हर साल " : "India emits "}
            <span className="text-amber-400"><Counter to={2900} /> {isHi ? "मिलियन टन" : "million tonnes"}</span>
            {isHi ? " CO₂ छोड़ता है." : " of CO₂ every year."}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-2 rounded-3xl overflow-hidden">
          <div className="relative h-72 md:h-96">
            <img src={barrenLand} alt="" loading="lazy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-xs tracking-widest uppercase text-amber-300 mb-1">{isHi ? "आज" : "Today"}</p>
              <p className="text-2xl font-bold">{isHi ? "सूखी ज़मीन" : "Dry, cracked earth"}</p>
            </div>
          </div>
          <div className="relative h-72 md:h-96 overflow-hidden">
            <img src={barrenLand} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <motion.div style={{ width: revealX }} className="absolute inset-y-0 left-0 overflow-hidden">
              <img src={greenLand} alt="" loading="lazy" className="w-[200%] h-full object-cover" style={{ maxWidth: "none" }} />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-xs tracking-widest uppercase text-emerald-300 mb-1">{isHi ? "क्या हो सकता है" : "What's possible"}</p>
              <p className="text-2xl font-bold">{isHi ? "हरा हिमाचल" : "Reforested land"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { n: 21, s: "%", l: isHi ? "भारत का वन क्षेत्र" : "India's forest cover" },
            { n: 33, s: "%", l: isHi ? "लक्ष्य (2030 तक)" : "Target by 2030" },
            { n: 1.9, s: "B", l: isHi ? "पेड़ चाहिए" : "Trees needed" },
            { n: 22, s: "kg", l: isHi ? "CO₂/पेड़/साल" : "CO₂/tree/year" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center border border-white/10 rounded-2xl p-5 bg-white/[0.02]"
            >
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">
                <Counter to={s.n} />{s.s}
              </p>
              <p className="text-xs text-white/60 mt-2 leading-snug">{s.l}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-white/40 mt-4">
          {isHi ? "स्रोत: FSI, GoI · अनुमान" : "Source: FSI, Govt. of India · estimates"}
        </p>
      </div>
    </section>
  );
};

const OneTree = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const growth = useSpring(useTransform(scrollYProgress, [0.1, 0.7], [0.15, 1]), { stiffness: 60, damping: 20 });
  const dash = useTransform(scrollYProgress, [0.2, 0.8], [283, 0]);

  const benefits = [
    { icon: Wind, t: isHi ? "ऑक्सीजन" : "Oxygen", d: isHi ? "1 दिन में 4 लोगों को" : "For 4 people daily" },
    { icon: Droplets, t: isHi ? "पानी" : "Water", d: isHi ? "भूजल रिचार्ज" : "Recharges groundwater" },
    { icon: Sun, t: isHi ? "छाया" : "Shade", d: isHi ? "8°C तक ठंडक" : "Cools by up to 8°C" },
    { icon: Bird, t: isHi ? "जीवन" : "Life", d: isHi ? "पक्षी, कीट, मिट्टी" : "Birds, insects, soil" },
  ];

  return (
    <section ref={ref} className="py-32 px-6 bg-gradient-to-b from-emerald-50 to-white relative">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-emerald-700 mb-4">
            {isHi ? "अध्याय 02 · एक पेड़" : "Chapter 02 · One tree"}
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-emerald-950 leading-tight max-w-4xl mx-auto">
            {isHi ? "एक पेड़ क्या-क्या करता है?" : "What does one tree really do?"}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative flex items-center justify-center h-[400px]">
            <svg viewBox="0 0 200 200" className="w-72 h-72 -rotate-90">
              <circle cx="100" cy="100" r="45" fill="none" stroke="hsl(150 30% 90%)" strokeWidth="8" />
              <motion.circle
                cx="100" cy="100" r="45" fill="none"
                stroke="hsl(150 55% 42%)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray="283"
                style={{ strokeDashoffset: dash }}
              />
            </svg>
            <motion.div
              style={{ scale: growth }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <p className="text-6xl md:text-7xl font-bold text-emerald-700">
                  <Counter to={22} />
                </p>
                <p className="text-sm text-emerald-800/70 tracking-widest uppercase mt-1">
                  {isHi ? "किग्रा CO₂ / साल" : "kg CO₂ / year"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {isHi ? "· अनुमान ·" : "· estimate ·"}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="space-y-4">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <b.icon className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-950 text-lg">{b.t}</h3>
                  <p className="text-sm text-muted-foreground">{b.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Himachal = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const midY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const facts = [
    { icon: Mountain, l: isHi ? "68% वन आवरण लक्ष्य" : "68% forest cover goal" },
    { icon: Droplets, l: isHi ? "मानसून जुलाई-अगस्त" : "Monsoon Jul–Aug" },
    { icon: Sprout, l: isHi ? "देशी प्रजातियाँ" : "Native species" },
    { icon: Heart, l: isHi ? "250+ किसान पार्टनर" : "250+ farmer partners" },
  ];

  return (
    <section ref={ref} className="relative h-[110vh] overflow-hidden bg-slate-900">
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-125">
        <img src={mountains} alt="" loading="lazy" className="w-full h-full object-cover opacity-80" />
      </motion.div>
      <motion.div style={{ y: midY }} className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900" />

      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs tracking-[0.4em] uppercase text-emerald-300 mb-4"
        >
          {isHi ? "अध्याय 03 · जगह" : "Chapter 03 · The place"}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-7xl font-bold max-w-4xl leading-tight"
        >
          {isHi ? "हिमाचल क्यों?" : "Why Himachal?"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-6 max-w-2xl text-white/80 text-lg"
        >
          {isHi
            ? "मिट्टी, ऊँचाई, मानसून — तीनों प्रकृति की तरफ़ से हैं। बस सही हाथ चाहिए।"
            : "Soil, altitude, monsoon — nature is on our side. It just needs the right hands."}
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-4xl">
          {facts.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5 text-center"
            >
              <f.icon className="h-6 w-6 mx-auto mb-2 text-emerald-300" />
              <p className="text-sm text-white/90">{f.l}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Impact = ({ isHi }: { isHi: boolean }) => {
  const [n, setN] = useState(10);
  const co2 = Math.round(n * 22);
  const oxygen = Math.round(n * 118);
  const years = 25;

  return (
    <section className="py-32 px-6 bg-emerald-950 text-white">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-emerald-300 mb-4">
            {isHi ? "अध्याय 04 · तुम्हारा असर" : "Chapter 04 · Your impact"}
          </p>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl mx-auto">
            {isHi ? "अगर तुम " : "If you plant "}
            <span className="text-emerald-300">{n} {isHi ? "पेड़" : "trees"}</span>
            {isHi ? " लगाओ..." : "..."}
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto mb-14">
          <input
            type="range"
            min={1}
            max={100}
            value={n}
            onChange={(e) => setN(+e.target.value)}
            className="w-full accent-emerald-400 h-2"
          />
          <div className="flex justify-between text-xs text-white/50 mt-2">
            <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { v: co2, s: "kg", l: isHi ? "CO₂ ऑफ़सेट / साल" : "CO₂ offset / year", c: "text-emerald-300" },
            { v: oxygen, s: "kg", l: isHi ? "ऑक्सीजन / साल" : "Oxygen / year", c: "text-cyan-300" },
            { v: n * years, s: "", l: isHi ? "पेड़-वर्ष प्रभाव" : "Tree-years of impact", c: "text-amber-300" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center"
            >
              <p className={`text-5xl font-bold ${s.c}`}>
                {s.v.toLocaleString("en-IN")}{s.s && <span className="text-2xl ml-1">{s.s}</span>}
              </p>
              <p className="text-sm text-white/60 mt-3">{s.l}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-white/40 mt-6">
          {isHi ? "अनुमान — 22 किग्रा CO₂/पेड़/साल के मानक फ़ॉर्मूले पर" : "Estimates — based on standard 22 kg CO₂/tree/year formula"}
        </p>
      </div>
    </section>
  );
};

const Story = ({ isHi }: { isHi: boolean }) => {
  return (
    <section className="py-32 px-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-emerald-700 mb-4">
            {isHi ? "अध्याय 05 · लोग" : "Chapter 05 · People"}
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-emerald-950 leading-tight max-w-3xl mx-auto">
            {isHi ? "यह सिर्फ़ पेड़ नहीं — ज़िंदगियाँ हैं." : "It's not just trees. It's lives."}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
          >
            <img src={farmerPortrait} alt="" loading="lazy" className="w-full h-[500px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-sm text-emerald-200">{isHi ? "साझेदार किसान" : "Partner farmer"}</p>
              <p className="text-xl font-semibold">Kangra, Himachal Pradesh</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <blockquote className="text-2xl md:text-3xl font-light text-emerald-950 leading-relaxed border-l-4 border-emerald-500 pl-6">
              {isHi
                ? "\"हर पेड़ मेरे खेत का हिस्सा है. हिमसोल्स की वजह से आमदनी भी है और गर्व भी.\""
                : "\"Every tree is part of my land now. Himsols gave me income and pride together.\""}
            </blockquote>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { n: 250, l: isHi ? "किसान" : "Farmers" },
                { n: 18, l: isHi ? "गाँव" : "Villages" },
                { n: 12, s: "+", l: isHi ? "देशी प्रजातियाँ" : "Native species" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-bold text-emerald-700">
                    <Counter to={s.n} />{s.s || ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Finale = ({ isHi }: { isHi: boolean }) => {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-black text-white">
      <div className="absolute inset-0 opacity-30">
        <img src={saplingHands} alt="" loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/70 via-emerald-950/60 to-black/90" />
      <LeafParticles />

      <div className="relative container mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs tracking-[0.4em] uppercase text-emerald-300 mb-6"
        >
          {isHi ? "अध्याय अंतिम · तुम्हारी बारी" : "Final chapter · your turn"}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-8xl font-bold leading-[1.05] mb-8"
        >
          {isHi ? "कहानी अब तुम्हारी है." : "The story is yours now."}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg text-white/70 max-w-2xl mx-auto mb-12"
        >
          {isHi
            ? "एक पेड़ लगाओ. जियो-टैग्ड फोटो पाओ. सर्वाइवल ट्रैक करो. असली असर देखो."
            : "Plant a verified tree. Get geo-tagged photos. Track survival. See real impact."}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300 text-base h-14 px-8 rounded-full font-semibold">
            <Link to="/single-tree-pack">
              {isHi ? "पेड़ लगाओ — ₹269" : "Plant a tree — ₹269"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/30 text-white bg-white/5 hover:bg-white/10 text-base h-14 px-8 rounded-full">
            <Link to="/corporate">
              {isHi ? "कॉर्पोरेट CSR" : "Corporate CSR"}
            </Link>
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
};

/* --------------------------- page --------------------------- */

const LearnWhyTreesMatter = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  return (
    <>
      <SEO
        title={isHi ? "पेड़ क्यों मायने रखते हैं — एक कहानी | Himsols" : "Why Trees Matter — An Immersive Story | Himsols"}
        description={isHi
          ? "एक पेड़ 22 किग्रा CO₂ सोखता है. हिमाचल में असली प्लांटेशन कैसे काम करता है — विज़ुअल कहानी में देखें."
          : "One tree absorbs 22 kg CO₂/year. See how verified plantation in Himachal actually works — an immersive visual story."}
        keywords="why trees matter, sustainability story, tree plantation impact, CO2 offset, Himachal forestry, environmental education"
        url="https://himsols.com/learn/why-trees-matter"
      />
      <Navbar />
      <main>
        <Hero isHi={isHi} />
        <Crisis isHi={isHi} />
        <OneTree isHi={isHi} />
        <Himachal isHi={isHi} />
        <Impact isHi={isHi} />
        <Story isHi={isHi} />
        <Finale isHi={isHi} />
      </main>
      <Footer />
    </>
  );
};

export default LearnWhyTreesMatter;
