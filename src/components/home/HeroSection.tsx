import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TreePine, Recycle, Users, Award, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useHomepageContent, getLocalizedText } from "@/hooks/useHomepageContent";
import heroImage from "@/assets/hero-tree.jpg";

export const HeroSection = memo(() => {
  const { language } = useLanguage();
  const { getSection, counters, isLoading } = useHomepageContent();

  const section = getSection("hero");

  // Default values while loading or if CMS fails
  const title = section ? getLocalizedText(section, "title", language) : (
    language === "hi" 
      ? "अपने नाम से पेड़ लगाइए – हिमाचल के लिए 🌱" 
      : "Plant a Tree in Your Name – For Himachal 🌱"
  );
  
  const subtitle = section ? getLocalizedText(section, "subtitle", language) : (
    language === "hi"
      ? "आज लगाया गया एक पेड़, कल हिमाचल का भविष्य बदलेगा"
      : "One tree today can shape Himachal's tomorrow"
  );

  const ctaText = section ? getLocalizedText(section, "cta_text", language) : (
    language === "hi" ? "पेड़ खरीदें" : "Shop Trees"
  );

  const treesPlanted = counters?.total_trees_planted || 450;

  return (
    <section className="pt-20 md:pt-28 pb-16 md:pb-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/15 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>{language === "hi" ? "हिमाचल का विश्वसनीय साथी" : "Himachal's Trusted Partner"}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                {title}
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              {subtitle}
            </p>

            {/* Primary CTAs - 3 Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link to="/shop">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-all group">
                  <TreePine className="h-5 w-5" />
                  {ctaText}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/waste-management">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-all">
                  <Recycle className="h-5 w-5" />
                  {language === "hi" ? "स्क्रैप पिकअप बुक करें" : "Schedule Scrap Pickup"}
                </Button>
              </Link>
              <Link to="/contact?type=volunteer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-2 hover:bg-accent transition-all">
                  <Users className="h-5 w-5" />
                  {language === "hi" ? "स्वयंसेवक बनें" : "Join as Volunteer"}
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary">A</div>
                  <div className="w-8 h-8 rounded-full bg-secondary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-secondary">R</div>
                  <div className="w-8 h-8 rounded-full bg-accent border-2 border-background flex items-center justify-center text-xs font-bold text-accent-foreground">S</div>
                </div>
                <span>{counters?.people_involved || 120}+ {language === "hi" ? "खुश उपयोगकर्ता" : "Happy Users"}</span>
              </div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Award className="h-4 w-4" />
                <span>{language === "hi" ? "इको-प्रमाणित" : "Eco-Certified"}</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative order-first lg:order-last">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-3xl opacity-60" />
            <div className="relative">
              <img
                src={section?.background_image || heroImage}
                alt={language === "hi" ? "हिमाचल में पेड़ लगाना" : "Tree plantation in Himachal"}
                className="relative rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-700 w-full h-[320px] sm:h-[400px] lg:h-[520px] object-cover border-4 border-white/50"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-background/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-border/50 animate-bounce-subtle hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <TreePine className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{treesPlanted}+</div>
                    <div className="text-sm text-muted-foreground">
                      {language === "hi" ? "पेड़ लगाए गए" : "Trees Planted"}
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground rounded-full px-4 py-2 shadow-lg font-semibold text-sm animate-float hidden sm:block">
                🌱 {language === "hi" ? "सक्रिय अभी" : "Active Now"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
