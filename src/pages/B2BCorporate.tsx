import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Leaf, TreeDeciduous, Users, Building2, Award, Heart, Globe, CheckCircle2, ArrowRight,
  Phone, Sparkles, Target, Handshake, Calendar, Gift, TrendingUp, Shield
} from "lucide-react";

const iconMap: Record<string, any> = {
  Globe, Heart, Award, Users, TrendingUp, Shield, Gift, TreeDeciduous, Calendar, Sparkles, Target, Handshake, Leaf
};

const B2BCorporate = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "", contactPerson: "", email: "", phone: "", employees: "", interest: "", message: "", giftCardQuantity: "", giftCardValue: ""
  });

  // Fetch all data from database
  const { data: stats = [] } = useQuery({
    queryKey: ["corporate-stats"],
    queryFn: async () => {
      const { data } = await supabase.from("corporate_stats").select("*").eq("is_active", true).order("sort_order");
      return data || [];
    },
  });

  const { data: benefits = [] } = useQuery({
    queryKey: ["corporate-benefits"],
    queryFn: async () => {
      const { data } = await supabase.from("corporate_benefits").select("*").eq("is_active", true).order("sort_order");
      return data || [];
    },
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ["corporate-solutions"],
    queryFn: async () => {
      const { data } = await supabase.from("corporate_solutions").select("*").eq("is_active", true).order("sort_order");
      return data || [];
    },
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["corporate-packages"],
    queryFn: async () => {
      const { data } = await supabase.from("corporate_packages").select("*").eq("is_active", true).order("sort_order");
      return data || [];
    },
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ["corporate-testimonials"],
    queryFn: async () => {
      const { data } = await supabase.from("corporate_testimonials").select("*").eq("is_active", true).order("sort_order");
      return data || [];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["corporate-clients"],
    queryFn: async () => {
      const { data } = await supabase.from("corporate_clients").select("*").eq("is_active", true).order("sort_order");
      return data || [];
    },
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["corporate-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("corporate_settings").select("*");
      return data || [];
    },
  });

  const getSetting = (key: string, fallback: string) => settings.find(s => s.key === key)?.value || fallback;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const giftCardInfo = formData.interest === "bulk-gift-cards" 
        ? `\n\n🎁 BULK GIFT CARDS REQUEST:\nQuantity: ${formData.giftCardQuantity} cards\nValue per card: ₹${formData.giftCardValue}`
        : "";
      
      const { error } = await supabase.from("contact_messages").insert({
        name: `${formData.companyName} - ${formData.contactPerson}`,
        email: formData.email, phone: formData.phone, 
        subject: formData.interest === "bulk-gift-cards" ? `🎁 Bulk Gift Cards Inquiry: ${formData.giftCardQuantity} cards` : `B2B Inquiry: ${formData.interest}`,
        message: `Company: ${formData.companyName}\nContact: ${formData.contactPerson}\nEmployees: ${formData.employees}${giftCardInfo}\n\n${formData.message}`
      });
      if (error) throw error;
      toast({ title: "Inquiry Submitted!", description: "Our team will contact you within 24 hours." });
      setFormData({ companyName: "", contactPerson: "", email: "", phone: "", employees: "", interest: "", message: "", giftCardQuantity: "", giftCardValue: "" });
    } catch {
      toast({ title: "Error", description: "Failed to submit inquiry.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">For Businesses & Enterprises</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {getSetting("hero_title", "Himsols – Corporate Green Gifting")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {getSetting("hero_subtitle", "Transform your corporate gifting and CSR initiatives.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}>
                Request a Quote <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <a href="/contact"><Phone className="w-4 h-4" /> Contact Us</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {stats.length > 0 && (
        <section className="py-8 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat: any) => (
                <div key={stat.id} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm md:text-base opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Green Gifting */}
      {benefits.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{getSetting("why_section_title", "Why Choose Green Gifting?")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{getSetting("why_section_subtitle", "")}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit: any) => {
                const IconComponent = iconMap[benefit.icon] || Globe;
                return (
                  <Card key={benefit.id} className="border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Corporate Solutions */}
      {solutions.length > 0 && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{getSetting("solutions_title", "Our Corporate Solutions")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{getSetting("solutions_subtitle", "")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {solutions.map((solution: any) => {
                const IconComponent = iconMap[solution.icon] || Gift;
                return (
                  <Card key={solution.id} className="border-border/50 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <IconComponent className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{solution.title}</CardTitle>
                      <CardDescription className="text-base">{solution.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {solution.features?.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Packages */}
      {packages.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{getSetting("packages_title", "Indicative Packages")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{getSetting("packages_subtitle", "")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {packages.map((pkg: any) => (
                <Card key={pkg.id} className={`relative ${pkg.is_highlighted ? 'border-primary shadow-lg scale-105' : 'border-border/50'}`}>
                  {pkg.is_highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">{pkg.price}</span>
                      <span className="text-muted-foreground ml-1">{pkg.period}</span>
                    </div>
                    <CardDescription className="mt-2">{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {pkg.features?.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={pkg.is_highlighted ? "default" : "outline"} onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}>
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{getSetting("testimonials_title", "What Our Corporate Partners Say")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{getSetting("testimonials_subtitle", "")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              {testimonials.map((testimonial: any) => (
                <Card key={testimonial.id} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <svg className="w-8 h-8 text-primary/30" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-sm text-primary">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {clients.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider">Trusted by organizations across India</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
                  {clients.map((client: any) => (
                    <div key={client.id} className="px-6 py-3 bg-muted rounded-lg text-muted-foreground font-semibold text-lg">
                      {client.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Corporate Inquiry Form */}
      <section id="inquiry-form" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{getSetting("form_title", "Get in Touch")}</h2>
              <p className="text-lg text-muted-foreground">{getSetting("form_subtitle", "")}</p>
            </div>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input id="companyName" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input id="contactPerson" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Number of Employees</Label>
                      <Select value={formData.employees} onValueChange={(value) => setFormData({ ...formData, employees: value })}>
                        <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-50">1-50</SelectItem>
                          <SelectItem value="51-200">51-200</SelectItem>
                          <SelectItem value="201-500">201-500</SelectItem>
                          <SelectItem value="501-1000">501-1000</SelectItem>
                          <SelectItem value="1000+">1000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Interested In *</Label>
                      <Select value={formData.interest} onValueChange={(value) => setFormData({ ...formData, interest: value, giftCardQuantity: "", giftCardValue: "" })}>
                        <SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bulk-gift-cards">🎁 Bulk Gift Cards (B2B)</SelectItem>
                          <SelectItem value="plant-gifting">Corporate Plant Gifting</SelectItem>
                          <SelectItem value="tree-sponsorship">Tree Sponsorship / CSR</SelectItem>
                          <SelectItem value="plantation-events">Plantation Events</SelectItem>
                          <SelectItem value="custom">Custom Solution</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Bulk Gift Cards Fields - Show only when selected */}
                  {formData.interest === "bulk-gift-cards" && (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-4">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Gift className="w-5 h-5" />
                        Bulk Gift Card Details
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="giftCardQuantity">Number of Gift Cards *</Label>
                          <Input 
                            id="giftCardQuantity" 
                            type="number" 
                            min="10"
                            placeholder="e.g., 100" 
                            value={formData.giftCardQuantity} 
                            onChange={(e) => setFormData({ ...formData, giftCardQuantity: e.target.value })} 
                            required={formData.interest === "bulk-gift-cards"}
                          />
                          <p className="text-xs text-muted-foreground">Minimum 10 cards</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="giftCardValue">Value per Card (₹) *</Label>
                          <Select value={formData.giftCardValue} onValueChange={(value) => setFormData({ ...formData, giftCardValue: value })}>
                            <SelectTrigger><SelectValue placeholder="Select value" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="500">₹500</SelectItem>
                              <SelectItem value="1000">₹1,000</SelectItem>
                              <SelectItem value="2500">₹2,500</SelectItem>
                              <SelectItem value="5000">₹5,000</SelectItem>
                              <SelectItem value="10000">₹10,000</SelectItem>
                              <SelectItem value="custom">Custom Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {formData.giftCardQuantity && formData.giftCardValue && formData.giftCardValue !== "custom" && (
                        <div className="text-sm bg-background p-3 rounded-md">
                          <span className="text-muted-foreground">Estimated Total: </span>
                          <span className="font-semibold text-primary">
                            ₹{(parseInt(formData.giftCardQuantity) * parseInt(formData.giftCardValue)).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        💡 Our team will send you an invoice with bank transfer details. Gift cards will be generated after payment confirmation.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Tell us about your requirements</Label>
                    <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default B2BCorporate;
