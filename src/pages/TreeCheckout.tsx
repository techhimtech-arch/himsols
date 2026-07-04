import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { INDIAN_STATES, getDistrictsForState, type IndianState } from "@/lib/constants";
import {
  TreePine, Check, Shield, Camera, MapPin,
  Wallet, CreditCard, Gift, ArrowRight, Loader2, Leaf, Minus, Plus
} from "lucide-react";

declare global {
  interface Window { Razorpay: any; }
}

interface TreeData {
  id: string;
  name: string;
  name_hi: string | null;
  scientific_name: string | null;
  description: string;
  price: number;
  mrp: number | null;
  image_url: string | null;
  stock_quantity: number;
  category: string;
  growth_rate: string | null;
  max_height: string | null;
}

const TreeCheckout = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { balance, fetchWallet } = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tree, setTree] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [paymentTab, setPaymentTab] = useState("razorpay");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");

  const totalPrice = tree ? tree.price * quantity : 0;

  useEffect(() => {
    if (id) loadTree();
  }, [id]);

  const loadTree = async () => {
    try {
      const { data, error } = await supabase
        .from("trees")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      setTree(data);
    } catch {
      toast({ title: "Tree not found", variant: "destructive" });
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const validateDelivery = () => {
    if (!state || !district || !deliveryLocation.trim()) {
      toast({ title: "Delivery details required", description: "Please fill state, district and delivery address.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleRazorpayPayment = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!validateDelivery()) return;
    setIsProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway");

      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        { body: { amount: totalPrice, notes: { product: "Tree Order", tree_id: tree!.id, quantity } } }
      );
      if (orderError || !orderData?.order_id) throw new Error("Failed to create payment order");

      const { data: profile } = await supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).single();

      const razorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Himsols",
        description: `${tree!.name} × ${quantity}`,
        order_id: orderData.order_id,
        prefill: {
          name: profile?.full_name || "",
          email: profile?.email || user.email || "",
          contact: profile?.phone || "",
        },
        theme: { color: "#16a34a" },
        handler: async (response: any) => {
          try {
            const { data, error } = await supabase.functions.invoke("purchase-tree-order", {
              body: {
                payment_method: "razorpay",
                tree_id: tree!.id,
                quantity,
                state,
                district,
                delivery_location: deliveryLocation,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });
            if (error || !data?.success) throw new Error(data?.error || "Verification failed");
            toast({ title: "🎉 Order Placed!", description: `${quantity} ${tree!.name} tree(s) ordered successfully.` });
            navigate("/my-contributions");
          } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
          }
        },
        modal: { ondismiss: () => setIsProcessing(false) },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.on("payment.failed", (r: any) => {
        toast({ title: "Payment Failed", description: r.error.description, variant: "destructive" });
        setIsProcessing(false);
      });
      razorpay.open();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!validateDelivery()) return;
    if (balance < totalPrice) {
      toast({ title: "Insufficient Balance", description: `Need ₹${totalPrice}. Balance: ₹${balance}`, variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-tree-order", {
        body: { payment_method: "wallet", tree_id: tree!.id, quantity, state, district, delivery_location: deliveryLocation },
      });
      if (error || !data?.success) throw new Error(data?.error || "Payment failed");
      toast({ title: "🎉 Order Placed!", description: "Paid from wallet." });
      await fetchWallet();
      navigate("/my-contributions");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGiftCardPayment = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!validateDelivery()) return;
    if (!giftCardCode.trim()) {
      toast({ title: "Enter Gift Card Code", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-tree-order", {
        body: { payment_method: "gift_card", tree_id: tree!.id, quantity, state, district, delivery_location: deliveryLocation, gift_card_code: giftCardCode.trim().toUpperCase() },
      });
      if (error || !data?.success) throw new Error(data?.error || "Payment failed");
      toast({ title: "🎉 Order Placed!", description: "Gift card redeemed." });
      navigate("/my-contributions");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!tree) return null;

  const districts = state ? getDistrictsForState(state as IndianState) : [];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Buy ${tree.name} – ₹${tree.price} | Himsols`}
        description={`Order ${tree.name} tree saplings. ${tree.description.substring(0, 120)}`}
      />
      <Navbar />

      <main className="pt-20">
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left - Tree Details */}
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                <Leaf className="h-3 w-3 mr-1" /> {tree.category}
              </Badge>

              {tree.image_url ? (
                <img src={tree.image_url} alt={tree.name} className="w-full h-64 md:h-80 object-cover rounded-xl mb-6" loading="lazy" />
              ) : (
                <div className="w-full h-64 md:h-80 bg-muted rounded-xl mb-6 flex items-center justify-center">
                  <TreePine className="h-16 w-16 text-muted-foreground" />
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 leading-tight">
                {tree.name}
              </h1>
              {tree.scientific_name && (
                <p className="text-muted-foreground italic mb-4">{tree.scientific_name}</p>
              )}
              <p className="text-muted-foreground text-base mb-6">{tree.description}</p>

              {/* What You Get */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: TreePine, text: "Verified Tree Sapling Planted" },
                  { icon: MapPin, text: "Allocated to Farmer Land in Himachal" },
                  { icon: Camera, text: "Geo-Tagged Plantation Photo Proof" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <f.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium text-sm">{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Trust */}
              <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Transparent & Traceable</span>
                </div>
                <div className="space-y-2">
                  {["Every tree traceable with GPS proof", "Directly supports rural farming families", "Track your impact in My Contributions"].map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - Checkout */}
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Quantity & Price */}
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-sm text-muted-foreground">Price per tree</div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {tree.mrp && tree.mrp > tree.price && (
                          <span className="text-base text-muted-foreground line-through">₹{tree.mrp}</span>
                        )}
                        <div className="text-2xl font-bold text-foreground">₹{tree.price}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(tree.stock_quantity, quantity + 1))} disabled={quantity >= tree.stock_quantity}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 mb-6">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">₹{totalPrice.toLocaleString()}</span>
                  </div>

                  {/* Delivery Details */}
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold text-foreground text-sm">Delivery Details</h3>
                    <Select value={state} onValueChange={(v) => { setState(v); setDistrict(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={district} onValueChange={setDistrict} disabled={!state}>
                      <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Village / Delivery Location" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} />
                  </div>

                  {/* Payment */}
                  {!user && !authLoading ? (
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground text-sm">Login to place your order</p>
                      <Button onClick={() => navigate("/auth")} className="w-full gap-2" size="lg">
                        Login to Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Tabs value={paymentTab} onValueChange={setPaymentTab}>
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="razorpay" className="text-xs sm:text-sm gap-1">
                          <CreditCard className="h-3 w-3" /> Online
                        </TabsTrigger>
                        <TabsTrigger value="wallet" className="text-xs sm:text-sm gap-1">
                          <Wallet className="h-3 w-3" /> Wallet
                        </TabsTrigger>
                        <TabsTrigger value="gift_card" className="text-xs sm:text-sm gap-1">
                          <Gift className="h-3 w-3" /> Gift Card
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="razorpay" className="space-y-4">
                        <p className="text-sm text-muted-foreground">Pay via UPI, Card, or Net Banking.</p>
                        <Button onClick={handleRazorpayPayment} disabled={isProcessing} className="w-full gap-2" size="lg">
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                          Pay ₹{totalPrice.toLocaleString()}
                        </Button>
                      </TabsContent>

                      <TabsContent value="wallet" className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                          <span className="text-sm text-muted-foreground">Wallet Balance</span>
                          <span className="font-bold text-foreground">₹{balance.toLocaleString()}</span>
                        </div>
                        {balance < totalPrice && (
                          <p className="text-xs text-destructive">Need ₹{(totalPrice - balance).toLocaleString()} more.</p>
                        )}
                        <Button onClick={handleWalletPayment} disabled={isProcessing || balance < totalPrice} className="w-full gap-2" size="lg">
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                          Pay from Wallet
                        </Button>
                      </TabsContent>

                      <TabsContent value="gift_card" className="space-y-4">
                        <div>
                          <Label htmlFor="gc-code">Gift Card Code</Label>
                          <Input id="gc-code" placeholder="GC-XXXX-XXXX" value={giftCardCode} onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())} className="mt-1" />
                        </div>
                        <Button onClick={handleGiftCardPayment} disabled={isProcessing || !giftCardCode.trim()} className="w-full gap-2" size="lg">
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                          Redeem & Order
                        </Button>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TreeCheckout;
