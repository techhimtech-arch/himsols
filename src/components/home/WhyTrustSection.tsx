import { memo } from "react";
import { Check, Quote } from "lucide-react";

const trustPoints = [
  {
    text: "Focus on survival, not just planting",
    description: "We track every tree post-plantation to ensure long-term survival — not just photo uploads",
  },
  {
    text: "No middlemen exploitation",
    description: "Direct support to farming communities without intermediaries",
  },
  {
    text: "Rural employment generation",
    description: "Creating green livelihood opportunities for rural youth and farmers",
  },
  {
    text: "Village-level structured programs",
    description: "Organized greening campaigns at the village level with digital tracking and reporting",
  },
];

export const WhyTrustSection = memo(() => {
  return (
    <section className="py-16 md:py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Trust Points */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Why Choose Himsols
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">
              Trust Built on Transparency
            </h2>

            <div className="space-y-6">
              {trustPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex gap-4 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {point.text}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quote Card */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary/10 rounded-full blur-2xl" />
            
            <div className="relative bg-background/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-border/50 shadow-xl">
              <Quote className="h-12 w-12 text-primary/20 mb-6" />
              
              <blockquote className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-8">
                "When you plant with Himsols, you don't just buy — you contribute to a greener tomorrow for Himachal Pradesh."
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                  H
                </div>
                <div>
                  <div className="font-semibold text-foreground">Himsols Team</div>
                  <div className="text-muted-foreground text-sm">Growing a Greener Tomorrow</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

WhyTrustSection.displayName = "WhyTrustSection";
