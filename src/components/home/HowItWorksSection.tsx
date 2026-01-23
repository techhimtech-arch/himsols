import { memo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useHomepageContent, getLocalizedText } from "@/hooks/useHomepageContent";
import { Globe, TreePine, CheckCircle, Sparkles } from "lucide-react";

// Icon mapping for dynamic icons
const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  TreePine,
  CheckCircle,
  Sparkles,
};

// Dynamic icon component with fallback
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = iconComponents[name] || Globe;
  return <IconComponent className={className} />;
};

export const HowItWorksSection = memo(() => {
  const { language } = useLanguage();
  const { getSection, getItems, isLoading } = useHomepageContent();

  const section = getSection("how_it_works");
  const steps = getItems("how_it_works");

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!section?.is_active) return null;

  return (
    <section className="py-16 md:py-20 px-4 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>{language === "hi" ? "सरल प्रक्रिया" : "Simple Process"}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {getLocalizedText(section, "title", language)}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {getLocalizedText(section, "subtitle", language)}
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative group"
            >
              {/* Connector line (not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="relative p-6 md:p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <DynamicIcon name={step.icon || "Globe"} className="h-8 w-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {getLocalizedText(step, "title", language)}
                </h3>
                <p className="text-muted-foreground">
                  {getLocalizedText(step, "description", language)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";
