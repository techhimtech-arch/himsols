import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  animate,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Droplets,
  Zap,
  Utensils,
  Trash2,
  Bike,
  ShoppingBag,
  Sparkles,
  Check,
  Leaf,
  Bus,
  Car,
  Lightbulb,
  Sun,
  Apple,
  Recycle,
  Shirt,
  Wrench,
  Waves,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

/* ---------------- helpers ---------------- */

const Counter = ({
  to,
  duration = 2,
  suffix = "",
  prefix = "",
}: {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const val = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(val, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) =>
        setDisplay(Math.round(v).toLocaleString("en-IN")),
    });
    return () => controls.stop();
  }, [inView, to, duration, val]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

const ChapterLabel = ({
  n,
  title,
  tone = "emerald",
}: {
  n: string;
  title: string;
  tone?: string;
}) => (
  <div className="mb-8">
    <p className={`text-[11px] tracking-[0.4em] uppercase text-${tone}-300/90`}>
      {n}
    </p>
    <p className="text-xs tracking-[0.3em] uppercase text-white/40 mt-1.5">
      {title}
    </p>
  </div>
);

const HabitCard = ({
  icon: Icon,
  title,
  desc,
  i,
}: {
  icon: any;
  title: string;
  desc: string;
  i: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
    className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-white/25 hover:bg-white/[0.06] transition-all"
  >
    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon className="h-5 w-5 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-1.5">{title}</h3>
    <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
  </motion.div>
);

/* ---------------- chapters ---------------- */

const Hero = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const words = isHi
    ? ["छोटी", "आदतें.", "बड़ी", "लहर."]
    : ["Small", "habits.", "Big", "ripple."];

  return (
    <section
      ref={ref}
      className="relative h-screen w-full overflow-hidden bg-[#03080a]"
    >
      {/* Layered gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(56,189,248,0.14),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(251,191,36,0.08),_transparent_55%)]" />
      </div>

      {/* Ripple SVG */}
      <motion.svg
        style={{ y, opacity }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vmin] h-[140vmin] pointer-events-none"
        viewBox="0 0 800 800"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={i}
            cx="400"
            cy="400"
            r="60"
            fill="none"
            stroke="rgba(16,185,129,0.35)"
            strokeWidth="1"
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{
              duration: 6,
              delay: i * 1.2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ transformOrigin: "400px 400px" }}
          />
        ))}
      </motion.svg>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 backdrop-blur-sm mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[11px] tracking-[0.3em] uppercase text-emerald-200">
            {isHi ? "रोज़मर्रा की सस्टेनेबिलिटी" : "Everyday sustainability"}
          </span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.02] tracking-tight max-w-5xl">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.9,
                delay: 0.3 + i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`inline-block mr-3 md:mr-5 ${
                i === 3
                  ? "bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent"
                  : ""
              }`}
            >
              {w}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="text-lg md:text-xl text-white/70 max-w-2xl mt-8 leading-relaxed"
        >
          {isHi
            ? "सात रोज़मर्रा के तरीके जिनसे तुम आज से फ़र्क डाल सकते हो. एक अकेली आदत ज़मीन नहीं बदलती — दस लाख आदतें बदलती हैं."
            : "Seven everyday chapters. One habit will not change the planet — a million habits will."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">
            {isHi ? "स्क्रॉल करो" : "Scroll"}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ------ Water chapter ------ */
const WaterChapter = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const fillHeight = useTransform(scrollYProgress, [0.2, 0.7], ["10%", "92%"]);

  const habits = isHi
    ? [
        { icon: Droplets, title: "छोटा शॉवर", desc: "5 मिनट में नहा लो. एक 10-मिनट का शॉवर ~100 L खर्च करता है (अनुमान)." },
        { icon: Waves, title: "बाल्टी, पाइप नहीं", desc: "गाड़ी धोने या पौधों के लिए बाल्टी — 70% पानी बचता है (अनुमान)." },
        { icon: Recycle, title: "RO का reject water", desc: "पोंछा, फ्लश, बगीचा — रोज़ 15-20 L वापस चक्र में." },
        { icon: Wrench, title: "टपकते नल ठीक करो", desc: "एक टपकता नल = ~15 L/दिन. एक वॉशर 20 रुपये में." },
      ]
    : [
        { icon: Droplets, title: "Shorter showers", desc: "Cap at 5 minutes. A 10-min shower runs ~100 L (est.)." },
        { icon: Waves, title: "Bucket, not hose", desc: "Wash cars & water plants with a bucket — saves ~70% (est.)." },
        { icon: Recycle, title: "Reuse RO reject", desc: "Mopping, flushing, garden — 15–20 L/day back in the loop." },
        { icon: Wrench, title: "Fix drips fast", desc: "A dripping tap wastes ~15 L/day. A ₹20 washer fixes it." },
      ];

  return (
    <section
      ref={ref}
      className="relative py-32 md:py-48 px-6 overflow-hidden bg-gradient-to-b from-[#03080a] via-[#031522] to-[#03080a]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_right,_rgba(56,189,248,0.14),_transparent_60%)]" />
      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <ChapterLabel n="01" title={isHi ? "पानी" : "Water"} tone="sky" />
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            {isHi ? "हर बूँद " : "Every drop "}
            <span className="bg-gradient-to-r from-sky-300 to-cyan-200 bg-clip-text text-transparent">
              {isHi ? "गिनती में है." : "counts."}
            </span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-lg">
            {isHi
              ? "एक टपकता नल एक दिन में लगभग "
              : "A single dripping tap wastes roughly "}
            <span className="text-sky-200 font-semibold">
              <Counter to={15} suffix=" L" />
            </span>
            {isHi ? " पानी बर्बाद करता है. एक साल में — 5,475 L (अनुमान)." : " a day. Over a year — 5,475 L (estimate)."}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {habits.map((h, i) => (
              <HabitCard key={i} {...h} i={i} />
            ))}
          </div>
        </div>

        {/* Water drop SVG that fills on scroll */}
        <div className="relative h-[420px] md:h-[520px] flex items-center justify-center">
          <svg viewBox="0 0 200 260" className="w-full max-w-[300px] h-full">
            <defs>
              <clipPath id="dropClip">
                <path d="M100 10 C 100 10, 30 100, 30 170 A 70 70 0 0 0 170 170 C 170 100, 100 10, 100 10 Z" />
              </clipPath>
              <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            <path
              d="M100 10 C 100 10, 30 100, 30 170 A 70 70 0 0 0 170 170 C 170 100, 100 10, 100 10 Z"
              fill="none"
              stroke="rgba(148,197,232,0.35)"
              strokeWidth="1.5"
            />
            <g clipPath="url(#dropClip)">
              <motion.rect
                x="0"
                width="200"
                fill="url(#waterGrad)"
                style={{ y: useTransform(fillHeight, (h) => `calc(260px - ${h})`), height: fillHeight }}
              />
              {/* wave overlay */}
              <motion.path
                d="M -20 20 Q 25 5, 70 20 T 160 20 T 250 20 V 100 H -20 Z"
                fill="rgba(255,255,255,0.15)"
                animate={{ x: [-40, 0, -40] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ y: useTransform(fillHeight, (h) => `calc(260px - ${h})`) }}
              />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
};

/* ------ Energy chapter ------ */
const EnergyChapter = ({ isHi }: { isHi: boolean }) => {
  const habits = isHi
    ? [
        { icon: Zap, title: "चार्जर निकालो", desc: "Standby power ~5-10% बिजली खाता है (अनुमान). खाली सॉकेट = बचत." },
        { icon: Sun, title: "AC 24°C पर", desc: "हर 1°C कम = ~6% ज़्यादा बिजली. 24°C आराम और बचत दोनों." },
        { icon: Lightbulb, title: "LED में बदलो", desc: "1 LED = 5 CFL या 10 बल्ब की उम्र. रोशनी वही, बिल आधा." },
        { icon: Sun, title: "दिन की रोशनी", desc: "पर्दे खोलो, ट्यूब बंद. दोपहर तक बिजली की ज़रूरत नहीं." },
      ]
    : [
        { icon: Zap, title: "Unplug idle chargers", desc: "Standby draw is ~5–10% of home electricity (est.). Empty socket = saved rupees." },
        { icon: Sun, title: "AC at 24°C", desc: "Every 1°C cooler adds ~6% load. 24°C is comfort + savings." },
        { icon: Lightbulb, title: "Switch to LED", desc: "1 LED lasts 5 CFLs or 10 incandescents. Same light, half the bill." },
        { icon: Sun, title: "Ride daylight", desc: "Open curtains, kill tubelights. No lights needed till evening." },
      ];

  return (
    <section className="relative py-32 md:py-48 px-6 overflow-hidden bg-gradient-to-b from-[#03080a] via-[#1a1005] to-[#03080a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(251,191,36,0.15),_transparent_55%)]" />
      <div className="absolute top-1/4 right-10 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <ChapterLabel n="02" title={isHi ? "बिजली" : "Energy"} tone="amber" />
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            {isHi ? "जो तुम नहीं देखते, " : "What you don't see, "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              {isHi ? "वो भी चलता है." : "still runs."}
            </span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-12 max-w-2xl">
            {isHi
              ? "एक भारतीय घर के बिजली बिल का "
              : "Roughly "}
            <span className="text-amber-200 font-semibold">
              <Counter to={10} suffix="%" />
            </span>
            {isHi ? " सिर्फ़ standby पर जाता है (अनुमान). ये आदतें उसे उलट देती हैं." : " of an Indian home's power goes to standby draw (estimate). These habits reverse that."}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {habits.map((h, i) => (
            <HabitCard key={i} {...h} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------ Food chapter ------ */
const FoodChapter = ({ isHi }: { isHi: boolean }) => {
  const habits = isHi
    ? [
        { icon: Apple, title: "स्थानीय + मौसमी", desc: "स्थानीय सब्ज़ी में कम transport, ज़्यादा पोषण, कम carbon." },
        { icon: Leaf, title: "हफ़्ते में 1 दिन बिना मीट", desc: "1 दिन शाकाहारी = ~30 kg CO₂ बचत/साल/व्यक्ति (अनुमान)." },
        { icon: Recycle, title: "किचन कम्पोस्ट", desc: "छिलके, चायपत्ती — मिट्टी में लौटाओ. लैंडफ़िल से मीथेन कम." },
        { icon: Utensils, title: "थाली में सोच के लो", desc: "कम लो, फिर लो. जूठा फेंकना = पानी, ज़मीन, मेहनत फेंकना." },
      ]
    : [
        { icon: Apple, title: "Local + seasonal", desc: "Local produce means less transport, more nutrition, lower carbon." },
        { icon: Leaf, title: "One meatless day/week", desc: "Just one plant-based day saves ~30 kg CO₂/year/person (est.)." },
        { icon: Recycle, title: "Compost the kitchen", desc: "Peels & leaves back to soil. Less landfill methane, richer plants." },
        { icon: Utensils, title: "Serve smaller, refill", desc: "Take less, come back for more. Wasted food = wasted water, land, labour." },
      ];

  return (
    <section className="relative py-32 md:py-48 px-6 overflow-hidden bg-gradient-to-b from-[#03080a] via-[#051a10] to-[#03080a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.18),_transparent_55%)]" />
      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="relative h-[420px] flex items-center justify-center order-2 md:order-1">
          {/* plate with veggie icons */}
          <div className="relative w-[320px] h-[320px] rounded-full bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/15 flex items-center justify-center">
            <div className="absolute inset-6 rounded-full border border-white/10" />
            {[Apple, Leaf, Utensils, Recycle, Sparkles, Sun].map((Ic, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const r = 110;
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.12, duration: 0.5 }}
                  className="absolute w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-300/30 flex items-center justify-center backdrop-blur-sm"
                  style={{ left: `calc(50% + ${x}px - 24px)`, top: `calc(50% + ${y}px - 24px)` }}
                >
                  <Ic className="h-5 w-5 text-emerald-200" />
                </motion.div>
              );
            })}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"
            >
              <Leaf className="h-10 w-10 text-white" />
            </motion.div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <ChapterLabel n="03" title={isHi ? "खाना" : "Food"} tone="emerald" />
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            {isHi ? "थाली, " : "The plate is "}
            <span className="bg-gradient-to-r from-emerald-300 to-lime-200 bg-clip-text text-transparent">
              {isHi ? "जलवायु का पहला मैदान." : "the first climate front."}
            </span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-lg">
            {isHi
              ? "दुनिया का लगभग एक-तिहाई खाना बर्बाद होता है (अनुमान). तुम्हारी थाली इस लड़ाई में सबसे तेज़ हथियार है."
              : "Roughly a third of food produced is wasted globally (estimate). Your plate is the fastest lever you own."}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {habits.map((h, i) => (
              <HabitCard key={i} {...h} i={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------ Waste chapter ------ */
const WasteChapter = ({ isHi }: { isHi: boolean }) => {
  const habits = isHi
    ? [
        { icon: ShoppingBag, title: "कपड़े का थैला", desc: "1 कपड़े का थैला = साल भर में 500+ प्लास्टिक बैग नहीं." },
        { icon: Droplets, title: "स्टील की बोतल", desc: "एक स्टील बोतल = हज़ारों प्लास्टिक बोतल कम (अनुमान)." },
        { icon: Trash2, title: "स्ट्रॉ मना करो", desc: "\"बिना स्ट्रॉ के, please\" — सबसे आसान सस्टेनेबल बात." },
        { icon: Recycle, title: "गीला-सूखा अलग", desc: "घर पर segregation से 60% कचरा रिसाइकल हो सकता है." },
      ]
    : [
        { icon: ShoppingBag, title: "Cloth bag always", desc: "One cloth bag skips 500+ plastic bags a year." },
        { icon: Droplets, title: "Steel water bottle", desc: "One steel bottle avoids thousands of plastic bottles (est.)." },
        { icon: Trash2, title: "Refuse the straw", desc: "\"No straw, please\" — the easiest sustainable sentence." },
        { icon: Recycle, title: "Segregate at home", desc: "Wet-dry sorting lets ~60% of household waste be recycled." },
      ];

  return (
    <section className="relative py-32 md:py-48 px-6 overflow-hidden bg-gradient-to-b from-[#03080a] via-[#0d0d10] to-[#03080a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(148,163,184,0.1),_transparent_60%)]" />
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <ChapterLabel n="04" title={isHi ? "कचरा" : "Waste"} tone="slate" />
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            {isHi ? "प्लास्टिक " : "Plastic "}
            <span className="bg-gradient-to-r from-slate-200 to-stone-300 bg-clip-text text-transparent">
              {isHi ? "गायब नहीं होता." : "does not disappear."}
            </span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-12 max-w-2xl">
            {isHi
              ? "एक औसत भारतीय साल में लगभग "
              : "An average Indian generates roughly "}
            <span className="text-slate-200 font-semibold">
              <Counter to={11} suffix=" kg" />
            </span>
            {isHi ? " प्लास्टिक कचरा पैदा करता है (अनुमान). ज़्यादातर हज़ार साल तक रहेगा." : " of plastic waste a year (estimate). Most of it will outlive us by centuries."}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {habits.map((h, i) => (
            <HabitCard key={i} {...h} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------ Transport chapter ------ */
const TransportChapter = ({ isHi }: { isHi: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-10%", "110%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["110%", "-10%"]);

  const habits = isHi
    ? [
        { icon: Bike, title: "2 km — पैदल/साइकिल", desc: "छोटी दूरी पर गाड़ी सबसे कम efficient होती है. पैदल = 0 emission." },
        { icon: Car, title: "कारपूल", desc: "3 लोग = 1 गाड़ी. traffic कम, फ़्यूल तीन गुना कम." },
        { icon: Bus, title: "पब्लिक ट्रांसपोर्ट", desc: "1 बस = ~40 गाड़ियाँ सड़क से बाहर. AQI भी सुधरता है." },
        { icon: Sparkles, title: "काम इकट्ठे करो", desc: "एक trip में 3 काम = 3 अलग trips से 60% कम फ़्यूल." },
      ]
    : [
        { icon: Bike, title: "Under 2 km, walk", desc: "Cars are least efficient for short trips. Walking = zero emission." },
        { icon: Car, title: "Carpool", desc: "3 people, 1 car. Less traffic, one-third the fuel." },
        { icon: Bus, title: "Public transport", desc: "One bus ~40 cars off the road. Your AQI improves too." },
        { icon: Sparkles, title: "Batch errands", desc: "3 tasks in one trip vs 3 trips = ~60% less fuel." },
      ];

  return (
    <section
      ref={ref}
      className="relative py-32 md:py-48 px-6 overflow-hidden bg-gradient-to-b from-[#03080a] via-[#031c26] to-[#03080a]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(56,189,248,0.18),_transparent_60%)]" />

      {/* animated road strip */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-24 border-y border-white/10 bg-white/[0.02] overflow-hidden pointer-events-none">
        <div className="absolute inset-y-0 left-0 right-0 flex items-center gap-8 opacity-30">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="h-1 w-12 bg-white/40 rounded-full flex-shrink-0" />
          ))}
        </div>
        <motion.div style={{ x }} className="absolute top-2 flex items-center gap-3 text-sky-200">
          <Bike className="h-8 w-8" />
        </motion.div>
        <motion.div style={{ x: x2 }} className="absolute bottom-2 flex items-center gap-3 text-sky-100">
          <Bus className="h-8 w-8" />
        </motion.div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <ChapterLabel n="05" title={isHi ? "आना-जाना" : "Transport"} tone="sky" />
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            {isHi ? "हर km " : "Every km "}
            <span className="bg-gradient-to-r from-sky-300 to-teal-200 bg-clip-text text-transparent">
              {isHi ? "बचाया, आसमान को लौटाया." : "saved is sky returned."}
            </span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-12 max-w-2xl">
            {isHi
              ? "एक औसत पेट्रोल कार 1 km पर लगभग "
              : "An average petrol car emits roughly "}
            <span className="text-sky-200 font-semibold">
              <Counter to={170} suffix=" g CO₂" />
            </span>
            {isHi ? " छोड़ती है (अनुमान). हर पैदल km एक छोटा तोहफ़ा है." : " per km (estimate). Every walked km is a small gift back."}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {habits.map((h, i) => (
            <HabitCard key={i} {...h} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------ Consumption chapter ------ */
const ConsumeChapter = ({ isHi }: { isHi: boolean }) => {
  const habits = isHi
    ? [
        { icon: Wrench, title: "पहले ठीक करो", desc: "फेंकने से पहले सोचो — रफ़ू, गोंद, बदलाव. मरम्मत सबसे हरित है." },
        { icon: Shirt, title: "सेकंड-हैंड पहले", desc: "थ्रिफ़्ट, exchange, हैंड-मी-डाउन. उतने ही स्टाइल, आधा carbon." },
        { icon: Sparkles, title: "क्वालिटी > क्वांटिटी", desc: "1 अच्छी चीज़ 5 सस्ती से बेहतर. लंबे समय में सस्ता भी." },
        { icon: Recycle, title: "डिजिटल declutter", desc: "पुराने ईमेल, फ़ोटो हटाओ. डेटा सेंटर भी बिजली खाते हैं." },
      ]
    : [
        { icon: Wrench, title: "Repair first", desc: "Before you toss — stitch, glue, tweak. Repair is the greenest option." },
        { icon: Shirt, title: "Second-hand first", desc: "Thrift, swap, hand-me-down. Same style, half the carbon." },
        { icon: Sparkles, title: "Quality > quantity", desc: "One good thing beats five cheap ones. Cheaper long-term too." },
        { icon: Recycle, title: "Digital declutter", desc: "Old emails, photos, files — delete. Data centres run on electricity too." },
      ];

  return (
    <section className="relative py-32 md:py-48 px-6 overflow-hidden bg-gradient-to-b from-[#03080a] via-[#1a0714] to-[#03080a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(244,114,182,0.15),_transparent_55%)]" />
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <ChapterLabel n="06" title={isHi ? "खरीदारी" : "Consumption"} tone="rose" />
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            {isHi ? "सबसे हरा सामान — " : "The greenest product — "}
            <span className="bg-gradient-to-r from-rose-300 to-pink-200 bg-clip-text text-transparent">
              {isHi ? "जो तुमने ख़रीदा ही नहीं." : "the one you didn't buy."}
            </span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-12 max-w-2xl">
            {isHi
              ? "फ़ास्ट फ़ैशन उद्योग हर साल दुनिया के carbon का ~10% पैदा करता है (अनुमान). कम, बेहतर, लंबा — यही है फ़ॉर्मूला."
              : "Fast fashion produces ~10% of global carbon a year (estimate). Buy less, buy better, keep it longer."}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {habits.map((h, i) => (
            <HabitCard key={i} {...h} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------ Finale — pick one ------ */
const Finale = ({ isHi }: { isHi: boolean }) => {
  const [picked, setPicked] = useState<string | null>(null);

  const choices = isHi
    ? [
        { id: "water", label: "छोटा शॉवर लूँगा", icon: Droplets },
        { id: "energy", label: "चार्जर हमेशा निकालूँगा", icon: Zap },
        { id: "food", label: "हफ़्ते में 1 दिन बिना मीट", icon: Leaf },
        { id: "bag", label: "कपड़े का थैला हमेशा", icon: ShoppingBag },
        { id: "walk", label: "2 km से कम पैदल", icon: Bike },
        { id: "repair", label: "पहले ठीक करूँगा", icon: Wrench },
      ]
    : [
        { id: "water", label: "Shorter showers", icon: Droplets },
        { id: "energy", label: "Unplug idle chargers", icon: Zap },
        { id: "food", label: "One meatless day/week", icon: Leaf },
        { id: "bag", label: "Cloth bag always", icon: ShoppingBag },
        { id: "walk", label: "Walk under 2 km", icon: Bike },
        { id: "repair", label: "Repair before replacing", icon: Wrench },
      ];

  return (
    <section className="relative py-32 md:py-48 px-6 overflow-hidden bg-gradient-to-b from-[#03080a] via-[#031a12] to-[#020604]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.22),_transparent_60%)]" />

      {/* floating particles when picked */}
      <AnimatePresence>
        {picked &&
          Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i + picked}
              initial={{ opacity: 0, y: 200, x: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: -400,
                x: (Math.random() - 0.5) * 400,
              }}
              transition={{ duration: 2.6, delay: i * 0.03, ease: "easeOut" }}
              className="absolute left-1/2 bottom-0 pointer-events-none"
            >
              <Leaf
                className="h-4 w-4 text-emerald-300"
                style={{ transform: `rotate(${Math.random() * 360}deg)` }}
              />
            </motion.div>
          ))}
      </AnimatePresence>

      <div className="relative max-w-4xl mx-auto text-center">
        <ChapterLabel n="07" title={isHi ? "आज से" : "From today"} tone="emerald" />
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.02] tracking-tight mb-6">
          {isHi ? "एक चुनो. " : "Pick one. "}
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
            {isHi ? "आज से." : "Start today."}
          </span>
        </h2>
        <p className="text-lg text-white/60 max-w-xl mx-auto mb-12">
          {isHi
            ? "छह में से एक आदत. एक हफ़्ता निभा लो, फिर दूसरी. यही तरीक़ा है."
            : "One habit from six. Stick it for a week, then add another. That's the whole trick."}
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-12">
          {choices.map((c) => {
            const active = picked === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setPicked(c.id)}
                className={`group relative rounded-2xl border p-5 text-left transition-all ${
                  active
                    ? "border-emerald-300 bg-emerald-400/15 shadow-[0_0_40px_-10px_rgba(16,185,129,0.6)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      active ? "bg-emerald-400/25" : "bg-white/10"
                    }`}
                  >
                    <c.icon
                      className={`h-4 w-4 ${active ? "text-emerald-200" : "text-white/80"}`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${active ? "text-white" : "text-white/80"}`}
                  >
                    {c.label}
                  </span>
                  {active && (
                    <Check className="h-4 w-4 text-emerald-300 ml-auto" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {picked && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-10"
            >
              <p className="text-emerald-200 text-lg font-medium">
                {isHi
                  ? "बढ़िया. एक आदत ने लहर शुरू कर दी. 🌱"
                  : "Nice. One habit just started the ripple. 🌱"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-semibold"
          >
            <Link to="/climate-impact-pack">
              {isHi ? "आदत के साथ पेड़ भी" : "Compound it with a tree"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/learn">
              {isHi ? "और लर्न हब देखो" : "More from Learn Hub"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

/* ---------------- page ---------------- */

const LearnSustainabilityHabits = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isHi
      ? "सस्टेनेबिलिटी की रोज़मर्रा आदतें"
      : "Everyday sustainability habits",
    description: isHi
      ? "सात रोज़मर्रा के तरीक़े — पानी, बिजली, खाना, कचरा, यातायात, ख़रीदारी — जिनसे तुम आज से फ़र्क डाल सकते हो."
      : "Seven everyday chapters — water, energy, food, waste, transport, consumption — that let you start today.",
    author: { "@type": "Organization", name: "Himsols" },
    publisher: { "@type": "Organization", name: "Himsols" },
    datePublished: "2026-07-17",
  };

  return (
    <div className="bg-[#03080a]">
      <SEO
        title={
          isHi
            ? "सस्टेनेबिलिटी आदतें — रोज़ का हरा जीवन | Himsols"
            : "Sustainability Habits — Everyday Green Living | Himsols"
        }
        description={
          isHi
            ? "सात रोज़मर्रा के अध्याय — पानी, बिजली, खाना, कचरा, यातायात, ख़रीदारी. एक सिनेमैटिक स्क्रॉल अनुभव."
            : "Seven everyday chapters — water, energy, food, waste, transport, consumption. A cinematic scroll experience."
        }
        url="https://himsols.com/learn/sustainability-habits"
        structuredData={articleSchema}
      />
      <Navbar />
      <main>
        <Hero isHi={isHi} />
        <WaterChapter isHi={isHi} />
        <EnergyChapter isHi={isHi} />
        <FoodChapter isHi={isHi} />
        <WasteChapter isHi={isHi} />
        <TransportChapter isHi={isHi} />
        <ConsumeChapter isHi={isHi} />
        <Finale isHi={isHi} />
      </main>
      <Footer />
    </div>
  );
};

export default LearnSustainabilityHabits;
