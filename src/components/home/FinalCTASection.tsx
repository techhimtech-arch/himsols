import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const FinalCTASection = memo(() => {
  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-primary-foreground leading-tight">
          Scale Climate Impact With Transparency.
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-primary-foreground/80">
          Verified plantations. Measurable outcomes. Trusted partnerships.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/shop">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 gap-2 group px-8 w-full sm:w-auto text-base">
              Adopt Trees
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/corporate">
            <Button size="lg" variant="outline" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 gap-2 px-8 w-full sm:w-auto text-base">
              CSR Partnerships
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

FinalCTASection.displayName = "FinalCTASection";
