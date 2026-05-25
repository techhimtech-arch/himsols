import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { INDIAN_STATES } from "@/lib/constants";
import { TreePine, Truck, Camera, FileText, MapPin, CheckCircle2, Loader2, Building2, GraduationCap, Heart, Home, Landmark } from "lucide-react";
import { z } from "zod";

const TIERS = [
  { range: "100 – 249 trees", price: "₹249 / tree", note: "Pilot drive" },
  { range: "250 – 499 trees", price: "₹229 / tree", note: "Mid-scale" },
  { range: "500 – 999 trees", price: "₹199 / tree", note: "Panchayat scale" },
  { range: "1,000+ trees", price: "₹179 / tree", note: "Custom quote" },
];

const ORG_TYPES = [
  { value: "Panchayat", label: "Gram Panchayat / Municipality", icon: Landmark },
  { value: "CSR", label: "Corporate / CSR Team", icon: Building2 },
  { value: "School", label: "School / College", icon: GraduationCap },
  { value: "NGO", label: "NGO / Trust", icon: Heart },
  { value: "RWA", label: "Housing Society / RWA", icon: Home },
  { value: "Other", label: "Other", icon: Building2 },
];

const BUYERS = [
  { icon: Landmark, title: "Gram Panchayat", desc: "Plant 500–5,000 trees on village commons, school grounds, roadside." },
  { icon: Building2, title: "Corporate CSR", desc: "Bulk plantation with CSR documentation, geo-tagged photos, survival report." },
  { icon: GraduationCap, title: "Schools & Colleges", desc: "Campus greening + student engagement drives." },
  { icon: Heart, title: "NGOs & Trusts", desc: "Community plantation with verified delivery." },
];

const INCLUDED = [
  { icon: TreePine, text: "Native species selection (sapling 1–2 ft)" },
  { icon: Truck, text: "Delivery to your site (transport charged separately)" },
  { icon: MapPin, text: "Verified land mapping & planting guidance" },
  { icon: Camera, text: "Geo-tagged plantation photos" },
  { icon: FileText, text: "6-month survival report + impact certificate" },
];

const FormSchema = z.object({
  org_name: z.string().trim().min(2, "Required").max(150),
  org_type: z.string().min(1),
  contact_person: z.string().trim().min(2, "Required").max(100),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  state: z.string().min(1, "Required"),
  district: z.string().trim().max(100).optional().or(z.literal("")),
  village: z.string().trim().max(150).optional().or(z.literal("")),
  pin_code: z.string().trim().regex(/^[0-9]{6}$/, "6-digit PIN").optional().or(z.literal("")),
  tree_quantity: z.coerce.number().int().min(100, "Minimum 100 trees").max(100000),
  preferred_month: z.string().max(30).optional().or(z.literal("")),
  land_type: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
});

