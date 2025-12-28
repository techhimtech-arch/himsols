import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Leaf, 
  TreeDeciduous, 
  Users, 
  Building2, 
  Award, 
  Heart, 
  Globe, 
  CheckCircle2, 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Target,
  Handshake,
  Calendar,
  Gift,
  TrendingUp,
  Shield
} from "lucide-react";

const B2BCorporate = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    employees: "",
    interest: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: `${formData.companyName} - ${formData.contactPerson}`,
        email: formData.email,
        phone: formData.phone,
        subject: `B2B Inquiry: ${formData.interest}`,
        message: `Company: ${formData.companyName}\nContact: ${formData.contactPerson}\nEmployees: ${formData.employees}\n\n${formData.message}`
      });

      if (error) throw error;

      toast({
        title: "Inquiry Submitted!",
        description: "Our team will contact you within 24 hours.",
      });

      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        employees: "",
        interest: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Globe,
      title: "Reduce Carbon Footprint",
      description: "Offset your company's environmental impact through strategic tree plantation initiatives."
    },
    {
      icon: Heart,
      title: "Strengthen Brand Values",
      description: "Demonstrate genuine commitment to sustainability and attract eco-conscious stakeholders."
    },
    {
      icon: Award,
      title: "CSR Compliance",
      description: "Meet corporate social responsibility goals with measurable environmental outcomes."
    },
    {
      icon: Users,
      title: "Employee Engagement",
      description: "Boost morale and create meaningful team-building experiences around sustainability."
    },
    {
      icon: TrendingUp,
      title: "Positive PR & Visibility",
      description: "Generate authentic stories for your sustainability reports and marketing communications."
    },
    {
      icon: Shield,
      title: "Long-term Impact",
      description: "Create lasting environmental benefits with trackable tree growth and survival rates."
    }
  ];

  const solutions = [
    {
      icon: Gift,
      title: "Corporate Plant Gifting",
      description: "Thoughtful, sustainable gifts for employees, clients, and partners. Customizable packaging with your brand.",
      features: ["Branded plant pots", "Care instructions included", "Bulk discounts available", "Delivery across India"]
    },
    {
      icon: TreeDeciduous,
      title: "Tree Sponsorship & CSR",
      description: "Sponsor tree plantations in your company's name. Perfect for offsetting carbon footprint and CSR initiatives.",
      features: ["Geo-tagged plantations", "Growth tracking dashboard", "Certificate for each tree", "Annual impact reports"]
    },
    {
      icon: Calendar,
      title: "Plantation Events & Drives",
      description: "Organize engaging plantation drives for your team. We handle logistics, saplings, and documentation.",
      features: ["End-to-end coordination", "Photo & video documentation", "Team building activities", "CSR documentation support"]
    }
  ];

  const packages = [
    {
      name: "Starter",
      price: "₹25,000",
      period: "onwards",
      description: "Perfect for small teams and pilot programs",
      features: [
        "50 potted plants or 25 trees",
        "Basic branding on packaging",
        "Digital certificates",
        "Email support"
      ],
      highlighted: false
    },
    {
      name: "Growth",
      price: "₹75,000",
      period: "onwards",
      description: "Ideal for medium enterprises with CSR goals",
      features: [
        "200 potted plants or 100 trees",
        "Custom branded packaging",
        "Geo-tagged plantation",
        "Quarterly impact reports",
        "Dedicated account manager"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Tailored solutions for large corporations",
      features: [
        "Unlimited plants/trees",
        "Full white-label options",
        "Plantation events included",
        "Real-time tracking dashboard",
        "Priority support",
        "Annual sustainability report"
      ],
      highlighted: false
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Submit Inquiry",
      description: "Fill out the form with your requirements and goals."
    },
    {
      step: 2,
      title: "Consultation Call",
      description: "Our team discusses your needs and proposes solutions."
    },
    {
      step: 3,
      title: "Customized Proposal",
      description: "Receive a detailed proposal with pricing and timelines."
    },
    {
      step: 4,
      title: "Execution & Delivery",
      description: "We handle everything from procurement to delivery."
    },
    {
      step: 5,
      title: "Impact Tracking",
      description: "Access reports and certificates for your CSR records."
    }
  ];

  const stats = [
    { value: "50+", label: "Corporate Partners" },
    { value: "10,000+", label: "Trees Planted" },
    { value: "25,000+", label: "Plants Gifted" },
    { value: "98%", label: "Client Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">For Businesses & Enterprises</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Himsols – Corporate{" "}
              <span className="text-primary">Green Gifting</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your corporate gifting and CSR initiatives with sustainable plant gifts and tree sponsorship programs. Make every gift count for the planet.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}>
                Request a Quote
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <a href="/contact">
                  <Phone className="w-4 h-4" />
                  Contact Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm md:text-base opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Green Gifting */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Green Gifting?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Align your corporate values with meaningful sustainability actions that benefit your brand, employees, and the environment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Solutions */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Corporate Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive green initiatives tailored for businesses of all sizes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <solution.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{solution.title}</CardTitle>
                  <CardDescription className="text-base">{solution.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Indicative Packages
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Flexible pricing options to suit your organization's needs and budget.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg, index) => (
              <Card 
                key={index} 
                className={`relative ${pkg.highlighted ? 'border-primary shadow-lg scale-105' : 'border-border/50'}`}
              >
                {pkg.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
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
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={pkg.highlighted ? "default" : "outline"}
                    onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, streamlined process from inquiry to impact.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connection line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />
              
              <div className="space-y-8 md:space-y-0">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`relative flex flex-col md:flex-row items-center gap-4 md:gap-8 ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                    
                    <div className="relative z-10 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                      {step.step}
                    </div>
                    
                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Impact */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Trusted by Leading Organizations
              </h2>
              <p className="text-lg text-muted-foreground">
                Join businesses making a real environmental difference.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center p-6 border-border/50">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">Quality Assured</h4>
                <p className="text-sm text-muted-foreground">Premium saplings with high survival rate</p>
              </Card>
              <Card className="text-center p-6 border-border/50">
                <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">Goal Tracking</h4>
                <p className="text-sm text-muted-foreground">Monitor your environmental impact</p>
              </Card>
              <Card className="text-center p-6 border-border/50">
                <Handshake className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">Dedicated Support</h4>
                <p className="text-sm text-muted-foreground">Personal account manager</p>
              </Card>
              <Card className="text-center p-6 border-border/50">
                <Award className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">Certified Impact</h4>
                <p className="text-sm text-muted-foreground">Official documentation for CSR</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Inquiry Form */}
      <section id="inquiry-form" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get in Touch
              </h2>
              <p className="text-lg text-muted-foreground">
                Tell us about your green gifting needs and we'll create a customized solution for you.
              </p>
            </div>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Your Company"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Your Name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employees">Number of Employees</Label>
                      <Select value={formData.employees} onValueChange={(value) => setFormData({ ...formData, employees: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
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
                      <Label htmlFor="interest">Interested In</Label>
                      <Select value={formData.interest} onValueChange={(value) => setFormData({ ...formData, interest: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plant-gifting">Corporate Plant Gifting</SelectItem>
                          <SelectItem value="tree-sponsorship">Tree Sponsorship / CSR</SelectItem>
                          <SelectItem value="plantation-events">Plantation Events</SelectItem>
                          <SelectItem value="custom">Custom Solution</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Tell us about your requirements</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your green gifting needs, quantity, timeline, or any specific requirements..."
                      rows={4}
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    By submitting, you agree to our privacy policy. We'll respond within 24 hours.
                  </p>
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
