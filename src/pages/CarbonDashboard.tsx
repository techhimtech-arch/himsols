import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { TreeDeciduous, Wind, Users, MapPin, TrendingUp, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CarbonDashboard = () => {
  const { data: settings = [] } = useQuery({
    queryKey: ["carbon-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("carbon_settings").select("*");
      return data || [];
    },
  });

  const get = (key: string, fallback: string) => settings.find((s: any) => s.key === key)?.value || fallback;

  const currentTrees = parseInt(get("current_trees", "15000"));
  const targetTrees = parseInt(get("target_trees", "100000"));
  const survivalRate = parseFloat(get("survival_rate_percent", "85")) / 100;
  const absorptionRate = parseFloat(get("tree_absorption_rate_kg", "20"));
  const activeSites = get("active_sites", "12");
  const farmers = get("participating_farmers", "250");

  const co2Kg = currentTrees * survivalRate * absorptionRate;
  const co2Tonnes = (co2Kg / 1000).toFixed(1);
  const progressPercent = Math.min((currentTrees / targetTrees) * 100, 100);

  let plantationData: { month: string; trees: number }[] = [];
  try {
    plantationData = JSON.parse(get("plantation_data", "[]"));
  } catch { plantationData = []; }

  const impactCards = [
    { icon: TreeDeciduous, label: "Total Trees Planted", value: currentTrees.toLocaleString(), color: "text-primary" },
    { icon: Wind, label: "Estimated CO₂ Offset", value: `${co2Tonnes} tonnes`, color: "text-secondary" },
    { icon: Users, label: "Farmers Participating", value: farmers, color: "text-accent-foreground" },
    { icon: MapPin, label: "Active Plantation Sites", value: activeSites, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Carbon Impact Dashboard - Himsols" description="Measurable environmental impact from Himsols tree plantation activities. Track CO₂ offset, trees planted, and more." />
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Live Environmental Impact</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Carbon Impact Dashboard</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Transparent, real-time tracking of our environmental contributions through tree plantation activities in Himachal Pradesh.
          </p>
        </div>
      </section>

      {/* Impact Cards */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {impactCards.map((card) => (
              <Card key={card.label} className="text-center border-border/50">
                <CardContent className="pt-6 pb-4">
                  <card.icon className={`w-10 h-10 mx-auto mb-3 ${card.color}`} />
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Carbon Estimation Breakdown */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Carbon Estimation Breakdown</h2>
          <div className="max-w-2xl mx-auto">
            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trees Planted</span>
                  <span className="font-semibold text-foreground">{currentTrees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Survival Rate</span>
                  <span className="font-semibold text-foreground">{(survivalRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CO₂ Absorption / Tree / Year</span>
                  <span className="font-semibold text-foreground">{absorptionRate} kg</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total CO₂ Offset (kg)</span>
                  <span className="font-bold text-primary">{co2Kg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total CO₂ Offset (tonnes)</span>
                  <span className="font-bold text-primary">{co2Tonnes} tonnes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Trees Target vs Achieved</h2>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground">{currentTrees.toLocaleString()} / {targetTrees.toLocaleString()}</span>
              </div>
              <Progress value={progressPercent} className="h-4 mb-2" />
              <p className="text-xs text-muted-foreground text-right">{progressPercent.toFixed(1)}% achieved</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Plantation Growth Chart */}
      {plantationData.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Plantation Growth Over Time</h2>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="h-[300px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={plantationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Line type="monotone" dataKey="trees" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Transparency Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Transparency</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="how-we-calculate">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  How We Calculate Carbon Offset
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>Our carbon offset estimation is based on the following formula:</p>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                  CO₂ Offset = Trees Planted × Survival Rate × {absorptionRate}kg (per tree/year)
                </div>
                <p>The absorption rate of {absorptionRate} kg CO₂ per tree per year is based on standard agroforestry averages for mixed species plantations in the Himalayan foothills.</p>
                <p>Survival rate is monitored through regular field audits and updated by our team.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="disclaimer">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-muted-foreground" />
                  Disclaimer
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>These estimates are based on standard agroforestry averages and may vary depending on tree species, soil conditions, climate, and other environmental factors. The figures presented are indicative and not certified carbon credits. For verified carbon offset data, please contact our team.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CarbonDashboard;
