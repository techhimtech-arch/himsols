import { memo } from "react";
import { TreePine, Users, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: TreePine,
    title: "You Sponsor Trees",
    description: "Choose a climate impact pack or custom quantity. Payment is processed securely via Razorpay.",
  },
  {
    number: "02",
    icon: Users,
    title: "We Allocate to Verified Partner Farmers",
    description: "Trees are assigned to onboarded, approved agroforestry farmers across Himachal Pradesh.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "You Receive Survival Reports & CO₂ Data",
    description: "Get geo-tagged photos, periodic survival updates, and estimated carbon offset certificates.",
  },
];

export const HowItWorksSection = memo(() => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A transparent, three-step process from sponsorship to measurable impact.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-[60%] w-[80%] h-px bg-border" />
              )}
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-3xl font-bold text-muted-foreground/20">{step.number}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";
