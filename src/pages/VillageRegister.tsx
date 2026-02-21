import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, TreePine, CheckCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { INDIAN_STATES, getDistrictsForState, type IndianState } from "@/lib/constants";
import { SEO } from "@/components/SEO";

const VillageRegister = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("Himachal Pradesh");
  const [form, setForm] = useState({
    name: "",
    district: "",
    state: "Himachal Pradesh",
    block: "",
    contact_person: "",
    phone: "",
    email: "",
    population: "",
    current_tree_count: "",
    trees_requested: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("villages" as any).insert({
        name: form.name.trim(),
        district: form.district,
        state: form.state,
        block: form.block.trim() || null,
        contact_person: form.contact_person.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        population: form.population ? parseInt(form.population) : null,
        current_tree_count: form.current_tree_count ? parseInt(form.current_tree_count) : 0,
        trees_requested: form.trees_requested ? parseInt(form.trees_requested) : 0,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "सफल!", description: "गाँव पंजीकरण सफलतापूर्वक जमा हो गया।" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-lg text-center">
            <CheckCircle className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">पंजीकरण सफल!</h1>
            <p className="text-muted-foreground mb-2">आपके गाँव का पंजीकरण सफलतापूर्वक हो गया है।</p>
            <p className="text-muted-foreground mb-8">हमारी टीम जल्द ही आपसे संपर्क करेगी।</p>
            <Button onClick={() => window.location.href = "/"}>होमपेज पर जाएं</Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO title="Village Registration - Himsols" description="Register your village for tree plantation and greening programs with Himsols." />
      <Navbar />

      <section className="pt-32 pb-8 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <MapPin className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">गाँव पंजीकरण</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            अपने गाँव/पंचायत को Himsols के Village Greening Program से जोड़ें। मुफ्त पौधे, नर्सरी सहायता और डिजिटल ट्रैकिंग पाएं।
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-primary" />
                Village Registration Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">गाँव/पंचायत का नाम *</Label>
                    <Input id="name" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Village Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="block">ब्लॉक</Label>
                    <Input id="block" value={form.block} onChange={e => setForm(p => ({ ...p, block: e.target.value }))} placeholder="Block Name" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>राज्य *</Label>
                    <Select value={selectedState} onValueChange={v => { setSelectedState(v); setForm(p => ({ ...p, state: v, district: "" })); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>जिला *</Label>
                    <Select value={form.district} onValueChange={v => setForm(p => ({ ...p, district: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                      <SelectContent>
                        {getDistrictsForState(selectedState as IndianState).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person">संपर्क व्यक्ति *</Label>
                    <Input id="contact_person" required value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} placeholder="Contact Person Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">फ़ोन नंबर *</Label>
                    <Input id="phone" required type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">ईमेल (वैकल्पिक)</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email Address" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="population">जनसंख्या (अनुमानित)</Label>
                    <Input id="population" type="number" value={form.population} onChange={e => setForm(p => ({ ...p, population: e.target.value }))} placeholder="~500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_tree_count">मौजूदा पेड़</Label>
                    <Input id="current_tree_count" type="number" value={form.current_tree_count} onChange={e => setForm(p => ({ ...p, current_tree_count: e.target.value }))} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trees_requested">कितने पेड़ चाहिए</Label>
                    <Input id="trees_requested" type="number" value={form.trees_requested} onChange={e => setForm(p => ({ ...p, trees_requested: e.target.value }))} placeholder="100" />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading || !form.name || !form.district || !form.contact_person || !form.phone}>
                  {loading ? "जमा हो रहा है..." : "गाँव पंजीकृत करें"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VillageRegister;
