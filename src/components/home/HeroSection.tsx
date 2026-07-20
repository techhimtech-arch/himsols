import { lazy, memo, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  TreePine,
  Building2,
  Shield,
  CloudRain,
  Camera,
  FileCheck,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { HeroShareReferralBar } from "./HeroShareReferralBar";
import { isMonsoonWindow } from "@/components/MonsoonScarcityBadge";
import forestMist from "@/assets/learn/hero-forest-mist.jpg";

const HeroTreeScene = lazy(() => import("./HeroTreeScene"));

const SINGLE_TREE_PRICE = 269;

// Detect if we should skip the WebGL scene (small screens or reduced-motion)
function useLite() {
  const [lite, setLite] = useState(true);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    setLite(reduced || small);
  }, []);
  return lite;
}

export const HeroSection = memo(() => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const monsoon = isMonsoonWindow();
  const lite = useLite();

  const headlineTop = isHi ? "हिमाचल में" : "Verified plantation";
  const headlineAccent = isHi ? "सत्यापित वृक्षारोपण." : "in Himachal.";
  const headlineSub = isHi ? "रिपोर्ट-रेडी CSR प्रभाव." : "Report-ready CSR impact.";

  return (
    <section className="relative w-full min-h-[92vh] md:min-h-screen flex items-center overflow-hidden bg-[#020804]">
      {/* Ambient background image */}
      <div className="absolute inset-0">
        <motion.img
          src={forestMist}
          alt=""
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020804]/90 via-[#020804]/50 to-[#020804]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020804]/70 via-transparent to-[#020804]/70" />
      </div>

      {/* Floating leaf particles */}
      <div className="pointer-events-none absolute inset-0">
        {[
          { top: "22%", left: "8%", size: "w-2 h-2", delay: 0, dur: 9 },
          { top: "68%", left: "6%", size: "w-1.5 h-1.5", delay: 1.5, dur: 11 },
          { top: "38%", left: "92%", size: "w-2.5 h-1.5", delay: 0.8, dur: 13 },
          { top: "78%", left: "88%", size: "w-1.5 h-1.5", delay: 2.2, dur: 10 },
        ].map((p, i) => (
          <motion.span
            key={i}
            className={`absolute ${p.size} rounded-full bg-emerald-300/25`}
            style={{ top: p.top, left: p.left }}
            animate={{ y: [0, -28, 0], x: [0, 10, 0], opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-28 md:pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-6 items-center">
          {/* LEFT — copy */}
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10.5px] font-bold text-emerald-100/90 uppercase tracking-[0.22em]">
                <Building2 className="inline h-3 w-3 mr-1.5 -mt-0.5" />
                {isHi ? "पायलट कोहोर्ट · मानसून 2026" : "Pilot Cohort · Monsoon 2026"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-white font-bold tracking-tight leading-[1.02]"
            >
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                {headlineTop}
              </span>
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-400 to-teal-300">
                {headlineAccent}
              </span>
              <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-4 md:mt-5 font-semibold text-white/70">
                {headlineSub}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55 }}
              className="mt-7 md:mt-8 text-base md:text-lg text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              {isHi
                ? "हर पेड़ जियो-टैग किया गया, सर्वाइवल ट्रैक किया गया, और आपकी ESG रिपोर्ट के लिए तैयार। हिमाचल के किसानों की ज़मीन पर, पारदर्शी दस्तावेज़ों के साथ।"
                : "Every tree geo-tagged, survival-tracked, and documented for your ESG report. Planted on farmer land in Himachal Pradesh — full transparency, no greenwashing."}
            </motion.p>

            {monsoon && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.75 }}
                className="mt-6"
              >
                <Link
                  to="/monsoon-plantation-himachal"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-300/25 text-amber-200 text-sm font-medium hover:bg-amber-400/20 transition-colors backdrop-blur-md"
                >
                  <CloudRain className="h-4 w-4" />
                  {isHi
                    ? "मानसून पेड़ लगाने का सबसे अच्छा समय है — हिमाचल प्लान देखें"
                    : "Monsoon is the best time to plant — see Himachal plan"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              className="mt-9 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
            >
              <Link to="/csr-carbon-offset" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl shadow-[0_0_40px_-8px_rgba(16,185,129,0.6)] hover:shadow-[0_0_60px_-4px_rgba(16,185,129,0.8)] transition-all group"
                >
                  <Building2 className="h-4 w-4" />
                  {isHi ? "CSR प्रस्ताव प्राप्त करें" : "Get CSR Proposal"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/single-tree-pack" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-base bg-white/[0.03] hover:bg-white/[0.08] border-white/20 text-white hover:text-white backdrop-blur-xl rounded-xl font-semibold"
                >
                  <TreePine className="h-4 w-4" />
                  {isHi ? `एक पेड़ लगाओ` : `Plant a single tree`}
                  <span className="ml-1 text-emerald-300">₹{SINGLE_TREE_PRICE}</span>
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto lg:mx-0 border-t border-white/[0.06] pt-6"
            >
              {[
                { icon: Shield, label: isHi ? "हिमाचल-आधारित टीम" : "Himachal-based team" },
                { icon: Camera, label: isHi ? "जियो-टैग फ़ोटो" : "Geo-tagged photos" },
                { icon: FileCheck, label: isHi ? "सर्वाइवल ऑडिट" : "Survival audits" },
              ].map((c) => (
                <div key={c.label} className="flex flex-col items-center lg:items-start gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                    <c.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold text-white/50 tracking-[0.15em] uppercase text-center lg:text-left leading-tight">
                    {c.label}
                  </span>
                </div>
              ))}
            </motion.div>

            <div className="mt-8">
              <HeroShareReferralBar />
            </div>
          </div>

          {/* RIGHT — WebGL scene (desktop only) */}
          <div className="hidden lg:block relative h-[560px] xl:h-[620px]">
            {/* Soft radial glow behind the tree */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 rounded-full bg-emerald-500/[0.08] blur-[100px]" />
            </div>
            {!lite && (
              <Suspense fallback={<SceneFallback />}>
                <HeroTreeScene />
              </Suspense>
            )}
            {lite && <SceneFallback />}
          </div>
        </div>
      </div>

      {/* Bottom fade to page */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-background pointer-events-none z-10" />
    </section>
  );
});

HeroSection.displayName = "HeroSection";

function SceneFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
        <TreePine className="relative h-40 w-40 text-emerald-400/70" strokeWidth={1.2} />
      </div>
    </div>
  );
}
