import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Users, TreePine, BarChart3, Briefcase, Download, ShieldCheck } from "lucide-react";

const programs = [
  { icon: TreePine, title: "Bulk Plantation Drives", desc: "Large-scale verified plantation projects across multiple villages." },
  { icon: Users, title: "Employee Engagement Events", desc: "On-ground team participation with photo and video documentation." },
  { icon: Building2, title: "Village Adoption Programs", desc: "End-to-end greening of partner villages with long-term tracking." },
  { icon: BarChart3, title: "Carbon Impact Dashboards", desc: "Real-time reporting with CO₂ offset estimates and survival data." },
  { icon: Briefcase, title: "Custom Climate Programs", desc: "Tailored sustainability initiatives aligned to your CSR goals." },
];

export const CSRSection = memo(() => {
  return (
    <section className="py-16 md:py-24 px-4 bg-primary/5">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-primary/20 bg-background text-primary mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            For CSR & ESG Teams
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            CSR-Ready Climate Programs
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Structured, compliant, and measurable green programs designed for Section 135 CSR mandates and ESG reporting.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {programs.map((p) => (
            <div key={p.title} className="rounded-2xl bg-background border border-border/50 p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-background border border-primary/20 p-6 md:p-8 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Ready to see the details?</h3>
              <p className="text-muted-foreground text-sm">Download our 1-page CSR pitch deck or request a custom proposal.</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center shrink-0">
              <a href="/Himsols-CSR-Pitch-Deck.pdf" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2 border-2">
                  <Download className="h-4 w-4" />
                  Pitch Deck (PDF)
                </Button>
              </a>
              <Link to="/csr-carbon-offset">
                <Button size="lg" className="gap-2 group">
                  Get CSR Proposal
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
