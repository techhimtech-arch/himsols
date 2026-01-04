import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMarketplaceCart } from "@/hooks/useMarketplaceCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ShoppingCart, CheckCircle2, Loader2, Store } from "lucide-react";

const MarketplaceCheckout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useMarketplaceCart();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [formData, setFormData] = useState({
    delivery_address: "",
    district: "",
    state: "Himachal Pradesh",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to place an order");
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!formData.delivery_address || !formData.district || !formData.state) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate order number
      const { data: orderNum, error: numError } = await supabase.rpc(
        "generate_marketplace_order_number"
      );
      if (numError) throw numError;

      // Create order
      const orderItems = items.map((item) => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
        seller_name: item.seller_name,
      }));

      const { error: orderError } = await supabase.from("marketplace_orders").insert({
        order_number: orderNum,
        user_id: user.id,
        items: orderItems,
        total_price: totalPrice,
        delivery_address: formData.delivery_address,
        district: formData.district,
        state: formData.state,
        notes: formData.notes || null,
      });

      if (orderError) throw orderError;

      setOrderNumber(orderNum);
      setOrderSuccess(true);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center glass-card p-8 rounded-2xl">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h1>
              <p className="text-muted-foreground mb-4">
                Your order <span className="font-mono font-medium text-primary">{orderNumber}</span> has been placed successfully.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                We'll notify you once your order is confirmed and dispatched.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/marketplace">
                  <Button className="w-full">Continue Shopping</Button>
                </Link>
                <Link to="/order-history">
                  <Button variant="outline" className="w-full">View Orders</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <Store className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <Link to="/marketplace">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Link to="/marketplace">
            <Button variant="ghost" className="gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Button>
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="glass-card p-6 rounded-2xl h-fit order-2 lg:order-1">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-3 border-b border-border/50">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.seller_name && (
                        <p className="text-xs text-muted-foreground">by {item.seller_name}</p>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} × ₹{item.price}
                        </span>
                        <span className="font-medium">₹{(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-primary">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="glass-card p-6 rounded-2xl order-1 lg:order-2">
              <h2 className="text-xl font-semibold mb-6">Delivery Details</h2>

              {!user && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-amber-800 text-sm">
                    Please{" "}
                    <Link to="/auth" className="font-medium underline">
                      login
                    </Link>{" "}
                    to place your order.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g., Shimla"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special instructions for delivery"
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || !user}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order - ₹${totalPrice.toFixed(2)}`
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to our terms and conditions.
                  Payment is Cash on Delivery.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MarketplaceCheckout;
