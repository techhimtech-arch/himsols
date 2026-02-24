import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe, TreeDeciduous, MapPin, Camera, ShieldCheck, FileText,
  ArrowRight, CheckCircle2, Users, BarChart3, Leaf, Building2
} from "lucide-react";

const BUDGET_RANGES = ["Under ₹5 Lakh", "₹5-15 Lakh", "₹15-50 Lakh", "₹50 Lakh - ₹1 Cr", "₹1 Cr+", "Not Sure"];
const MODELS = ["One-time Plantation", "Ongoing Offset Program"];

const workflowSteps = [
  { icon: Building2, label: "Company", desc: "Initiates CSR/offset project" },
  { icon: TreeDeciduous, label: "Funds Plantation", desc: "Funds tree planting" },
  { icon: MapPin, label: "Trees Planted", desc: "Geo-tagged planting" },
  { icon: Camera, label: "Monitoring", desc: "Survival tracking & audits" },
  { icon: FileText, label: "Impact Report", desc: "Transparent documentation" },
];

const offerings = [
  { icon: TreeDeciduous, title: "Corporate Plantation Drives", desc: "Organized tree planting events for your team with full logistical support." },
  { icon: MapPin, title: "Geo-Tagged Records", desc: "Every tree is geo-tagged with GPS coordinates for complete transparency." },
  { icon: ShieldCheck, title: "Tree Survival Monitoring", desc: "Regular health audits and survival tracking with photo evidence." },
  { icon: BarChart3, title: "Carbon Impact Reports", desc: "Detailed CO₂ offset estimation reports based on your plantation data." },
  { icon: FileText, title: "CSR Documentation", desc: "Complete documentation support for CSR compliance and reporting." },
  { icon: Camera, title: "Plantation Certificates", desc: "PDF certificates with geo-tagged photos for each plantation drive." },
];

const whyPartner = [
  { icon: Users, title: "Local Farmer Network", desc: "Direct collaboration with 250+ farmers across Himachal Pradesh." },
  { icon: Leaf, title: "Community-Driven Approach", desc: "Programs rooted in local communities for lasting environmental impact." },
  { icon: Globe, title: "Transparent Impact Tracking", desc: "Real-time dashboards showing your plantation's progress and carbon offset." },
  { icon: ShieldCheck, title: "ESG-Aligned Initiatives", desc: "Programs designed to support your company's ESG goals and sustainability commitments." },
];

const CSRCarbonOffset = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company_name: "", contact_person: "", email: "", phone: "",
    budget_range: "", interested_model: "", message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("csr_partners").insert({
        company_name: form.company_name.trim(),
        company_type: "CSR",
        contact_person: form.contact_person.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        budget_range: form.budget_range || null,
        interest_area: "Carbon Offsetting",
        message: `Model: ${form.interested_model}\n\n${form.message}`.trim() || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Inquiry Submitted!", description: "Our team will contact you within 48 hours." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
            <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Inquiry Received!</h1>
            <p className="text-muted-foreground mb-2">Thank you for your interest in carbon offset partnerships.</p>
            <p className="text-muted-foreground mb-8">Our team will reach out within 48 hours with a customized proposal.</p>
            <Button onClick={() => window.location.href = "/"}>Back to Home</Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="CSR & Carbon Offset Services - Himsols" description="Partner with Himsols for verified plantation-based carbon impact. Corporate CSR, ESG compliance, geo-tagged planting." />
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">Corporate Sustainability</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Offset Your Carbon Footprint in Himachal Pradesh</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Verified plantation drives with transparent impact reporting. Partner with us for ESG-aligned sustainability initiatives.
          </p>
          <Button size="lg" className="mt-8 gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90" onClick={() => document.getElementById('csr-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Partner With Us <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((item) => (
              <Card key={item.title} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <item.icon className="w-10 h-10 text-primary mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Corporate Impact Model</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 max-w-4xl mx-auto">
            {workflowSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center text-center min-w-[100px]">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
                {i < workflowSteps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-primary hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Why Partner With Himsols</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {whyPartner.map((item) => (
              <Card key={item.title} className="border-border/50">
                <CardContent className="pt-6 flex gap-4">
                  <item.icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reporting Features */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Reporting & Documentation</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Plantation Certificate (PDF)",
              "Geo-tagged Photos & GPS Coordinates",
              "Survival Audit Summary",
              "Estimated CO₂ Offset Report",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-background p-4 rounded-xl border border-border/50">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Form */}
      <section id="csr-form" className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Partner With Us</CardTitle>
              <CardDescription>Fill out the form below and our team will get back with a customized proposal.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input id="company_name" required value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Contact Person *</Label>
                    <Input id="contact_person" required value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Annual CSR Budget Range</Label>
                    <Select value={form.budget_range} onValueChange={v => setForm(p => ({ ...p, budget_range: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select Range" /></SelectTrigger>
                      <SelectContent>
                        {BUDGET_RANGES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Interested Model</Label>
                    <Select value={form.interested_model} onValueChange={v => setForm(p => ({ ...p, interested_model: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select Model" /></SelectTrigger>
                      <SelectContent>
                        {MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea id="message" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us about your sustainability goals..." rows={4} />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading || !form.company_name || !form.contact_person || !form.email || !form.phone}>
                  {loading ? "Submitting..." : "Submit Inquiry"}
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

export default CSRCarbonOffset;
