import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TreePine, Leaf, Droplets, Sun, CheckCircle2, Gift, Sprout } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { UpiSupportCard } from "@/components/UpiSupportCard";

const MAX_FREE_TREES = 25;

const TreePlantation = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    treeType: "",
    quantity: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      toast({
        title: t("plantation.authRequired"),
        description: t("plantation.pleaseLogin"),
        variant: "destructive",
      });
      navigate("/auth?redirect=/tree-plantation");
    }
  }, [user, navigate, toast, t]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const qty = parseInt(formData.quantity);
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_FREE_TREES) {
      toast({
        title: "Check the number of trees",
        description: `Requests are limited to ${MAX_FREE_TREES} trees. For larger plantations, please use the CSR / bulk plantation page.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate tracking ID
      const { data: trackingData, error: trackingError } = await supabase
        .rpc('generate_tracking_id');

      if (trackingError) throw trackingError;

      // Insert request
      const { error: insertError } = await supabase
        .from('tree_plantation_requests')
        .insert({
          user_id: user.id,
          tracking_id: trackingData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          tree_type: formData.treeType,
          quantity: qty,
          message: formData.message.trim() || null,
        });

      if (insertError) throw insertError;

      toast({
        title: t("plantation.requestSuccess"),
        description: `Your tracking ID is: ${trackingData}`,
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        location: "",
        treeType: "",
        quantity: "",
        message: "",
      });

      setSubmittedTrackingId(trackingData as string);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const treeTypes = [
    { nameKey: "plantation.deodar", icon: <TreePine className="h-8 w-8 text-primary" />, descKey: "plantation.deodarDesc" },
    { nameKey: "plantation.oak", icon: <Leaf className="h-8 w-8 text-primary" />, descKey: "plantation.oakDesc" },
    { nameKey: "plantation.pine", icon: <TreePine className="h-8 w-8 text-primary" />, descKey: "plantation.pineDesc" },
    { nameKey: "plantation.rhododendron", icon: <Leaf className="h-8 w-8 text-primary" />, descKey: "plantation.rhododendronDesc" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <TreePine className="h-16 w-16 mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-sm font-semibold mb-5">
            <Gift className="h-4 w-4" />
            100% free — no payment needed
          </div>
          <h1 className="text-5xl font-bold mb-6">{t("plantation.title")}</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Request a free plantation. We plant native saplings on verified farmer land and in forest
            patches in Himachal, and you get a certificate once your trees are planted.
          </p>
          <p className="text-sm max-w-2xl mx-auto mt-4 text-white/80">
            Have extra saplings at home? We'll happily collect and plant them for you too — just
            mention it in the request.
          </p>
        </div>
      </section>

      {submittedTrackingId && (
        <section className="pt-12 px-4">
          <div className="container mx-auto max-w-2xl space-y-6">
            <Card className="border-primary/30">
              <CardContent className="p-6 md:p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Request received — thank you!</h2>
                <p className="text-muted-foreground mb-4">
                  Your plantation request is in. Save your tracking ID to follow progress and
                  download your certificate once the trees are planted.
                </p>
                <div className="inline-block px-4 py-2 rounded-lg bg-muted font-mono font-bold text-lg mb-5">
                  {submittedTrackingId}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to={`/track-request/${submittedTrackingId}`}>
                    <Button className="w-full sm:w-auto">
                      <Sprout className="h-4 w-4" />
                      Track my trees
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => setSubmittedTrackingId(null)}>
                    Make another request
                  </Button>
                </div>
              </CardContent>
            </Card>

            <UpiSupportCard note={`Himsols trees ${submittedTrackingId}`} />

            <Card className="bg-muted/40">
              <CardContent className="p-5 md:p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Planting on behalf of a company or school, or want to gift trees to someone? We
                  run structured drives with geo-tagged reports and certificates.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/corporate" className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full">
                      CSR / company proposal
                    </Button>
                  </Link>
                  <Link to="/schools" className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full">
                      School program
                    </Button>
                  </Link>
                  <Link to="/climate-impact-pack" className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full">
                      Sponsor 10 trees
                    </Button>
                  </Link>
                  <Link to="/gift-cards" className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full">
                      Gift trees to someone
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}



      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">{t("plantation.whyPlant")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-hover transition-all duration-300">
              <CardContent className="p-8">
                <Sun className="h-12 w-12 mx-auto mb-4 text-secondary" />
                <h3 className="text-xl font-semibold mb-2">{t("plantation.climateAction")}</h3>
                <p className="text-muted-foreground">
                  {t("plantation.climateDesc")}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-hover transition-all duration-300">
              <CardContent className="p-8">
                <Droplets className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">{t("plantation.waterConservation")}</h3>
                <p className="text-muted-foreground">
                  {t("plantation.waterDesc")}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-hover transition-all duration-300">
              <CardContent className="p-8">
                <Leaf className="h-12 w-12 mx-auto mb-4 text-accent-foreground" />
                <h3 className="text-xl font-semibold mb-2">{t("plantation.biodiversity")}</h3>
                <p className="text-muted-foreground">
                  {t("plantation.biodiversityDesc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tree Types Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            {t("plantation.nativeSpecies")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {treeTypes.map((tree, index) => (
              <Card key={index} className="hover:shadow-hover transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">{tree.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{t(tree.nameKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(tree.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Request Form Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-center text-foreground mb-8">
                {t("plantation.requestTitle")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("common.fullName")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("common.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("common.phoneNumber")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t("plantation.location")}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={t("plantation.locationPlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treeType">{t("plantation.treeType")}</Label>
                  <Select
                    value={formData.treeType}
                    onValueChange={(value) => setFormData({ ...formData, treeType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("plantation.selectTreeType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deodar">{t("plantation.deodar")}</SelectItem>
                      <SelectItem value="oak">{t("plantation.oak")}</SelectItem>
                      <SelectItem value="pine">{t("plantation.pine")}</SelectItem>
                      <SelectItem value="rhododendron">{t("plantation.rhododendron")}</SelectItem>
                      <SelectItem value="mixed">{t("plantation.mixed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">{t("plantation.numberOfTrees")}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={MAX_FREE_TREES}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Requests: 1–{MAX_FREE_TREES} trees. Need more?{" "}
                    <Link to="/bulk-plantation" className="text-primary underline">
                      See bulk / CSR plantation
                    </Link>
                    .
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t("plantation.additionalInfo")}</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t("plantation.additionalPlaceholder")}
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? t("plantation.submitting") : t("plantation.submitRequest")}
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

export default TreePlantation;
