import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Sprout, Sun, CloudRain } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const WhereTreeLivesScene = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const yBack = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const cloudX = useTransform(scrollYProgress, [0, 1], ["-10%", "20%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#020804] via-[#04150c] to-[#020804] py-24 md:py-40"
    >
      {/* Drifting cloud strip */}
      <motion.div
        style={{ x: cloudX }}
        className="absolute top-16 left-0 right-0 h-24 pointer-events-none"
      >
        <div className="mx-auto max-w-6xl h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent blur-2xl" />
      </motion.div>

      {/* Layered mountains */}
      <div className="absolute inset-0 flex items-end pointer-events-none">
        <motion.svg
          style={{ y: yBack }}
          viewBox="0 0 1200 400"
          className="absolute bottom-0 left-0 right-0 w-full h-[60%]"
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            d="M0,400 L0,220 L120,160 L240,200 L360,120 L500,180 L640,110 L780,170 L920,140 L1080,190 L1200,150 L1200,400 Z"
            fill="#0b2418"
            opacity="0.9"
          />
        </motion.svg>
        <motion.svg
          style={{ y: yMid }}
          viewBox="0 0 1200 400"
          className="absolute bottom-0 left-0 right-0 w-full h-[55%]"
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            d="M0,400 L0,280 L100,240 L220,290 L340,210 L480,260 L620,200 L760,270 L900,230 L1040,280 L1200,240 L1200,400 Z"
            fill="#123d26"
            opacity="0.95"
          />
        </motion.svg>
        <motion.svg
          style={{ y: yFront }}
          viewBox="0 0 1200 400"
          className="absolute bottom-0 left-0 right-0 w-full h-[45%]"
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            d="M0,400 L0,340 L140,310 L260,340 L400,290 L540,330 L680,290 L820,340 L960,300 L1120,340 L1200,320 L1200,400 Z"
            fill="#1a5f38"
          />
        </motion.svg>
      </div>

      {/* Sun / mist glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4">
        <motion.div style={{ y: titleY }} className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-300/20 mb-6">
            <MapPin className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-100/80">
              {isHi ? "आपका पेड़ यहाँ रहता है" : "Where your tree lives"}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight">
            {isHi ? (
              <>हिमालय की गोद में, <span className="text-emerald-300">एक किसान की ज़मीन पर.</span></>
            ) : (
              <>Cradled in the Himalayas, <span className="text-emerald-300">on a farmer's land.</span></>
            )}
          </h2>
          <p className="mt-6 text-white/60 md:text-lg">
            {isHi
              ? "1,200 से 3,000 मीटर की ऊँचाई पर देवदार, ओक और चीड़ के प्राकृतिक क्षेत्र। हर पेड़ जियो-टैग किया गया।"
              : "Deodar, oak, and native pine zones from 1,200 m to 3,000 m altitude. Every tree geo-tagged."}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
          {[
            { icon: Sun, k: "1,200–3,000 m", v: isHi ? "ऊँचाई क्षेत्र" : "Altitude zones" },
            { icon: Sprout, k: "7", v: isHi ? "ज़िले" : "HP districts" },
            { icon: CloudRain, k: "Jul–Sep", v: isHi ? "मानसून विंडो" : "Monsoon window" },
            { icon: MapPin, k: "100%", v: isHi ? "जियो-टैग" : "Geo-tagged" },
          ].map((c) => (
            <div
              key={c.v}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl px-4 py-5 text-center"
            >
              <c.icon className="h-4 w-4 text-emerald-300 mx-auto mb-2" />
              <div className="text-lg md:text-xl font-bold text-white">{c.k}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/45 mt-1">
                {c.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
