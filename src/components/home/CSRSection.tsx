import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Users, TreePine, BarChart3, Briefcase } from "lucide-react";

const programs = [
  { icon: TreePine, title: "Bulk Plantation Drives", desc: "Large-scale verified plantation projects across multiple villages." },
  { icon: Users, title: "Employee Engagement Events", desc: "On-ground team participation with photo and video documentation." },
  { icon: Building2, title: "Village Adoption Programs", desc: "End-to-end greening of partner villages with long-term tracking." },
  { icon: BarChart3, title: "Carbon Impact Dashboards", desc: "Real-time reporting with CO₂ offset estimates and survival data." },
  { icon: Briefcase, title: "Custom Climate Programs", desc: "Tailored sustainability initiatives aligned to your CSR goals." },
];

export const CSRSection = memo(() => {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            CSR-Ready Climate Programs
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Structured, compliant, and measurable green programs designed for corporate sustainability mandates.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {programs.map((p) => (
            <div key={p.title} className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <p.icon className="h-5.5 w-5.5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/corporate">
            <Button size="lg" variant="outline" className="gap-2 group border-2 px-8 text-base">
              Request CSR Proposal
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

CSRSection.displayName = "CSRSection";
