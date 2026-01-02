import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { TreePine, Recycle, BookOpen, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const services = [
  {
    icon: TreePine,
    title: "Tree Plantation",
    description: "Request tree plantation in your village, school, or community area. We provide native species and complete support.",
    features: ["Free consultation", "Native species", "Post-care support"],
    color: "hsl(150, 45%, 35%)",
    link: "/tree-plantation",
    cta: "Book Plantation"
  },
  {
    icon: Recycle,
    title: "Scrap Collection",
    description: "Schedule doorstep pickup for metals, e-waste, paper, plastic. Get fair prices for your valuable scrap.",
    features: ["Free pickup", "Best prices", "All scrap types"],
    color: "hsl(200, 70%, 45%)",
    link: "/waste-management",
    cta: "Schedule Pickup"
  },
  {
    icon: BookOpen,
    title: "Conservation Training",
    description: "Expert guidance on sustainable practices, water conservation, and eco-friendly living for your community.",
    features: ["Expert trainers", "Hands-on workshops", "Certificates"],
    color: "hsl(40, 65%, 50%)",
    link: "/contact?subject=Conservation Training",
    cta: "Get Training"
  },
  {
    icon: Calendar,
    title: "Eco Events",
    description: "Join plantation drives, cleanup campaigns, and sustainability workshops in your area.",
    features: ["Monthly events", "Community driven", "Free participation"],
    color: "hsl(280, 60%, 50%)",
    link: "/contact?subject=Eco Event Registration",
    cta: "Join Event"
  }
];

export const ActionableServicesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 px-4 relative">
      <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-slide-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            What Would You Like to Do?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose a service below and take action today. Real impact starts with a simple request.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={service.title}
              className="group hover:shadow-xl transition-all duration-500 border-border/50 bg-background/80 backdrop-blur-xl overflow-hidden hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 flex flex-col h-full">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${service.color}, hsl(from ${service.color} h s calc(l * 1.2)))`,
                  }}
                >
                  <service.icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-5">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link to={service.link} className="mt-auto">
                  <Button className="w-full gap-2 group/btn">
                    {service.cta}
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
