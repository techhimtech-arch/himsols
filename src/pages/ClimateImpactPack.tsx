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
  TreePine, Check, Shield, Camera, BarChart3, FileText, MapPin,
  Wallet, CreditCard, Gift, ArrowRight, Loader2, Leaf
} from "lucide-react";
import { MonsoonScarcityBadge } from "@/components/MonsoonScarcityBadge";

const PACK_PRICE = 2699;
const PACK_MRP = 2999;

const features = [
  { icon: TreePine, text: "10 Native Trees Planted" },
  { icon: MapPin, text: "Verified Farmer Land Allocation" },
  { icon: Camera, text: "Geo-Tagged Plantation Photos" },
  { icon: BarChart3, text: "6-Month Survival Tracking Update" },
  { icon: FileText, text: "CO₂ Offset Estimate Certificate" },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

const ClimateImpactPack = () => {
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

      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        { body: { amount: PACK_PRICE, notes: { product: "Climate Impact Pack" } } }
      );

      if (orderError || !orderData?.order_id) throw new Error("Failed to create payment order");

      const { data: profile } = await supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).single();

      const razorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Himsols",
        description: "Climate Impact Pack - 10 Trees",
        order_id: orderData.order_id,
        prefill: {
          name: profile?.full_name || "",
          email: profile?.email || user.email || "",
          contact: profile?.phone || "",
        },
        theme: { color: "#16a34a" },
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              "purchase-climate-pack",
              {
                body: {
                  payment_method: "razorpay",
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              }
            );

            if (verifyError || !verifyData?.success) throw new Error(verifyData?.error || "Verification failed");

            toast({ title: "🎉 Purchase Successful!", description: "Your Climate Impact Pack order has been placed." });
            navigate("/my-contributions");
          } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
          }
        },
        modal: { ondismiss: () => setIsProcessing(false) },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.on("payment.failed", (response: any) => {
        toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
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
      const { data, error } = await supabase.functions.invoke("purchase-climate-pack", {
        body: { payment_method: "wallet" },
      });

      if (error || !data?.success) throw new Error(data?.error || "Payment failed");

      toast({ title: "🎉 Purchase Successful!", description: "Paid from wallet. Your order is placed." });
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
      const { data, error } = await supabase.functions.invoke("purchase-climate-pack", {
        body: { payment_method: "gift_card", gift_card_code: giftCardCode.trim().toUpperCase() },
      });

      if (error || !data?.success) throw new Error(data?.error || "Payment failed");

      toast({ title: "🎉 Purchase Successful!", description: "Gift card redeemed. Your order is placed." });
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
        title="Climate Impact Pack – ₹2,699 for 10 Verified Trees | Himsols"
        description="Sponsor 10 native trees on verified farmer land for ₹2,699 (MRP ₹2,999). Get geo-tagged photos, survival tracking, and CO₂ offset certificate."
      />
      <Navbar />

      <main className="pt-20">
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left - Product Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                  <Leaf className="h-3 w-3 mr-1" /> Most Popular
                </Badge>
                <MonsoonScarcityBadge variant="compact" />
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                <span className="text-2xl md:text-3xl text-muted-foreground line-through mr-3">₹2,999</span>
                ₹2,699 Climate Impact Pack
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg">
                A complete, verified tree sponsorship package with measurable environmental outcomes.
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
                  <span className="font-semibold text-foreground">Built on Trust</span>
                </div>
                <div className="space-y-3">
                  {["Transparent reporting — every tree traceable", "Farmer partnership model — real land, real people", "Survival tracking — 6-month health updates with photos"].map(item => (
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
                    <div className="flex items-baseline justify-center gap-2 mb-1 flex-wrap">
                      <span className="text-xl text-muted-foreground line-through">₹{PACK_MRP.toLocaleString()}</span>
                      <span className="text-4xl font-bold text-foreground">₹{PACK_PRICE.toLocaleString()}</span>
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Save ₹{PACK_MRP - PACK_PRICE}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">One-time · No recurring fees</div>
                  </div>

                  {!user && !authLoading ? (
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">Login to purchase your Climate Impact Pack</p>
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
                        <Button
                          onClick={handleRazorpayPayment}
                          disabled={isProcessing}
                          className="w-full gap-2"
                          size="lg"
                        >
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                          Pay ₹{PACK_PRICE.toLocaleString()}
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
                        <Button
                          onClick={handleWalletPayment}
                          disabled={isProcessing || balance < PACK_PRICE}
                          className="w-full gap-2"
                          size="lg"
                        >
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                          Pay from Wallet
                        </Button>
                      </TabsContent>

                      <TabsContent value="gift_card" className="space-y-4">
                        <div>
                          <Label htmlFor="gc-code">Gift Card Code</Label>
                          <Input
                            id="gc-code"
                            placeholder="GC-XXXX-XXXX"
                            value={giftCardCode}
                            onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          onClick={handleGiftCardPayment}
                          disabled={isProcessing || !giftCardCode.trim()}
                          className="w-full gap-2"
                          size="lg"
                        >
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                          Redeem & Purchase
                        </Button>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works After Purchase */}
        <section className="bg-muted/30 py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold mb-8 text-center">What Happens After You Buy</h2>
            <div className="space-y-6">
              {[
                { step: "1", title: "Order Confirmed", desc: "Your order enters the allocation pipeline. Our team reviews and assigns a verified land partner." },
                { step: "2", title: "Trees Allocated", desc: "10 native trees are allocated to a verified farmer's land. You'll see the allocation in your dashboard." },
                { step: "3", title: "Plantation & Proof", desc: "Trees are planted with geo-tagged photos uploaded as proof. You can view them in your contributions." },
                { step: "4", title: "Survival Updates", desc: "After 6 months, you receive survival updates with health status, height, and photos of your trees." },
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

export default ClimateImpactPack;
