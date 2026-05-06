import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const FinalCTASection = memo(() => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-primary-foreground leading-tight">
          {isHi ? "पारदर्शिता के साथ क्लाइमेट इम्पैक्ट को स्केल करें।" : "Scale Climate Impact With Transparency."}
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-primary-foreground/80">
          {isHi
            ? "सत्यापित वृक्षारोपण। मापने योग्य परिणाम। भरोसेमंद साझेदारी।"
            : "Verified plantations. Measurable outcomes. Trusted partnerships."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/climate-impact-pack">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 gap-2 group px-8 w-full sm:w-auto text-base">
              {isHi ? "पेड़ अपनाएं" : "Adopt Trees"}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/corporate">
            <Button size="lg" variant="outline" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 gap-2 px-8 w-full sm:w-auto text-base">
              {isHi ? "CSR साझेदारी" : "CSR Partnerships"}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

FinalCTASection.displayName = "FinalCTASection";
