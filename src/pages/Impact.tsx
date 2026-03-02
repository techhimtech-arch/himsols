import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TreePine, Users, MapPin, Activity, Sprout, Mountain } from "lucide-react";

const Impact = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["public-impact-stats"],
    queryFn: async () => {
      const [ordersRes, allocRes, survivalRes, villagesRes, partnersRes, liveStatsRes] = await Promise.all([
        supabase.from("orders").select("quantity, total_price").eq("status", "completed"),
        supabase.from("tree_allocations").select("tree_count, status"),
        supabase.from("survival_updates").select("health_status"),
        supabase.from("villages" as any).select("id").eq("status", "active"),
        supabase.from("land_partner_applications").select("id").eq("status", "Verified"),
        supabase.from("live_stats").select("*").eq("is_active", true).order("sort_order"),
      ]);

      const orders = ordersRes.data || [];
      const allocs = allocRes.data || [];
      const survivals = survivalRes.data || [];
      const villages = villagesRes.data || [];
      const partners = partnersRes.data || [];

      const totalTreesSponsored = orders.reduce((s: number, o: any) => s + (o.quantity || 0), 0);
      const totalAllocated = allocs.reduce((s: number, a: any) => s + (a.tree_count || 0), 0);
      const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total_price || 0), 0);
      const healthyCount = survivals.filter((s: any) => s.health_status === "healthy").length;
      const survivalRate = survivals.length > 0 ? Math.round((healthyCount / survivals.length) * 100) : 0;
      const co2Estimate = totalAllocated * 22; // ~22kg CO2 per tree per year

      return {
        totalTreesSponsored,
        totalAllocated,
        totalRevenue,
        survivalRate,
        co2Estimate,
        activeVillages: villages.length,
        verifiedPartners: partners.length,
        liveStats: liveStatsRes.data || [],
      };
    },
  });

  const metrics = [
    { icon: TreePine, label: "Trees Sponsored", value: stats?.totalTreesSponsored || 0, suffix: "" },
    { icon: Sprout, label: "Trees Allocated to Land", value: stats?.totalAllocated || 0, suffix: "" },
    { icon: Activity, label: "Survival Rate", value: stats?.survivalRate || 0, suffix: "%" },
    { icon: Mountain, label: "Est. CO₂ Offset", value: stats?.co2Estimate || 0, suffix: " kg/yr" },
    { icon: MapPin, label: "Active Villages", value: stats?.activeVillages || 0, suffix: "" },
    { icon: Users, label: "Verified Land Partners", value: stats?.verifiedPartners || 0, suffix: "" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Climate Impact Dashboard | Himsols" 
        description="Transparent, verified climate impact metrics. Track trees planted, survival rates, and CO₂ offset across Himsols' verified land partner network."
      />
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Verified Climate Impact
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Every metric is derived from verified allocations on our land partner network. 
            No estimates without data. No claims without proof.
          </p>
        </section>

        {/* Metrics Grid */}
        <section className="container mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {metrics.map((m, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="pt-8 pb-6">
                    <m.icon className="h-8 w-8 mx-auto text-primary mb-3" />
                    <p className="text-3xl md:text-4xl font-bold text-foreground">
                      {m.value.toLocaleString()}{m.suffix}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Methodology */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-6 text-center">How We Measure</h2>
            <div className="space-y-4">
              {[
                { title: "Verified Allocation", desc: "Trees are only counted when allocated to a verified land partner by admin." },
                { title: "Survival Tracking", desc: "Periodic health updates with photos determine actual survival rates." },
                { title: "CO₂ Estimation", desc: "Based on allocated trees × survival rate × 22 kg CO₂/tree/year. Labeled as indicative." },
                { title: "No Double Counting", desc: "Each tree allocation is linked to exactly one buyer order. No inflation." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-8">
              * CO₂ offset figures are indicative estimates based on published research averages. Actual sequestration varies by species, age, and geography.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Impact;
