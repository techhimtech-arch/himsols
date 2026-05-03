import { memo, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Recycle, Wallet, TreePine, ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

interface ScrapType {
  id: string;
  name: string;
  name_hi: string | null;
  rate_per_kg: number;
  unit: string;
}

export const ScrapToWalletSection = memo(() => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const { data: scrapTypes = [] } = useQuery({
    queryKey: ["scrap-types-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrap_types")
        .select("id, name, name_hi, rate_per_kg, unit")
        .eq("is_active", true)
        .order("rate_per_kg", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as ScrapType[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const [selectedId, setSelectedId] = useState<string>("");
  const [qty, setQty] = useState<string>("5");

  const selected = useMemo(
    () => scrapTypes.find((s) => s.id === selectedId) || scrapTypes[0],
    [scrapTypes, selectedId]
  );

  const credit = useMemo(() => {
    const q = parseFloat(qty);
    if (!selected || !q || q <= 0) return 0;
    return Math.round(selected.rate_per_kg * q);
  }, [selected, qty]);

  const treesPossible = Math.floor(credit / 299);

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />
      <div className="container mx-auto relative z-10 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary">
            <Recycle className="h-3.5 w-3.5" />
            {isHi ? "स्क्रैप → वॉलेट → पेड़" : "Scrap → Wallet → Plant"}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            {isHi ? (
              <>कचरा दो, <span className="text-primary">पैसा लो</span>, पेड़ लगाओ</>
            ) : (
              <>Sell Scrap. <span className="text-primary">Earn Wallet Credit.</span> Plant Trees.</>
            )}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isHi
              ? "अपना घर का कचरा हमें दो — पिकअप मुफ्त है। पैसा सीधे तुम्हारे Himsols वॉलेट में, जिससे पेड़, पौधे या स्थानीय उत्पाद खरीदो।"
              : "Free doorstep pickup. Get instant Himsols wallet credit — spend it on trees, plants or local products. Zero cash, full circular impact."}
          </p>
        </div>

        {/* Flow visualization */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Recycle, title: isHi ? "1. पिकअप बुक करो" : "1. Book Free Pickup", desc: isHi ? "घर से मुफ्त कलेक्शन" : "We collect from your door" },
            { icon: Wallet, title: isHi ? "2. वॉलेट में क्रेडिट" : "2. Wallet Credited", desc: isHi ? "वज़न के हिसाब से तुरंत" : "Instantly, by actual weight" },
            { icon: TreePine, title: isHi ? "3. पेड़ लगाओ" : "3. Plant a Tree", desc: isHi ? "₹299 से शुरू" : "Starting at ₹299" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-card/60 backdrop-blur border border-border/50">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <step.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold">{step.title}</div>
                <div className="text-sm text-muted-foreground">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Calculator + CTA card */}
        <Card className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Calculator */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Calculator className="h-4 w-4" />
                {isHi ? "अपनी कमाई देखो" : "See your expected credit"}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    {isHi ? "स्क्रैप का प्रकार" : "Scrap type"}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {scrapTypes.map((s) => {
                      const active = (selected?.id ?? scrapTypes[0]?.id) === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedId(s.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            active
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-background border-border hover:border-primary/50"
                          }`}
                        >
                          {isHi && s.name_hi ? s.name_hi : s.name} · ₹{s.rate_per_kg}/{s.unit}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="qty" className="text-xs text-muted-foreground mb-2 block">
                    {isHi ? "अनुमानित मात्रा (kg)" : "Estimated quantity (kg)"}
                  </Label>
                  <Input
                    id="qty"
                    type="number"
                    min="0"
                    step="0.5"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="max-w-[160px]"
                  />
                </div>
              </div>
            </div>

            {/* Result + CTA */}
            <div className="space-y-5 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  {isHi ? "अनुमानित वॉलेट क्रेडिट" : "Expected wallet credit"}
                </div>
                <div className="text-5xl md:text-6xl font-bold text-primary mt-1">
                  ₹{credit.toLocaleString("en-IN")}
                </div>
                {treesPossible > 0 && (
                  <div className="mt-2 text-sm text-foreground/80 flex items-center gap-1.5">
                    <TreePine className="h-4 w-4 text-primary" />
                    {isHi
                      ? `= ${treesPossible} पेड़ लगाने लायक`
                      : `= enough to plant ${treesPossible} tree${treesPossible > 1 ? "s" : ""}`}
                  </div>
                )}
              </div>

              <Link to="/waste-management" className="block">
                <Button size="lg" className="w-full gap-2 text-base shadow-lg group">
                  <Recycle className="h-5 w-5" />
                  {isHi ? "मुफ्त पिकअप बुक करो" : "Request Free Pickup"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <p className="text-xs text-muted-foreground text-center">
                {isHi
                  ? "* अंतिम क्रेडिट कलेक्शन पर वास्तविक वज़न के हिसाब से होगा।"
                  : "* Final credit is based on actual weight measured at pickup."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
});

ScrapToWalletSection.displayName = "ScrapToWalletSection";