const BulkPlantation = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    org_name: "",
    org_type: "Panchayat",
    contact_person: "",
    phone: "",
    email: "",
    state: "Himachal Pradesh",
    district: "",
    village: "",
    pin_code: "",
    tree_quantity: 500 as number | string,
    preferred_month: "",
    land_type: "",
    notes: "",
    consent: false,
  });

  const upd = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = FormSchema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      toast({ title: "Check the form", description: first || "Please fill required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload = {
      org_name: parsed.data.org_name,
      org_type: parsed.data.org_type,
      contact_person: parsed.data.contact_person,
      phone: parsed.data.phone,
      email: parsed.data.email,
      state: parsed.data.state,
      district: parsed.data.district || null,
      village: parsed.data.village || null,
      pin_code: parsed.data.pin_code || null,
      tree_quantity: parsed.data.tree_quantity,
      preferred_month: parsed.data.preferred_month || null,
      land_type: parsed.data.land_type || null,
      notes: parsed.data.notes || null,
      consent: parsed.data.consent,
    };
    const { error } = await supabase.from("bulk_plantation_inquiries").insert(payload);
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not submit", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Inquiry received", description: "Our team will share a quote within 24 hours." });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Bulk Tree Plantation for Panchayat & CSR | Himsols"
        description="Plant 100 to 10,000+ trees in your village, campus or CSR site. Subsidised bulk rates, verified delivery, geo-tagged proof. Request a quote."
        keywords="bulk tree plantation, panchayat plantation, CSR plantation, school plantation drive, Himachal Pradesh"
      />
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="container mx-auto max-w-5xl text-center">
            <Badge className="mb-4">For Panchayats, CSR, Schools & NGOs</Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Plant 100 – 10,000 Trees in Your Village or Campus
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Subsidised bulk plantation packs for Gram Panchayats, CSR teams and institutions.
              Verified native species, delivery to your site, geo-tagged photos and a 6-month survival report.
            </p>
            <a href="#inquiry">
              <Button size="lg" className="gap-2">
                <TreePine className="h-5 w-5" /> Request a Quote
              </Button>
            </a>
          </div>
        </section>

        {/* Tier pricing */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">Subsidised Bulk Pricing</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Indicative per-tree rates. Final quote depends on species, site distance and quantity.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TIERS.map((t) => (
                <Card key={t.range} className="border-border/60">
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{t.note}</p>
                    <p className="text-lg font-semibold text-foreground mt-1">{t.range}</p>
                    <p className="text-2xl font-bold text-primary mt-2">{t.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="mt-6 bg-amber-50/50 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/40">
              <CardContent className="p-5 flex items-start gap-3">
                <Truck className="h-5 w-5 text-amber-700 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Transport charged separately</p>
                  <p className="text-sm text-muted-foreground">
                    Delivery (truck / tempo) is quoted based on distance from our nearest nursery to your site.
                    Shared transparently in the final quote — no hidden costs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What's included */}
        <section className="py-12 md:py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">What's Included</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {INCLUDED.map((f) => (
                <div key={f.text} className="flex items-start gap-3 bg-background p-4 rounded-xl border border-border/60">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-foreground pt-1.5">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who buys */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">Who Buys Bulk Plantation</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BUYERS.map((b) => (
                <Card key={b.title}>
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <b.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry form */}
        <section id="inquiry" className="py-12 md:py-20 px-4 bg-gradient-to-br from-primary/5 to-background">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">Request a Quote</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Tell us about your site — we'll share a written quote within 24 hours.
            </p>

            {submitted ? (
              <Card>
                <CardContent className="p-10 text-center space-y-3">
                  <CheckCircle2 className="h-14 w-14 text-primary mx-auto" />
                  <h3 className="text-2xl font-bold text-foreground">Inquiry received!</h3>
                  <p className="text-muted-foreground">
                    Our team will contact you within 24 hours with a detailed quote (per-tree price + transport).
                  </p>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ ...form, org_name: "", contact_person: "", phone: "", email: "", notes: "", consent: false }); }}>
                    Submit another inquiry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="org_name">Organisation name *</Label>
                        <Input id="org_name" value={form.org_name} onChange={(e) => upd("org_name", e.target.value)} maxLength={150} required />
                      </div>
                      <div>
                        <Label htmlFor="org_type">Organisation type *</Label>
                        <Select value={form.org_type} onValueChange={(v) => upd("org_type", v)}>
                          <SelectTrigger id="org_type"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ORG_TYPES.map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact_person">Contact person *</Label>
                        <Input id="contact_person" value={form.contact_person} onChange={(e) => upd("contact_person", e.target.value)} maxLength={100} required />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input id="phone" type="tel" value={form.phone} onChange={(e) => upd("phone", e.target.value)} maxLength={15} required />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} maxLength={255} required />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Select value={form.state} onValueChange={(v) => upd("state", v)}>
                          <SelectTrigger id="state"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="district">District</Label>
                        <Input id="district" value={form.district} onChange={(e) => upd("district", e.target.value)} maxLength={100} />
                      </div>
                      <div>
                        <Label htmlFor="pin_code">PIN code</Label>
                        <Input id="pin_code" inputMode="numeric" value={form.pin_code} onChange={(e) => upd("pin_code", e.target.value)} maxLength={6} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="village">Village / Site location</Label>
                      <Input id="village" value={form.village} onChange={(e) => upd("village", e.target.value)} maxLength={150} placeholder="e.g. School ground, Panchayat bhawan area" />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="tree_quantity">Tree quantity *</Label>
                        <Input id="tree_quantity" type="number" min={100} max={100000} value={form.tree_quantity} onChange={(e) => upd("tree_quantity", e.target.value)} required />
                        <p className="text-xs text-muted-foreground mt-1">Minimum 100</p>
                      </div>
                      <div>
                        <Label htmlFor="preferred_month">Preferred month</Label>
                        <Input id="preferred_month" value={form.preferred_month} onChange={(e) => upd("preferred_month", e.target.value)} maxLength={30} placeholder="e.g. July 2026" />
                      </div>
                      <div>
                        <Label htmlFor="land_type">Land type</Label>
                        <Input id="land_type" value={form.land_type} onChange={(e) => upd("land_type", e.target.value)} maxLength={100} placeholder="Panchayat / school / private" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (species preference, occasion, etc.)</Label>
                      <Textarea id="notes" value={form.notes} onChange={(e) => upd("notes", e.target.value)} rows={3} maxLength={1000} />
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox id="consent" checked={form.consent} onCheckedChange={(v) => upd("consent", v === true)} />
                      <Label htmlFor="consent" className="text-sm font-normal leading-snug">
                        I agree to be contacted by Himsols about this bulk plantation inquiry.
                      </Label>
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                      {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <>Submit Inquiry</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BulkPlantation;
