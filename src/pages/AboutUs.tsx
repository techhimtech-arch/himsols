import { memo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TreePine, Users, Heart, MapPin, Camera, Sprout, Mountain, Loader2, AlertTriangle, Lightbulb, Target, TrendingUp, Eye, ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const iconMap: Record<string, any> = { TreePine, Users, Heart, MapPin, Camera, Sprout, Mountain, AlertTriangle, Lightbulb, Target, TrendingUp, Eye };

const problemPoints = [
  "Farmers struggle to access affordable, quality planting material",
  "CSR funds often lack transparency and survival tracking",
  "Villages don't have structured environmental campaigns",
  "Youth migration is increasing due to lack of green livelihood opportunities",
];

const solutionPillars = [
  { icon: Users, title: "Connects farmers to affordable planting materials", desc: "Local nursery partnerships for subsidized plants" },
  { icon: Target, title: "Enables CSR-backed tree campaigns in villages", desc: "Structured village greening programs" },
  { icon: Camera, title: "Tracks plantation and survival digitally", desc: "Photo proof, GPS, and digital certificates" },
  { icon: TrendingUp, title: "Generates rural employment", desc: "Green livelihood opportunities for rural youth" },
];

const howItWorksSteps = [
  { step: "1", title: "Campaign Registration", desc: "A village or CSR partner registers a greening campaign" },
  { step: "2", title: "Nursery Connection", desc: "We connect them to verified local nurseries" },
  { step: "3", title: "Subsidized Distribution", desc: "Farmers receive subsidized plants for plantation" },
  { step: "4", title: "Digital Tracking", desc: "Plantation data + survival updates are logged digitally" },
];

const targetSegments = ["CSR departments", "Educational institutions", "Panchayats", "Environment-focused NGOs", "Rural farmers"];

const AboutUs = memo(() => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["about-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_items")
        .select("*")
        .in("section_key", ["about_values", "about_milestones"])
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const milestoneItems = items.filter(i => i.section_key === "about_milestones");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="About Himsols | Rural Green Infrastructure Platform" description="Himsols shifts focus from plantation to plant survival. A digital + on-ground ecosystem connecting farmers, CSR, and verified impact." />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sprout className="h-4 w-4" />
            <span>Rural Green Infrastructure Platform</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            From Plantation to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Plant Survival
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            India plants millions of trees every year. But most don't survive — because planting is treated as an event, not a long-term responsibility. We are building something that changes this.
          </p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
                <AlertTriangle className="h-4 w-4" />
                The Problem
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Tree plantation drives happen. But long-term care? No system.
              </h2>
              <p className="text-muted-foreground mb-6">
                There is no integrated platform connecting Farmers + CSR + Verified Impact + Supply Chain.
              </p>
            </div>
            <div className="space-y-4">
              {problemPoints.map((point, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-foreground font-medium">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 md:py-20 bg-primary/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Lightbulb className="h-4 w-4" />
              The Solution
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What is Himsols?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A digital + on-ground ecosystem that enables structured village greening programs instead of one-time plantation drives.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {solutionPillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <Card key={i} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="bg-primary/10 p-3 rounded-xl h-fit">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{pillar.title}</h3>
                        <p className="text-sm text-muted-foreground">{pillar.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground">We are not just planting trees. We are building green rural infrastructure.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, i) => (
              <div key={i} className="relative text-center p-6 rounded-2xl bg-background border border-border/50 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones / Impact from DB */}
      {milestoneItems.length > 0 && (
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Our Impact So Far</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              {milestoneItems.map((m) => {
                const Icon = iconMap[m.icon || "Sprout"] || Sprout;
                return (
                  <Card key={m.id} className="text-center border-none shadow-sm">
                    <CardContent className="pt-6">
                      <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-foreground">{isHi ? m.title_hi || m.title_en : m.title_en}</p>
                      <p className="text-sm text-muted-foreground">{isHi ? m.description_hi || m.description_en : m.description_en}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Market & Target Segments */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Who We Serve</h2>
              <p className="text-muted-foreground mb-6">
                India spends thousands of crores annually on CSR activities, afforestation, and climate action — yet the system lacks transparency and digital integration.
              </p>
              <div className="space-y-3">
                {targetSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">{seg}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8 text-center">
              <p className="text-5xl font-bold text-primary mb-2">100+</p>
              <p className="text-muted-foreground">Villages × 1,000 trees annually</p>
              <p className="text-sm text-muted-foreground mt-2">The scale impact becomes massive</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Eye className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Vision</h2>
          <p className="text-xl md:text-2xl text-foreground leading-relaxed font-medium mb-4">
            Every village should have a digital green identity.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Where every planted tree is tracked. Every CSR rupee is visible. Every farmer benefits. We are not just building a startup — we are building a system where rural India grows trees, and grows with them.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link to="/shop">
                <TreePine className="h-5 w-5" />
                Plant a Tree
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/campaigns">Explore Campaigns</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
});

AboutUs.displayName = "AboutUs";
export default AboutUs;
