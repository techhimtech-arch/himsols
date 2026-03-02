import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight, TreePine, MapPin, Camera, BarChart3, FileText, Shield } from "lucide-react";

const features = [
  { icon: TreePine, text: "10 Native Trees" },
  { icon: MapPin, text: "Plantation on Farmer Land" },
  { icon: Camera, text: "Geo-Tagged Photos" },
  { icon: BarChart3, text: "6-Month Survival Update" },
  { icon: FileText, text: "CO₂ Offset Estimate Certificate" },
];

const trustIndicators = [
  "Transparent reporting",
  "Farmer partnership model",
  "Survival tracking system",
];

export const ClimateImpactPackSection = memo(() => {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left - Content */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary mb-6">
              Most Popular
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              ₹2,999 Climate Impact Pack
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg">
              A complete, verified tree sponsorship package with measurable environmental outcomes.
            </p>

            <div className="space-y-4 mb-8">
              {features.map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{f.text}</span>
                </div>
              ))}
            </div>

            <Link to="/shop">
              <Button size="lg" className="gap-2 group px-8 text-base">
                Start Your Climate Impact
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Right - Trust Card */}
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Built on Trust</h3>
            </div>
            <div className="space-y-5">
              {trustIndicators.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="text-4xl font-bold text-foreground mb-1">₹2,999</div>
              <div className="text-muted-foreground text-sm">One-time sponsorship · No recurring fees</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ClimateImpactPackSection.displayName = "ClimateImpactPackSection";
