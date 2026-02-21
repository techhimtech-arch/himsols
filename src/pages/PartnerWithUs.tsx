import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Handshake, CheckCircle, Building2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const COMPANY_TYPES = ["CSR", "NGO", "Educational", "Panchayat", "Government", "Other"];
const BUDGET_RANGES = ["Under ₹1 Lakh", "₹1-5 Lakh", "₹5-10 Lakh", "₹10-25 Lakh", "₹25 Lakh+", "Not Sure"];
const INTEREST_AREAS = ["Tree Plantation", "Village Greening", "Waste Management", "Carbon Offsetting", "Employee Engagement", "Multiple"];

const PartnerWithUs = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    company_type: "",
    contact_person: "",
    email: "",
    phone: "",
    website: "",
    interest_area: "",
    budget_range: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("csr_partners" as any).insert({
        company_name: form.company_name.trim(),
        company_type: form.company_type,
        contact_person: form.contact_person.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        website: form.website.trim() || null,
        interest_area: form.interest_area || null,
        budget_range: form.budget_range || null,
        message: form.message.trim() || null,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Thank You!", description: "Your partnership inquiry has been submitted." });
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
            <h1 className="text-3xl font-bold text-foreground mb-4">Inquiry Submitted!</h1>
            <p className="text-muted-foreground mb-2">Thank you for your interest in partnering with Himsols.</p>
            <p className="text-muted-foreground mb-8">Our team will contact you within 2-3 business days.</p>
            <Button onClick={() => window.location.href = "/"}>Back to Home</Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO title="Partner With Us - Himsols" description="Partner with Himsols for CSR tree plantation, village greening programs, and sustainable impact." />
      <Navbar />

      <section className="pt-32 pb-8 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <Handshake className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Partner With Us</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Join hands with Himsols to create lasting environmental impact. CSR partners, NGOs, and institutions welcome.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Partnership Inquiry Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company/Organization Name *</Label>
                    <Input id="company_name" required value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} placeholder="Organization Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization Type *</Label>
                    <Select value={form.company_type} onValueChange={v => setForm(p => ({ ...p, company_type: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent>
                        {COMPANY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Contact Person *</Label>
                    <Input id="contact_person" required value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} placeholder="Full Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@company.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Interest Area</Label>
                    <Select value={form.interest_area} onValueChange={v => setForm(p => ({ ...p, interest_area: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select Area" /></SelectTrigger>
                      <SelectContent>
                        {INTEREST_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Budget Range</Label>
                    <Select value={form.budget_range} onValueChange={v => setForm(p => ({ ...p, budget_range: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select Range" /></SelectTrigger>
                      <SelectContent>
                        {BUDGET_RANGES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea id="message" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us about your sustainability goals..." rows={4} />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading || !form.company_name || !form.company_type || !form.contact_person || !form.email || !form.phone}>
                  {loading ? "Submitting..." : "Submit Partnership Inquiry"}
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

export default PartnerWithUs;
