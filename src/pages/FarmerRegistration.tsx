import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import { Sprout, CheckCircle, TreeDeciduous, Leaf, HandCoins, Upload, X, Loader2 } from "lucide-react";

const LAND_TYPES = ["Vacant", "Boundary", "Grassland", "Mixed"];
const TREE_TYPES = ["Forest", "Fruit", "Medicinal"];
const HP_DISTRICTS = ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul & Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"];

const FarmerRegistration = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [existingRegistration, setExistingRegistration] = useState<any>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedTrees, setSelectedTrees] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState({
    full_name: "", mobile: "", village: "", district: "", land_size_acres: "",
    land_type: "", irrigation_available: "",
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/farmer-registration");
    }
  }, [user, authLoading, navigate]);

  // Check if user already registered
  useEffect(() => {
    if (user) {
      supabase.from("farmer_registrations").select("*").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => {
          if (data) {
            setExistingRegistration(data);
            if (data.status === "verified") {
              navigate("/partner-dashboard");
            }
          }
          setCheckingExisting(false);
        });
    }
  }, [user, navigate]);

  const toggleTree = (t: string) => {
    setSelectedTrees(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    const compressedFile = new File([compressed], file.name, { type: compressed.type });
    setPhotoFile(compressedFile);
    setPhotoPreview(URL.createObjectURL(compressedFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!consent) { toast({ title: "Consent Required", description: "Please agree to the consent checkbox.", variant: "destructive" }); return; }
    setLoading(true);

    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        const path = `farmer-${Date.now()}-${photoFile.name}`;
        const { error: upErr } = await supabase.storage.from("farmer-photos").upload(path, photoFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("farmer-photos").getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("farmer_registrations").insert({
        user_id: user.id,
        full_name: form.full_name.trim(),
        mobile: form.mobile.trim(),
        village: form.village.trim(),
        district: form.district,
        land_size_acres: form.land_size_acres ? parseFloat(form.land_size_acres) : null,
        land_type: form.land_type || null,
        interested_tree_types: selectedTrees.length > 0 ? selectedTrees : null,
        irrigation_available: form.irrigation_available === "yes",
        land_photo_url: photoUrl,
        consent: true,
      });

      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Registration Successful!", description: "Our team will verify your details soon." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingExisting) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Already registered but pending
  if (existingRegistration) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-lg text-center">
            <Sprout className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Application Under Review</h1>
            <p className="text-muted-foreground mb-2">Your farmer partner application is currently being reviewed.</p>
            <p className="text-muted-foreground mb-2">Status: <span className="font-semibold capitalize text-foreground">{existingRegistration.status}</span></p>
            <p className="text-muted-foreground mb-8">Our team will verify your details and contact you soon.</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-lg text-center">
            <CheckCircle className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Registration Submitted!</h1>
            <p className="text-muted-foreground mb-2">Thank you for joining the Himsols agroforestry program.</p>
            <p className="text-muted-foreground mb-8">Our team will verify and contact you within 3-5 business days.</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Farmer Partner Registration - Himsols" description="Register as a farmer partner for agroforestry and carbon programs with Himsols." />
      <Navbar />

      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Sprout className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Become a Farmer Partner</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Earn through agroforestry & carbon programs. Get trees allocated, maintain them, and earn survival-based incentives.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary" />
                Farmer Partner Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" required value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input id="mobile" type="tel" required value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} placeholder="10-digit number" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="village">Village *</Label>
                    <Input id="village" required value={form.village} onChange={e => setForm(p => ({ ...p, village: e.target.value }))} placeholder="Village name" />
                  </div>
                  <div className="space-y-2">
                    <Label>District *</Label>
                    <Select value={form.district} onValueChange={v => setForm(p => ({ ...p, district: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                      <SelectContent>
                        {HP_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="land_size">Land Size (acres)</Label>
                    <Input id="land_size" type="number" step="0.1" value={form.land_size_acres} onChange={e => setForm(p => ({ ...p, land_size_acres: e.target.value }))} placeholder="e.g. 2.5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Land Type</Label>
                    <Select value={form.land_type} onValueChange={v => setForm(p => ({ ...p, land_type: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent>
                        {LAND_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Interested Tree Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {TREE_TYPES.map(t => (
                      <Button key={t} type="button" size="sm" variant={selectedTrees.includes(t) ? "default" : "outline"} onClick={() => toggleTree(t)}>
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Irrigation Availability</Label>
                  <Select value={form.irrigation_available} onValueChange={v => setForm(p => ({ ...p, irrigation_available: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Upload Land Photo (optional)</Label>
                  <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handlePhoto} />
                  {photoPreview ? (
                    <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-border">
                      <img src={photoPreview} alt="Land" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
                      <Upload className="w-4 h-4" /> Choose Photo
                    </Button>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Checkbox id="consent" checked={consent} onCheckedChange={(c) => setConsent(!!c)} />
                  <Label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to be contacted regarding agroforestry initiatives and consent to the processing of my information for this program.
                  </Label>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading || !form.full_name || !form.mobile || !form.village || !form.district || !consent}>
                  {loading ? "Submitting..." : "Register as Farmer Partner"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">What You Get</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: TreeDeciduous, title: "Free Saplings", desc: "Quality saplings provided at no cost for agroforestry programs." },
              { icon: Leaf, title: "Plantation Support", desc: "Technical guidance and support for tree planting and maintenance." },
              { icon: HandCoins, title: "Survival-Based Income", desc: "₹120 per surviving tree after 6-month monitoring. Earn by caring for your trees." },
            ].map((item) => (
              <Card key={item.title} className="border-border/50 text-center">
                <CardContent className="pt-6">
                  <item.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FarmerRegistration;
