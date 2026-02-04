import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { TreePine, Gift, Building2, Check, ArrowRight } from "lucide-react";

const offers = [
  {
    icon: TreePine,
    title: "Plant a Tree",
    tagline: "Plant trees in your name or for someone special.",
    price: "₹499",
    priceLabel: "/ tree",
    features: ["Certificate included", "Photo updates", "GPS location"],
    buttonText: "Plant Now",
    buttonLink: "/shop",
    highlight: true,
    color: "primary",
  },
  {
    icon: Gift,
    title: "Green Gift Cards",
    tagline: "A meaningful gift for birthdays, anniversaries & festivals.",
    price: "₹499+",
    priceLabel: "",
    features: ["Redeemable for tree plantation", "Valid for 12 months", "Digital delivery"],
    buttonText: "Buy Gift Card",
    buttonLink: "/gift-cards",
    highlight: false,
    color: "secondary",
  },
  {
    icon: Building2,
    title: "CSR & Corporate",
    tagline: "Verified green projects for CSR & sustainability goals.",
    price: "Custom",
    priceLabel: "",
    features: ["Plantation drives", "Reports & documentation", "Custom campaigns"],
    buttonText: "Partner with Us",
    buttonLink: "/corporate",
    highlight: false,
    color: "primary",
  },
];

export const KeyOffersSection = memo(() => {
  return (
    <section className="py-16 md:py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            Our Offerings
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your Green Action
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Multiple ways to contribute to a greener Himachal Pradesh
          </p>
        </div>

        {/* Offer Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {offers.map((offer) => (
            <Card
              key={offer.title}
              className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                offer.highlight
                  ? "border-primary/50 shadow-lg shadow-primary/10"
                  : "border-border/50"
              }`}
            >
              {offer.highlight && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
              )}
              
              <CardContent className="p-6 md:p-8">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-${offer.color}/10 flex items-center justify-center mb-6`}>
                  <offer.icon className={`h-7 w-7 text-${offer.color}`} />
                </div>

                {/* Title & Tagline */}
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {offer.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {offer.tagline}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">{offer.price}</span>
                  <span className="text-muted-foreground text-sm">{offer.priceLabel}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {offer.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Link to={offer.buttonLink}>
                  <Button
                    className="w-full gap-2 group"
                    variant={offer.highlight ? "default" : "outline"}
                  >
                    {offer.buttonText}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

KeyOffersSection.displayName = "KeyOffersSection";
