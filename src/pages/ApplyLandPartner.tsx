import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HP_DISTRICTS } from "@/lib/constants";
import { Loader2, Upload, CheckCircle2, ShieldCheck } from "lucide-react";
import { SEO } from "@/components/SEO";

const ApplyLandPartner = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<{ full_name: string; phone: string | null } | null>(null);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    district: "",
    village: "",
    land_size: "",
    land_unit: "acre",
    irrigation_type: "Rainfed",
    ownership_type: "Own",
    consent: false,
  });
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/apply-land-partner");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfileAndApplication();
    }
  }, [user]);

  const loadProfileAndApplication = async () => {
    try {
      const [profileRes, appRes] = await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", user!.id).single(),
        supabase.from("land_partner_applications").select("*").eq("user_id", user!.id).maybeSingle(),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setForm(f => ({
          ...f,
          full_name: profileRes.data.full_name || "",
          mobile: profileRes.data.phone || "",
        }));
      }

      if (appRes.data) {
        setExistingApp(appRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    setUploading(true);

    const files = Array.from(e.target.files);
    const uploaded: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("land-photos").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("land-photos").getPublicUrl(path);
        uploaded.push(urlData.publicUrl);
      }
    }

    setPhotos(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!form.district || !form.village || !form.land_size || !form.consent) {
      toast({ title: "Error", description: "Please fill all required fields and give consent.", variant: "destructive" });
      return;
    }

    if (photos.length < 2) {
      toast({ title: "Error", description: "Please upload at least 2 land photos.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("land_partner_applications").insert({
        user_id: user.id,
        full_name: form.full_name,
        mobile: form.mobile,
        district: form.district,
        village: form.village,
        land_size: parseFloat(form.land_size),
        land_unit: form.land_unit,
        irrigation_type: form.irrigation_type,
        ownership_type: form.ownership_type,
        land_photos: photos,
        consent: form.consent,
      });

      if (error) throw error;

      toast({ title: "✅ Application Submitted", description: "Your Climate Land Partner application is under review." });
      loadProfileAndApplication();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Apply as Climate Land Partner | Himsols" description="Join the Verified Climate Land Partner Network. Provide your land for climate plantation projects." />
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <ShieldCheck className="h-4 w-4" />
              Verified Climate Land Partner Network
            </div>
            <h1 className="text-3xl font-bold text-foreground">Apply as a Climate Land Partner</h1>
            <p className="text-muted-foreground mt-2">Provide your land for verified tree plantation projects. All applications require admin verification.</p>
          </div>

          {existingApp ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Application Submitted
                </CardTitle>
                <CardDescription>
                  Status: <span className="font-semibold capitalize">{existingApp.status}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">District:</span> {existingApp.district}</div>
                  <div><span className="text-muted-foreground">Village:</span> {existingApp.village}</div>
                  <div><span className="text-muted-foreground">Land Size:</span> {existingApp.land_size} {existingApp.land_unit}</div>
                  <div><span className="text-muted-foreground">Irrigation:</span> {existingApp.irrigation_type}</div>
                  <div><span className="text-muted-foreground">Ownership:</span> {existingApp.ownership_type}</div>
                </div>
                {existingApp.status === "Rejected" && existingApp.admin_notes && (
                  <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-sm">
                    <strong>Admin Notes:</strong> {existingApp.admin_notes}
                  </div>
                )}
                {existingApp.status === "Verified" && (
                  <Button onClick={() => navigate("/partner-dashboard")} className="mt-4">
                    Go to Partner Dashboard
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Mobile Number</Label>
                    <Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>District *</Label>
                    <Select value={form.district} onValueChange={v => setForm(f => ({ ...f, district: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                      <SelectContent>
                        {HP_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Village *</Label>
                    <Input value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} placeholder="Enter village name" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Land Size *</Label>
                    <Input type="number" value={form.land_size} onChange={e => setForm(f => ({ ...f, land_size: e.target.value }))} placeholder="e.g. 2.5" />
                  </div>
                  <div>
                    <Label>Land Unit</Label>
                    <Select value={form.land_unit} onValueChange={v => setForm(f => ({ ...f, land_unit: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acre">Acre</SelectItem>
                        <SelectItem value="bigha">Bigha</SelectItem>
                        <SelectItem value="kanal">Kanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Irrigation Type</Label>
                    <Select value={form.irrigation_type} onValueChange={v => setForm(f => ({ ...f, irrigation_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rainfed">Rainfed</SelectItem>
                        <SelectItem value="Irrigated">Irrigated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Land Ownership Type</Label>
                  <Select value={form.ownership_type} onValueChange={v => setForm(f => ({ ...f, ownership_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Own">Own</SelectItem>
                      <SelectItem value="Panchayat">Panchayat</SelectItem>
                      <SelectItem value="Lease">Lease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Upload Land Photos (minimum 2) *</Label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {photos.map((url, i) => (
                      <img key={i} src={url} alt={`Land photo ${i + 1}`} className="w-24 h-24 rounded-lg object-cover border border-border" />
                    ))}
                    <label className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                      <span className="text-xs text-muted-foreground mt-1">Add</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Checkbox checked={form.consent} onCheckedChange={v => setForm(f => ({ ...f, consent: !!v }))} id="consent" />
                  <label htmlFor="consent" className="text-sm leading-tight cursor-pointer">
                    I confirm this land can be used for climate plantation projects and I have the authority to provide it.
                  </label>
                </div>

                <Button onClick={handleSubmit} disabled={submitting} className="w-full" size="lg">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : "Submit Application"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApplyLandPartner;
