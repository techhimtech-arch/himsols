import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, MapPin, FileCheck, Leaf } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

type Card = {
  icon: typeof Camera;
  step: string;
  title: string;
  body: string;
};

function TiltCard({ card, index }: { card: Card; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -y * 8, ry: x * 10 });
  };
  const reset = () => setTilt({ rx: 0, ry: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.15s ease-out",
      }}
      className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 md:p-7 backdrop-blur-xl overflow-hidden group"
    >
      <div
        style={{ transform: "translateZ(40px)" }}
        className="pointer-events-none absolute -top-14 -right-14 w-40 h-40 rounded-full bg-emerald-400/10 blur-3xl group-hover:bg-emerald-400/20 transition-colors"
      />
      <div style={{ transform: "translateZ(30px)" }} className="relative">
        <div className="flex items-center justify-between mb-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-300/20 flex items-center justify-center">
            <card.icon className="h-5 w-5 text-emerald-300" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
            {card.step}
          </span>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white leading-snug">{card.title}</h3>
        <p className="mt-2 text-sm text-white/55 leading-relaxed">{card.body}</p>
      </div>
    </motion.div>
  );
}

export const HowWeVerifyTilt = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const cards: Card[] = isHi
    ? [
        { icon: MapPin, step: "01", title: "जियो-टैग", body: "हर पेड़ का GPS निर्देशांक और तारीख कैप्चर किया जाता है।" },
        { icon: Camera, step: "02", title: "फ़ोटो प्रमाण", body: "किसान द्वारा रोपण और वृद्धि की तस्वीरें अपलोड।" },
        { icon: Leaf, step: "03", title: "सर्वाइवल ऑडिट", body: "3, 6, 12 महीने पर टीम द्वारा फ़ील्ड ऑडिट।" },
        { icon: FileCheck, step: "04", title: "CSR रिपोर्ट", body: "ESG-रेडी दस्तावेज़, धारा 135 अनुपालन।" },
      ]
    : [
        { icon: MapPin, step: "01", title: "Geo-tag", body: "GPS coordinates and date captured for every single tree." },
        { icon: Camera, step: "02", title: "Photo proof", body: "Farmer uploads planting and growth photos to the ledger." },
        { icon: Leaf, step: "03", title: "Survival audit", body: "Field audits by our team at month 3, 6, and 12." },
        { icon: FileCheck, step: "04", title: "CSR report", body: "ESG-ready PDF, Section 135 compliant, ready to file." },
    ];

  return (
    <section className="relative w-full overflow-hidden bg-[#020804] py-24 md:py-32">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] rounded-full bg-teal-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-300/20 mb-6">
            <FileCheck className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-100/80">
              {isHi ? "हम कैसे सत्यापन करते हैं" : "How we verify"}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.05]">
            {isHi ? (
              <>दावे नहीं. <span className="text-emerald-300">दस्तावेज़ों वाला सबूत.</span></>
            ) : (
              <>Not claims. <span className="text-emerald-300">Documented proof.</span></>
            )}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {cards.map((c, i) => (
            <TiltCard key={c.step} card={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
