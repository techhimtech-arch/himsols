import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Download, ShieldCheck } from "lucide-react";

export const CSRSection = memo(() => {
  return (
    <section className="py-14 md:py-16 px-4 bg-primary/5">
      <div className="container mx-auto max-w-4xl">
        <div className="rounded-2xl bg-background border border-primary/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                For CSR &amp; ESG teams
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Plantation drives with reports your board can read
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Bulk plantation, employee drives and Section 135 documentation — geo-tagged photos,
                survival tracking and CO₂ estimates for every batch.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center shrink-0">
              <a href="/Himsols-CSR-Pitch-Deck.pdf" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2 border-2">
                  <Download className="h-4 w-4" />
                  Pitch Deck (PDF)
                </Button>
              </a>
              <Link to="/corporate">
                <Button size="lg" className="gap-2 group">
                  Get CSR proposal
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

CSRSection.displayName = "CSRSection";
