import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, TreePine, Building2, Sprout, MapPin, BarChart3, Shield, Leaf } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const useMinTreePrice = () =>
  useQuery({
    queryKey: ["tree-min-price-hero"],
    queryFn: async () => {
      const { data } = await supabase
        .from("trees")
        .select("price")
        .eq("is_active", true)
        .gt("price", 0)
        .order("price", { ascending: true })
        .limit(1);
      return data?.[0]?.price || 299;
    },
    staleTime: 1000 * 60 * 5,
  });

export const HeroSection = memo(() => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { data: minPrice = 299 } = useMinTreePrice();

  return (
    <section className="pt-24 md:pt-32 pb-20 md:pb-28 px-4 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-slide-up">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary">
            <Shield className="h-3.5 w-3.5" />
            {isHi ? "पर्यावरण प्रभाव प्लेटफ़ॉर्म" : "Environmental Impact Platform"}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight text-foreground">
            {isHi ? (
              <>पेड़ लगाओ। गांवों को सशक्त करो।{" "}<span className="text-primary">अपना प्रभाव ट्रैक करो।</span></>
            ) : (
              <>Plant Trees. Support Rural Communities.{" "}<span className="text-primary">Track Your Impact.</span></>
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {isHi
              ? "हिमाचल प्रदेश में किसानों की ज़मीन पर सत्यापित वृक्षारोपण को प्रायोजित करें। जियो-टैग फ़ोटो, सर्वाइवल ट्रैकिंग और कार्बन रिपोर्ट पाएं।"
              : "Sponsor verified tree plantations on farmer land in Himachal Pradesh. Get geo-tagged proof, survival tracking, and carbon impact reports."}
          </p>

          {/* Action Buttons — ₹299 tree prominent + Quiz CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link to="/shop">
              <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-all group px-8 text-base">
                <TreePine className="h-4 w-4" />
                {isHi ? `₹${minPrice} में पेड़ लगाओ` : `Plant a Tree – ₹${minPrice}`}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/green-quiz">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 border-2 text-base px-8"
              >
                <Leaf className="h-4 w-4" />
                {isHi ? "ग्रीन क्विज़ खेलो" : "Take Green Quiz"}
              </Button>
            </Link>
            <Link to="/corporate">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 border-2 text-base px-8"
              >
                <Building2 className="h-4 w-4" />
                {isHi ? "CSR प्रोजेक्ट्स" : "CSR Projects"}
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              {isHi ? "जियो-टैग वृक्षारोपण" : "Geo-tagged plantations"}
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-primary" />
              {isHi ? "सर्वाइवल ट्रैकिंग" : "Survival tracking"}
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              {isHi ? "CO₂ प्रभाव रिपोर्ट" : "CO₂ impact reports"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
