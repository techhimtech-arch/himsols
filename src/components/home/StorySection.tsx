import { memo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useHomepageContent, getLocalizedText } from "@/hooks/useHomepageContent";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, Quote } from "lucide-react";
import heroImage from "@/assets/hero-tree.jpg";

export const StorySection = memo(() => {
  const { language } = useLanguage();
  const { getSection, isLoading } = useHomepageContent();

  const section = getSection("story");

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="animate-pulse grid lg:grid-cols-2 gap-12">
            <div className="h-80 bg-muted rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!section?.is_active) return null;

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />
            <div className="relative">
              <img
                src={section.background_image || heroImage}
                alt="Himsols Story"
                className="rounded-3xl shadow-2xl w-full h-[300px] md:h-[400px] object-cover border-4 border-white/50"
                loading="lazy"
              />
              {/* Quote overlay */}
              <div className="absolute -bottom-6 -right-6 bg-background/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-border/50 max-w-[200px] hidden sm:block">
                <Quote className="h-6 w-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground italic">
                  {language === "hi" 
                    ? "हर पेड़ एक कहानी है" 
                    : "Every tree tells a story"}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Heart className="h-4 w-4" />
              <span>{language === "hi" ? "हमारी कहानी" : "Our Story"}</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {getLocalizedText(section, "title", language)}
            </h2>

            {/* Content */}
            <p className="text-lg text-muted-foreground leading-relaxed">
              {getLocalizedText(section, "content", language)}
            </p>

            {/* Stats mini */}
            <div className="flex flex-wrap gap-6 py-4">
              <div>
                <div className="text-2xl font-bold text-primary">2023</div>
                <div className="text-sm text-muted-foreground">
                  {language === "hi" ? "स्थापना वर्ष" : "Founded"}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">5+</div>
                <div className="text-sm text-muted-foreground">
                  {language === "hi" ? "गांव जुड़े" : "Villages Connected"}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">
                  {language === "hi" ? "स्थानीय टीम" : "Local Team"}
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link to="/contact">
              <Button size="lg" className="gap-2 group">
                {language === "hi" ? "हमसे जुड़ें" : "Connect With Us"}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});

StorySection.displayName = "StorySection";
