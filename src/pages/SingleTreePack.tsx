import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  TreePine, Check, Shield, Camera, MapPin,
  Wallet, CreditCard, Gift, ArrowRight, Loader2, Leaf, BarChart3
} from "lucide-react";

const PACK_PRICE = 299;

const features = [
  { icon: TreePine, text: "1 Native Tree Planted on Farmer Land" },
  { icon: MapPin, text: "Exact GPS Location of Your Tree" },
  { icon: Camera, text: "Geo-Tagged Plantation Photo Proof" },
  { icon: BarChart3, text: "CO₂ Offset Contribution Tracked" },
];

declare global {
  interface Window { Razorpay: any; }
}

const SingleTreePack = () => {
  const { user, loading: authLoading } = useAuth();
  const { balance, fetchWallet } = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [paymentTab, setPaymentTab] = useState("razorpay");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleRazorpayPayment = async () => {
    if (!user) { navigate("/auth"); return; }
    setIsProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway");

      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        { body: { amount: PACK_PRICE, notes: { product: "Single Tree Pack" } } }
      );
      if (orderError || !orderData?.order_id) throw new Error("Failed to create payment order");

      const { data: profile } = await supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).single();

      const razorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Himsols",
        description: "Single Tree Pack – 1 Verified Tree",
        order_id: orderData.order_id,
        prefill: {
          name: profile?.full_name || "",
          email: profile?.email || user.email || "",
          contact: profile?.phone || "",
        },
        theme: { color: "#16a34a" },
        handler: async (response: any) => {
          try {
            const { data, error } = await supabase.functions.invoke("purchase-single-tree-pack", {
              body: {
                payment_method: "razorpay",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });
            if (error || !data?.success) throw new Error(data?.error || "Verification failed");
            toast({ title: "🌱 Tree Planted!", description: "Your Single Tree Pack order has been placed." });
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
    if (balance < PACK_PRICE) {
      toast({ title: "Insufficient Balance", description: `You need ₹${PACK_PRICE}. Current balance: ₹${balance}`, variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-single-tree-pack", {
        body: { payment_method: "wallet" },
      });
      if (error || !data?.success) throw new Error(data?.error || "Payment failed");
      toast({ title: "🌱 Tree Planted!", description: "Paid from wallet." });
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
    if (!giftCardCode.trim()) {
      toast({ title: "Enter Gift Card Code", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-single-tree-pack", {
        body: { payment_method: "gift_card", gift_card_code: giftCardCode.trim().toUpperCase() },
      });
      if (error || !data?.success) throw new Error(data?.error || "Payment failed");
      toast({ title: "🌱 Tree Planted!", description: "Gift card redeemed." });
      navigate("/my-contributions");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Plant a Tree – ₹299 Single Tree Pack | Himsols"
        description="Plant one verified native tree on farmer land for just ₹299. Get geo-tagged photo proof, GPS location, and CO₂ tracking."
      />
      <Navbar />

      <main className="pt-20">
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left - Product Details */}
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                <Leaf className="h-3 w-3 mr-1" /> Start Your Impact
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                ₹299 Single Tree Pack
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg">
                The simplest way to make a real climate impact. One tree, fully verified, planted on farmer land in Himachal Pradesh.
              </p>

              <div className="space-y-4 mb-8">
                {features.map((f) => (
                  <div key={f.text} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <f.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Trust indicators */}
              <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Why ₹299?</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Every rupee goes directly to planting and maintaining a verified sapling. No middlemen, no hidden costs.
                </p>
                <div className="space-y-3">
                  {[
                    "Sapling cost + farmer support included",
                    "Transparent — see exactly where your tree grows",
                    "Perfect entry point for first-time contributors",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - Payment */}
            <div className="lg:sticky lg:top-24">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6 md:p-8">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-foreground mb-1">₹299</div>
                    <div className="text-sm text-muted-foreground">One tree · One-time · Full transparency</div>
                  </div>

                  {!user && !authLoading ? (
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">Login to plant your tree</p>
                      <Button onClick={() => navigate("/auth")} className="w-full gap-2" size="lg">
                        Login to Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Tabs value={paymentTab} onValueChange={setPaymentTab}>
                      <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="razorpay" className="text-xs sm:text-sm gap-1">
                          <CreditCard className="h-3 w-3" /> Pay Online
                        </TabsTrigger>
                        <TabsTrigger value="wallet" className="text-xs sm:text-sm gap-1">
                          <Wallet className="h-3 w-3" /> Wallet
                        </TabsTrigger>
                        <TabsTrigger value="gift_card" className="text-xs sm:text-sm gap-1">
                          <Gift className="h-3 w-3" /> Gift Card
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="razorpay" className="space-y-4">
                        <p className="text-sm text-muted-foreground">Pay securely via UPI, Card, or Net Banking.</p>
                        <Button onClick={handleRazorpayPayment} disabled={isProcessing} className="w-full gap-2" size="lg">
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                          Pay ₹299
                        </Button>
                      </TabsContent>

                      <TabsContent value="wallet" className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                          <span className="text-sm text-muted-foreground">Wallet Balance</span>
                          <span className="font-bold text-foreground">₹{balance.toLocaleString()}</span>
                        </div>
                        {balance < PACK_PRICE && (
                          <p className="text-xs text-destructive">
                            Insufficient balance. Need ₹{(PACK_PRICE - balance).toLocaleString()} more.
                          </p>
                        )}
                        <Button onClick={handleWalletPayment} disabled={isProcessing || balance < PACK_PRICE} className="w-full gap-2" size="lg">
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                          Pay from Wallet
                        </Button>
                      </TabsContent>

                      <TabsContent value="gift_card" className="space-y-4">
                        <div>
                          <Label htmlFor="gc-code-single">Gift Card Code</Label>
                          <Input
                            id="gc-code-single"
                            placeholder="GC-XXXX-XXXX"
                            value={giftCardCode}
                            onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                            className="mt-1"
                          />
                        </div>
                        <Button onClick={handleGiftCardPayment} disabled={isProcessing || !giftCardCode.trim()} className="w-full gap-2" size="lg">
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                          Redeem & Plant
                        </Button>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>

              {/* Upsell */}
              <div className="mt-6 p-5 rounded-xl border border-border/50 bg-muted/20 text-center">
                <p className="text-sm text-muted-foreground mb-2">Want a bigger impact?</p>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/climate-impact-pack")}>
                  <TreePine className="h-3.5 w-3.5" />
                  Get 10 Trees for ₹2,999
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-muted/30 py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold mb-8 text-center">What Happens After You Buy</h2>
            <div className="space-y-6">
              {[
                { step: "1", title: "Order Confirmed", desc: "Your order enters our allocation pipeline. A verified farmer partner is assigned." },
                { step: "2", title: "Tree Planted", desc: "A native sapling is planted on farmer land with geo-tagged photo proof." },
                { step: "3", title: "Track Your Impact", desc: "View your tree's location, photos, and CO₂ offset in your contributions dashboard." },
              ].map(item => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SingleTreePack;
