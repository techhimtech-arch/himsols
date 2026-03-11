import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingCart, Minus, Plus, Trash2, TreePine, CheckCircle, ArrowLeft,
  CreditCard, Wallet, Gift, Loader2, ArrowRight
} from "lucide-react";
import { useState } from "react";
import { INDIAN_STATES, getDistrictsForState, IndianState } from "@/lib/constants";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const { balance, fetchWallet } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentTab, setPaymentTab] = useState("razorpay");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [deliveryData, setDeliveryData] = useState({
    delivery_location: "",
    state: "" as IndianState | "",
    district: "",
    notes: "",
  });

  const getOrderPayload = () => ({
    items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
    delivery_location: deliveryData.delivery_location,
    state: deliveryData.state || null,
    district: deliveryData.district || null,
    notes: deliveryData.notes || null,
  });

  const validateForm = (): boolean => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to place an order.", variant: "destructive" });
      navigate("/auth");
      return false;
    }
    if (items.length === 0) {
      toast({ title: "Cart Empty", description: "Add some trees to your cart first.", variant: "destructive" });
      return false;
    }
    return true;
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

  const handleRazorpayPayment = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway");

      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        { body: { amount: totalPrice, notes: { product: "Tree Order", items: items.length } } }
      );

      if (orderError || !orderData?.order_id) throw new Error("Failed to create payment order");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user!.id)
        .single();

      const razorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Himsols",
        description: `Tree Order - ${totalItems} tree${totalItems > 1 ? "s" : ""}`,
        order_id: orderData.order_id,
        prefill: {
          name: profile?.full_name || "",
          email: profile?.email || user!.email || "",
          contact: profile?.phone || "",
        },
        theme: { color: "#16a34a" },
        handler: async (response: any) => {
          try {
            const { data, error } = await supabase.functions.invoke("purchase-tree-order", {
              body: {
                ...getOrderPayload(),
                payment_method: "razorpay",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (error || !data?.success) throw new Error(data?.error || "Verification failed");

            setOrderSuccess(true);
            clearCart();
            toast({ title: "🎉 Order Placed!", description: "Payment successful. Your trees are on the way!" });
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
    if (!validateForm()) return;
    if (balance < totalPrice) {
      toast({ title: "Insufficient Balance", description: `You need ₹${totalPrice}. Current balance: ₹${balance}`, variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-tree-order", {
        body: { ...getOrderPayload(), payment_method: "wallet" },
      });

      if (error || !data?.success) throw new Error(data?.error || "Payment failed");

      setOrderSuccess(true);
      clearCart();
      await fetchWallet();
      toast({ title: "🎉 Order Placed!", description: "Paid from wallet successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGiftCardPayment = async () => {
    if (!validateForm()) return;
    if (!giftCardCode.trim()) {
      toast({ title: "Enter Gift Card Code", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-tree-order", {
        body: { ...getOrderPayload(), payment_method: "gift_card", gift_card_code: giftCardCode.trim().toUpperCase() },
      });

      if (error || !data?.success) throw new Error(data?.error || "Payment failed");

      setOrderSuccess(true);
      clearCart();
      toast({ title: "🎉 Order Placed!", description: "Gift card redeemed successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-10 px-4 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto text-center">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Your Cart</h1>
          <p className="text-muted-foreground">
            {totalItems} item{totalItems !== 1 ? "s" : ""} · ₹{totalPrice.toLocaleString()}
          </p>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          {orderSuccess ? (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle className="h-20 w-20 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl font-bold mb-4 text-foreground">Order Placed Successfully!</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Your trees have been ordered. Track your plantation journey in My Contributions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate("/my-contributions")} className="gap-2">
                    <TreePine className="h-4 w-4" /> My Contributions
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/shop")}>
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingCart className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-4 text-foreground">Your Cart is Empty</h2>
                <p className="text-muted-foreground mb-6">Browse our trees and start planting!</p>
                <Button onClick={() => navigate("/shop")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Browse Trees
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Cart Items</h2>
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
                    Clear Cart
                  </Button>
                </div>

                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-24 h-24 rounded-lg object-cover" />
                        ) : (
                          <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                            <TreePine className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                              <p className="text-primary font-semibold mt-1">₹{item.price} each</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-semibold text-lg text-foreground">{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock_quantity}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="font-bold text-lg text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Link to="/shop" className="inline-flex items-center text-primary hover:underline mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
                </Link>
              </div>

              {/* Checkout Panel */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Items summary */}
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="truncate pr-2 text-muted-foreground">{item.name} × {item.quantity}</span>
                          <span className="font-medium text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-foreground">Delivery Details (Optional)</h3>
                      <Select
                        value={deliveryData.state}
                        onValueChange={(value) => setDeliveryData({ ...deliveryData, state: value as IndianState, district: "" })}
                      >
                        <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {deliveryData.state && (
                        <Select
                          value={deliveryData.district}
                          onValueChange={(value) => setDeliveryData({ ...deliveryData, district: value })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                          <SelectContent>
                            {getDistrictsForState(deliveryData.state).map((district) => (
                              <SelectItem key={district} value={district}>{district}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      <Input
                        value={deliveryData.delivery_location}
                        onChange={(e) => setDeliveryData({ ...deliveryData, delivery_location: e.target.value })}
                        placeholder="Village/City, Landmark"
                      />
                      <Textarea
                        value={deliveryData.notes}
                        onChange={(e) => setDeliveryData({ ...deliveryData, notes: e.target.value })}
                        placeholder="Special instructions..."
                        rows={2}
                      />
                    </div>

                    {/* Payment Tabs */}
                    {!user ? (
                      <div className="text-center space-y-3">
                        <p className="text-sm text-muted-foreground">Login to complete your order</p>
                        <Button onClick={() => navigate("/auth")} className="w-full gap-2" size="lg">
                          Login to Continue <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Tabs value={paymentTab} onValueChange={setPaymentTab}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="razorpay" className="text-xs gap-1">
                            <CreditCard className="h-3 w-3" /> Pay Online
                          </TabsTrigger>
                          <TabsTrigger value="wallet" className="text-xs gap-1">
                            <Wallet className="h-3 w-3" /> Wallet
                          </TabsTrigger>
                          <TabsTrigger value="gift_card" className="text-xs gap-1">
                            <Gift className="h-3 w-3" /> Gift Card
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="razorpay" className="space-y-3 pt-3">
                          <p className="text-xs text-muted-foreground">Pay via UPI, Card, or Net Banking.</p>
                          <Button onClick={handleRazorpayPayment} disabled={isProcessing} className="w-full gap-2" size="lg">
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                            Pay ₹{totalPrice.toLocaleString()}
                          </Button>
                        </TabsContent>

                        <TabsContent value="wallet" className="space-y-3 pt-3">
                          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Wallet Balance</span>
                            <span className="font-bold text-foreground">₹{balance.toLocaleString()}</span>
                          </div>
                          {balance < totalPrice && (
                            <p className="text-xs text-destructive">
                              Insufficient balance. Need ₹{(totalPrice - balance).toLocaleString()} more.
                            </p>
                          )}
                          <Button onClick={handleWalletPayment} disabled={isProcessing || balance < totalPrice} className="w-full gap-2" size="lg">
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                            Pay from Wallet
                          </Button>
                        </TabsContent>

                        <TabsContent value="gift_card" className="space-y-3 pt-3">
                          <div>
                            <Label htmlFor="gc-code" className="text-sm">Gift Card Code</Label>
                            <Input
                              id="gc-code"
                              placeholder="GC-XXXX-XXXX"
                              value={giftCardCode}
                              onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                              className="mt-1"
                            />
                          </div>
                          <Button onClick={handleGiftCardPayment} disabled={isProcessing || !giftCardCode.trim()} className="w-full gap-2" size="lg">
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                            Redeem & Pay
                          </Button>
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cart;
