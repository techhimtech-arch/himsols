import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, TreePine, Building2, Sprout, MapPin, BarChart3, Shield, CloudRain } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeroShareReferralBar } from "./HeroShareReferralBar";
import { isMonsoonWindow } from "@/components/MonsoonScarcityBadge";
import { Link as RouterLink } from "react-router-dom";

const SINGLE_TREE_PRICE = 269;
const SINGLE_TREE_MRP = 299;

export const HeroSection = memo(() => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const minPrice = SINGLE_TREE_PRICE;
  const monsoon = isMonsoonWindow();

  return (
    <section className="pt-24 md:pt-32 pb-20 md:pb-28 px-4 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-slide-up">
          {/* Tag — CSR-first positioning */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary">
            <Building2 className="h-3.5 w-3.5" />
            {isHi ? "CSR और ESG के लिए वृक्षारोपण पार्टनर" : "Plantation Partner for CSR & ESG Teams"}
          </div>

          {/* Headline — CSR-first */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight text-foreground">
            {isHi ? (
              <>हिमाचल में <span className="text-primary">सत्यापित वृक्षारोपण।</span> रिपोर्ट-रेडी CSR प्रभाव।</>
            ) : (
              <>Verified plantation in Himachal.{" "}<span className="text-primary">Report-ready CSR impact.</span></>
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {isHi
              ? "हर पेड़ जियो-टैग किया गया, सर्वाइवल ट्रैक किया गया, और आपकी ESG रिपोर्ट के लिए तैयार। किसानों की ज़मीन पर, पारदर्शी दस्तावेज़ों के साथ।"
              : "Every tree geo-tagged, survival-tracked, and documented for your ESG report. Planted on farmer land across Himachal Pradesh with full transparency."}
          </p>

          {/* Monsoon strip — shown only during monsoon */}
          {monsoon && (
            <RouterLink
              to="/monsoon-plantation-himachal"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition-colors"
            >
              <CloudRain className="h-4 w-4" />
              {isHi
                ? "मानसून पेड़ लगाने का सबसे अच्छा समय है — हिमाचल प्लान देखें"
                : "Monsoon is the best time to plant — see Himachal plan"}
              <ArrowRight className="h-4 w-4" />
            </RouterLink>
          )}

          {/* Primary CTA: CSR proposal.  Secondary: single tree. */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link to="/csr-carbon-offset">
              <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-all group px-8 text-base">
                <Building2 className="h-4 w-4" />
                {isHi ? "CSR प्रस्ताव प्राप्त करें" : "Get CSR Proposal"}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/single-tree-pack">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 border-2 text-base px-8"
              >
                <TreePine className="h-4 w-4" />
                {isHi ? `एक पेड़ लगाओ – ₹${minPrice}` : `Plant a single tree – ₹${minPrice}`}
              </Button>
            </Link>
          </div>

          {/* Trust bar — registered, farmer-backed */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs md:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              {isHi ? "हिमाचल आधारित टीम" : "Himachal-based team"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              {isHi ? "हिमाचल में स्थित" : "Based in Himachal Pradesh"}
            </span>
            <span className="flex items-center gap-1.5">
              <Sprout className="h-4 w-4 text-primary" />
              {isHi ? "250+ किसान नेटवर्क" : "250+ farmer network"}
            </span>
          </div>

          {/* What CSR teams get */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs md:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              {isHi ? "जियो-टैग फ़ोटो" : "Geo-tagged photos"}
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-primary" />
              {isHi ? "सर्वाइवल ऑडिट" : "Survival audits"}
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              {isHi ? "CO₂ प्रभाव रिपोर्ट" : "CO₂ impact reports"}
            </span>
          </div>

          <HeroShareReferralBar />
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
