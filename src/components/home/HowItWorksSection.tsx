import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TreePine, Users, Camera, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: TreePine,
    title: "Choose Your Green Action",
    description: "Tree plantation · Green gift · CSR campaign",
    color: "primary",
  },
  {
    number: "02",
    icon: Users,
    title: "We Plant with Local Farmers",
    description: "Trees are planted and cared for by rural communities",
    color: "secondary",
  },
  {
    number: "03",
    icon: Camera,
    title: "Track Your Impact",
    description: "Get photos, location & a digital certificate",
    color: "primary",
  },
];

export const HowItWorksSection = memo(() => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 relative bg-muted/30">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple & Transparent
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How Himsols Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to create lasting environmental impact
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group"
            >
              {/* Connector line (hidden on mobile, shown between cards on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                {/* Step Number */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-${step.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <step.icon className={`h-7 w-7 text-${step.color}`} />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">{step.number}</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/shop">
            <Button size="lg" className="gap-2 group">
              Start Your Green Journey
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";
