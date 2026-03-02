import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, MapPin, Shield } from "lucide-react";

export const HeroSection = memo(() => {
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
            Village Climate Infrastructure Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight text-foreground">
            Build Measurable Climate Impact{" "}
            <span className="text-primary">in Himachal</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Sponsor verified tree plantations on farmer land with geo-tag proof, survival tracking, and carbon impact reporting.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link to="/shop">
              <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-all group px-8 text-base">
                Adopt 10 Trees – ₹2,999
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/corporate">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 border-2 text-base px-8"
              >
                For CSR & Bulk Projects
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              Geo-tagged plantations
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-primary" />
              Survival tracking
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              CO₂ impact reports
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
