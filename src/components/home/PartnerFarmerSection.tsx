import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, UserCheck, BarChart3 } from "lucide-react";

export const PartnerFarmerSection = memo(() => {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Partner Farmer Network
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            We work with verified agroforestry partner farmers. Each farmer is onboarded, approved, and monitored to ensure accountability and impact.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: UserCheck, title: "Onboarded", desc: "Background verification & land assessment" },
              { icon: Shield, title: "Approved", desc: "Meets agroforestry quality standards" },
              { icon: BarChart3, title: "Monitored", desc: "Periodic survival checks & reporting" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 p-5">
                <item.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <Link to="/farmer-registration">
            <Button size="lg" variant="outline" className="gap-2 group border-2 px-8">
              Become a Climate Partner Farmer
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

PartnerFarmerSection.displayName = "PartnerFarmerSection";
