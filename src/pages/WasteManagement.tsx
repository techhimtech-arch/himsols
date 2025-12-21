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
import { Package, CalendarIcon, CheckCircle, IndianRupee, Truck, Recycle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { INDIAN_STATES, getDistrictsForState, IndianState } from "@/lib/constants";

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
}

const WasteManagement = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickupDate, setPickupDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state: "" as IndianState | "",
    district: "",
    address: "",
    wasteType: "",
    estimatedQuantity: "",
    message: "",
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

  const scrapTypes = [
    "Metal Scrap (Iron, Steel, Copper)",
    "E-Waste (Electronics, Appliances)",
    "Paper & Cardboard",
    "Plastic Scrap",
    "Glass Items",
    "Old Furniture",
    "Batteries & Accumulators",
    "Textile & Fabric Waste",
    "Mixed Valuable Scrap",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit a waste management request.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!pickupDate) {
      toast({
        title: "Date Required",
        description: "Please select a pickup date.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate tracking ID
      const { data: trackingData, error: trackingError } = await supabase.rpc(
        "generate_waste_tracking_id"
      );

      if (trackingError) throw trackingError;

      const { error } = await supabase.from("waste_management_requests").insert({
        user_id: user.id,
        tracking_id: trackingData,
        name: formData.name || profile?.full_name || "",
        email: formData.email || profile?.email || "",
        phone: formData.phone || profile?.phone || "",
        state: formData.state || null,
        district: formData.district,
        address: formData.address,
        pickup_date: format(pickupDate, "yyyy-MM-dd"),
        waste_type: formData.wasteType,
        estimated_quantity: formData.estimatedQuantity || null,
        message: formData.message || null,
      });

      if (error) throw error;

      toast({
        title: "Request Submitted!",
        description: `Your tracking ID is: ${trackingData}. We will contact you soon.`,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        state: "",
        district: "",
        address: "",
        wasteType: "",
        estimatedQuantity: "",
        message: "",
      });
      setPickupDate(undefined);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Request Form */}
      <section className="py-16 px-4">
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
                    <Input
                      id="name"
                      name="name"
                      value={formData.name || profile?.full_name || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone || profile?.phone || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || profile?.email || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, state: value as IndianState, district: "" }))
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>District *</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, district: value }))
                      }
                      required
                      disabled={!formData.state}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.state ? "Select district" : "Select state first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.state && getDistrictsForState(formData.state).map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Pickup Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Village/City, Landmark"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pickup Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !pickupDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={pickupDate}
                          onSelect={setPickupDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Scrap Type *</Label>
                    <Select
                      value={formData.wasteType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, wasteType: value }))
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select scrap type" />
                      </SelectTrigger>
                      <SelectContent>
                        {scrapTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedQuantity">Estimated Quantity/Weight (Optional)</Label>
                  <Input
                    id="estimatedQuantity"
                    name="estimatedQuantity"
                    value={formData.estimatedQuantity}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 bags, 50 kg, 1 truckload"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Additional Notes (Optional)</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Any special instructions or details"
                  />
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
