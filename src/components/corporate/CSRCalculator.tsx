import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, Download, Leaf, IndianRupee, TreePine, CheckCircle2 } from "lucide-react";

const COST_PER_TREE = 299;
const CO2_PER_TREE_PER_YEAR = 22; // kg — estimate

export const CSRCalculator = () => {
  const { toast } = useToast();
  const [trees, setTrees] = useState(1000);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
  });

  const numbers = useMemo(() => {
    const budget = trees * COST_PER_TREE;
    const co2Year = (trees * CO2_PER_TREE_PER_YEAR) / 1000; // tonnes
    return {
      budget,
      co2Year: co2Year.toFixed(1),
      co2FiveYear: (co2Year * 5).toFixed(1),
      season: trees <= 2000 ? "1 monsoon window" : "2 monsoon windows",
    };
  }, [trees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from("csr_partners").insert({
        company_name: form.companyName,
        company_type: "corporate",
        contact_person: form.contactPerson,
        email: form.email,
        phone: form.phone,
        interest_area: "CSR plantation",
        budget_range: `₹${numbers.budget.toLocaleString("en-IN")}`,
        estimated_trees: trees,
        estimated_budget: numbers.budget,
        message: `Calculator estimate: ${trees} trees · ₹${numbers.budget.toLocaleString(
          "en-IN",
        )} · ~${numbers.co2Year} tCO₂e/year (estimate)`,
        status: "inquiry",
      });
      if (error) throw error;
      setDone(true);
      toast({
        title: "Estimate saved",
        description: "Download the proposal deck — we will follow up within 24 hours.",
      });
    } catch (err: any) {
      toast({ title: "Could not submit", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="csr-calculator" className="py-16 px-4 bg-muted/40">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-primary">
            <Calculator className="h-3.5 w-3.5" />
            CSR budget &amp; CO₂ estimator
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-3">
            See what your CSR budget plants
          </h2>
          <p className="text-muted-foreground">
            Move the slider, get an indicative budget and CO₂ estimate, then download the proposal
            deck. All CO₂ figures are estimates based on {CO2_PER_TREE_PER_YEAR}kg per tree per year
            at maturity.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 md:p-8">
              <Label className="text-sm font-semibold">Number of trees</Label>
              <div className="mt-4 mb-6">
                <Slider
                  value={[trees]}
                  min={100}
                  max={25000}
                  step={100}
                  onValueChange={(v) => setTrees(v[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>100</span>
                  <span>25,000</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-primary mb-6">
                {trees.toLocaleString("en-IN")} <span className="text-lg text-foreground">trees</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4">
                  <IndianRupee className="h-4 w-4 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Indicative budget</p>
                  <p className="text-lg font-bold text-foreground">
                    ₹{numbers.budget.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <Leaf className="h-4 w-4 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">CO₂ / year (estimate)</p>
                  <p className="text-lg font-bold text-foreground">{numbers.co2Year} t</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <TreePine className="h-4 w-4 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">5-year CO₂ (estimate)</p>
                  <p className="text-lg font-bold text-foreground">{numbers.co2FiveYear} t</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <CheckCircle2 className="h-4 w-4 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Plantation timeline</p>
                  <p className="text-lg font-bold text-foreground">{numbers.season}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-4">
                Indicative only at ₹{COST_PER_TREE}/tree including sapling, plantation and proof
                reporting. Final quote depends on species, site and reporting scope.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardContent className="p-6 md:p-8">
              {done ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Estimate sent to our team</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    We will email a costed proposal for {trees.toLocaleString("en-IN")} trees within
                    24 hours. Meanwhile, here is the deck you can share internally.
                  </p>
                  <a href="/Himsols-CSR-Pitch-Deck.pdf" target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2">
                      <Download className="h-4 w-4" />
                      Download proposal deck
                    </Button>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Get this as a proposal</h3>
                    <p className="text-sm text-muted-foreground">
                      Board-ready PDF with plantation plan, proof process and Section 135 notes.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="csrc-company">Company name</Label>
                    <Input
                      id="csrc-company"
                      required
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="csrc-person">Contact person</Label>
                    <Input
                      id="csrc-person"
                      required
                      value={form.contactPerson}
                      onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="csrc-email">Work email</Label>
                      <Input
                        id="csrc-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="csrc-phone">Phone</Label>
                      <Input
                        id="csrc-phone"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? "Sending..." : "Get proposal for these trees"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">
                    No payment now. We send a costed proposal first.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
