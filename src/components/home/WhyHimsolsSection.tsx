import { memo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useHomepageContent, getLocalizedText } from "@/hooks/useHomepageContent";
import { MapPin, Users, Eye, Award, Heart } from "lucide-react";

// Icon mapping for dynamic icons
const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin,
  Users,
  Eye,
  Award,
  Heart,
};

// Dynamic icon component with fallback
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = iconComponents[name] || Heart;
  return <IconComponent className={className} />;
};

export const WhyHimsolsSection = memo(() => {
  const { language } = useLanguage();
  const { getSection, getItems, isLoading } = useHomepageContent();

  const section = getSection("why_himsols");
  const cards = getItems("why_himsols");

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!section?.is_active) return null;

  const cardColors = [
    { bg: "from-primary/10 to-primary/5", icon: "text-primary", border: "hover:border-primary/30" },
    { bg: "from-secondary/10 to-secondary/5", icon: "text-secondary", border: "hover:border-secondary/30" },
    { bg: "from-accent to-accent/50", icon: "text-accent-foreground", border: "hover:border-accent" },
    { bg: "from-primary/10 to-secondary/10", icon: "text-primary", border: "hover:border-primary/30" },
  ];

  return (
    <section className="py-16 md:py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <Heart className="h-4 w-4" />
            <span>{language === "hi" ? "हमारी प्रतिबद्धता" : "Our Commitment"}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {getLocalizedText(section, "title", language)}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {getLocalizedText(section, "subtitle", language)}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const colorScheme = cardColors[index % cardColors.length];
            return (
              <div
                key={card.id}
                className={`relative group p-6 rounded-2xl bg-gradient-to-br ${colorScheme.bg} border border-border/50 ${colorScheme.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-background/80 backdrop-blur flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <DynamicIcon name={card.icon || "Heart"} className={`h-6 w-6 ${colorScheme.icon}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {getLocalizedText(card, "title", language)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {getLocalizedText(card, "description", language)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

WhyHimsolsSection.displayName = "WhyHimsolsSection";
