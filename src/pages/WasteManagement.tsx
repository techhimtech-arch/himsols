import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, CalendarIcon, IndianRupee, Truck, Recycle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { INDIAN_STATES, getDistrictsForState, IndianState } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
}

interface ScrapType {
  id: string;
  name: string;
  name_hi: string | null;
  category: string | null;
  rate_per_kg: number;
  unit: string;
}

interface SelectedItem {
  scrap_type_id: string;
  estimated_qty_kg: string;
}

const WasteManagement = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickupDate, setPickupDate] = useState<Date>();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state: "" as IndianState | "",
    district: "",
    address: "",
    message: "",
  });

  const { data: scrapTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ["scrap-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrap_types")
        .select("id, name, name_hi, category, rate_per_kg, unit")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as ScrapType[];
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, email, phone")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);

  const toggleScrapType = (typeId: string) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.scrap_type_id === typeId);
      if (exists) return prev.filter(i => i.scrap_type_id !== typeId);
      return [...prev, { scrap_type_id: typeId, estimated_qty_kg: "" }];
    });
  };

  const updateQty = (typeId: string, qty: string) => {
    setSelectedItems(prev => prev.map(i => i.scrap_type_id === typeId ? { ...i, estimated_qty_kg: qty } : i));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Authentication Required", description: "Please login to submit a request.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!pickupDate) {
      toast({ title: "Date Required", description: "Please select a pickup date.", variant: "destructive" });
      return;
    }

    if (selectedItems.length === 0) {
      toast({ title: "Select Scrap Types", description: "Please select at least one scrap type.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: trackingData, error: trackingError } = await supabase.rpc("generate_waste_tracking_id");
      if (trackingError) throw trackingError;

      // Build summary waste_type string for backward compat
      const selectedNames = selectedItems.map(si => {
        const st = scrapTypes.find(t => t.id === si.scrap_type_id);
        return st?.name || "";
      }).filter(Boolean).join(", ");

      const { data: requestData, error } = await supabase.from("waste_management_requests").insert({
        user_id: user.id,
        tracking_id: trackingData,
        name: formData.name || profile?.full_name || "",
        email: formData.email || profile?.email || "",
        phone: formData.phone || profile?.phone || "",
        state: formData.state || null,
        district: formData.district,
        address: formData.address,
        pickup_date: format(pickupDate, "yyyy-MM-dd"),
        waste_type: selectedNames,
        estimated_quantity: null,
        message: formData.message || null,
      }).select("id").single();

      if (error) throw error;

      // Insert scrap_request_items
      if (requestData) {
        const items = selectedItems.map(si => ({
          request_id: requestData.id,
          scrap_type_id: si.scrap_type_id,
          estimated_qty_kg: si.estimated_qty_kg ? Number(si.estimated_qty_kg) : null,
        }));
        const { error: itemsError } = await supabase.from("scrap_request_items").insert(items);
        if (itemsError) console.error("Items insert error:", itemsError);
      }

      toast({ title: "Request Submitted!", description: `Your tracking ID is: ${trackingData}. We will contact you soon.` });

      setFormData({ name: "", email: "", phone: "", state: "", district: "", address: "", message: "" });
      setSelectedItems([]);
      setPickupDate(undefined);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit request.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group scrap types by category
  const groupedTypes = scrapTypes.reduce((acc, t) => {
    const cat = t.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {} as Record<string, ScrapType[]>);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-amber-600 to-orange-500 text-white">
        <div className="container mx-auto text-center">
          <Package className="h-16 w-16 mx-auto mb-6 animate-fade-in" />
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Valuable Scrap Collection</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in">
            Turn your scrap into value! Schedule a pickup for your valuable scrap materials.
            We offer fair prices and convenient door-to-door service.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-muted">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Best Prices", desc: "Fair market value for your scrap", icon: IndianRupee },
              { title: "Free Pickup", desc: "We come to your doorstep", icon: Truck },
              { title: "Flexible Timing", desc: "Choose your preferred date", icon: CalendarIcon },
              { title: "Eco-Friendly", desc: "Proper recycling & reuse", icon: Recycle },
            ].map((item, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live Rate Card Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Today's Scrap Rates</h2>
            </div>
            <p className="text-muted-foreground">Current market rates — what you'll earn per kg</p>
          </div>
          {typesLoading ? (
            <Skeleton className="h-32 w-full max-w-4xl mx-auto" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {scrapTypes.map(t => (
                <Card key={t.id} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    {t.name_hi && <p className="text-xs text-muted-foreground">{t.name_hi}</p>}
                    <div className="flex items-center justify-center gap-1 mt-2 text-primary font-bold text-lg">
                      <IndianRupee className="h-4 w-4" />{t.rate_per_kg}<span className="text-xs font-normal text-muted-foreground">/{t.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Request Form */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Schedule Scrap Pickup</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" value={formData.name || profile?.full_name || ""} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" value={formData.phone || profile?.phone || ""} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={formData.email || profile?.email || ""} onChange={handleInputChange} required />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value as IndianState, district: "" }))} required>
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>District *</Label>
                    <Select value={formData.district} onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))} required disabled={!formData.state}>
                      <SelectTrigger><SelectValue placeholder={formData.state ? "Select district" : "Select state first"} /></SelectTrigger>
                      <SelectContent>
                        {formData.state && getDistrictsForState(formData.state).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Pickup Address *</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Village/City, Landmark" required />
                </div>

                <div className="space-y-2">
                  <Label>Pickup Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !pickupDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} disabled={(date) => date < new Date()} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Multi-select scrap types */}
                <div className="space-y-3">
                  <Label>Select Scrap Types * (pick all that apply)</Label>
                  {typesLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(groupedTypes).map(([category, items]) => (
                        <div key={category}>
                          <p className="text-sm font-medium text-muted-foreground mb-2">{category}</p>
                          <div className="space-y-2">
                            {items.map(t => {
                              const selected = selectedItems.find(si => si.scrap_type_id === t.id);
                              return (
                                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                                  <Checkbox
                                    checked={!!selected}
                                    onCheckedChange={() => toggleScrapType(t.id)}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                                    <span className="text-xs text-primary ml-2">₹{t.rate_per_kg}/{t.unit}</span>
                                  </div>
                                  {selected && (
                                    <Input
                                      type="number"
                                      placeholder="Est. kg"
                                      className="w-24 h-8 text-sm"
                                      value={selected.estimated_qty_kg}
                                      onChange={e => updateQty(t.id, e.target.value)}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Additional Notes (Optional)</Label>
                  <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} placeholder="Any special instructions or details" />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Schedule Pickup"}
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

export default WasteManagement;
