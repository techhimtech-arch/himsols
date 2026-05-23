import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { TreeDeciduous, Wind, Users, MapPin, TrendingUp, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CarbonDashboard = () => {
  // Admin knobs only — formula inputs / goal, not the headline counts.
  const { data: settings = [] } = useQuery({
    queryKey: ["carbon-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("carbon_settings").select("*");
      return data || [];
    },
  });
  const get = (key: string, fallback: string) => settings.find((s: any) => s.key === key)?.value || fallback;

  // Live, verified data from the same sources as /impact
  const { data: live, isLoading } = useQuery({
    queryKey: ["carbon-dashboard-live"],
    queryFn: async () => {
      const [allocRes, survRes, partnersRes, villagesRes, ordersRes] = await Promise.all([
        supabase.from("tree_allocations").select("tree_count"),
        supabase.from("survival_updates").select("health_status"),
        supabase.from("land_partner_applications").select("id").eq("status", "Verified"),
        (supabase as any).from("villages").select("id").eq("status", "active"),
        supabase.from("orders").select("quantity, created_at").eq("status", "completed"),
      ]);
      const allocs = (allocRes.data as any[]) || [];
      const survs = (survRes.data as any[]) || [];
      const partners = (partnersRes.data as any[]) || [];
      const villages = (villagesRes.data as any[]) || [];
      const orders = (ordersRes.data as any[]) || [];

      const currentTrees = allocs.reduce((s, a) => s + (a.tree_count || 0), 0);
      const survivalRate = survs.length > 0
        ? survs.filter((s) => s.health_status === "healthy").length / survs.length
        : null;
      const farmers = partners.length;
      const activeSites = villages.length || partners.length;

      // Group orders by month for the growth chart
      const byMonth = new Map<string, number>();
      orders.forEach((o) => {
        const d = new Date(o.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        byMonth.set(key, (byMonth.get(key) || 0) + (o.quantity || 0));
      });
      const sortedKeys = Array.from(byMonth.keys()).sort();
      let cumulative = 0;
      const plantationData = sortedKeys.map((k) => {
        cumulative += byMonth.get(k) || 0;
        const [y, m] = k.split("-");
        const label = new Date(Number(y), Number(m) - 1, 1).toLocaleString("en", { month: "short", year: "2-digit" });
        return { month: label, trees: cumulative };
      });

      return { currentTrees, survivalRate, farmers, activeSites, plantationData };
    },
  });

  const absorptionRate = parseFloat(get("tree_absorption_rate_kg", "22"));
  const targetTrees = parseInt(get("target_trees", "100000"));
  // Admin can still override survival rate when no field data exists.
  const survivalOverride = parseFloat(get("survival_rate_percent", "")) / 100;
  const survivalRate = live?.survivalRate ?? (Number.isFinite(survivalOverride) && survivalOverride > 0 ? survivalOverride : 0.85);

  const currentTrees = live?.currentTrees ?? 0;
  const farmers = live?.farmers ?? 0;
  const activeSites = live?.activeSites ?? 0;
  const plantationData = live?.plantationData ?? [];

  const co2Kg = currentTrees * survivalRate * absorptionRate;
  const co2Tonnes = (co2Kg / 1000).toFixed(1);
  const progressPercent = targetTrees > 0 ? Math.min((currentTrees / targetTrees) * 100, 100) : 0;

  const impactCards = [
    { icon: TreeDeciduous, label: "Verified Trees Allocated", value: currentTrees.toLocaleString(), color: "text-primary" },
    { icon: Wind, label: "Estimated CO₂ Offset*", value: `~${co2Tonnes} tonnes`, color: "text-secondary" },
    { icon: Users, label: "Verified Land Partners", value: farmers.toLocaleString(), color: "text-accent-foreground" },
    { icon: MapPin, label: "Active Plantation Sites", value: activeSites.toLocaleString(), color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Carbon Impact Dashboard - Himsols" description="Verified environmental impact from Himsols tree plantation activities. Live counts of allocated trees, survival, and estimated CO₂ offset." />
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Live Environmental Impact</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Environmental Impact</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Numbers below are computed live from verified orders, allocations and partner records. CO₂ figures are estimates based on standard agroforestry averages.
          </p>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-accent/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 flex items-start gap-3 max-w-3xl mx-auto">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Tree, partner and site counts are live from our database. CO₂ values are indicative estimates — not certified carbon credits.
          </p>
        </div>
      </div>

      {/* Impact Cards */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading live impact…</p>
          ) : (
            <>
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
              {currentTrees === 0 && (
                <p className="text-center text-sm text-muted-foreground mt-6">
                  No verified allocations yet — counters will update automatically as trees are allocated to partner land.
                </p>
              )}
            </>
          )}
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
                  <span className="text-muted-foreground">Verified Trees Allocated</span>
                  <span className="font-semibold text-foreground">{currentTrees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Survival Rate{live?.survivalRate == null ? " (assumed)" : ""}</span>
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
                  CO₂ Offset = Verified Trees × Survival Rate × {absorptionRate} kg (per tree/year)
                </div>
                <p>The absorption rate of {absorptionRate} kg CO₂ per tree per year is based on standard agroforestry averages for mixed species plantations in the Himalayan foothills.</p>
                <p>Survival rate comes from field health updates uploaded by our partner-network team. When no field data exists yet, an assumed baseline is shown and labelled accordingly.</p>
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
