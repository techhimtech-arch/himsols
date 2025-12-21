import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Minus, Plus, Trash2, TreePine, CheckCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { INDIAN_STATES, getDistrictsForState, IndianState } from "@/lib/constants";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    delivery_location: "",
    state: "" as IndianState | "",
    district: "",
    notes: "",
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Add some trees to your cart first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPromises = items.map((item) =>
        supabase.from("orders").insert({
          user_id: user.id,
          tree_id: item.id,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          delivery_location: deliveryData.delivery_location,
          state: deliveryData.state || null,
          district: deliveryData.district,
          notes: deliveryData.notes || null,
        })
      );

      const results = await Promise.all(orderPromises);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        throw new Error("Some orders failed to place");
      }

      setOrderSuccess(true);
      clearCart();
      setDeliveryData({ delivery_location: "", state: "", district: "", notes: "" });
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to place order.",
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
      <section className="pt-32 pb-12 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Your Cart</h1>
          <p className="text-lg opacity-90">
            {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {orderSuccess ? (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle className="h-20 w-20 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Thank you for your order. We'll contact you soon to confirm delivery details.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate("/order-history")}>
                    View My Orders
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
                <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added any trees yet.
                </p>
                <Button onClick={() => navigate("/shop")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Browse Trees
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Cart Items</h2>
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
                    Clear Cart
                  </Button>
                </div>

                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                            <TreePine className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                              <p className="text-primary font-semibold mt-1">₹{item.price} each</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock_quantity}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <span className="text-sm text-muted-foreground">
                                (Max: {item.stock_quantity})
                              </span>
                            </div>
                            <p className="font-bold text-lg">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Link to="/shop" className="inline-flex items-center text-primary hover:underline mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>

              {/* Order Summary & Checkout */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="truncate pr-2">{item.name} x {item.quantity}</span>
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <form onSubmit={handleCheckout} className="space-y-4">
                      <div className="space-y-2">
                        <Label>State *</Label>
                        <Select
                          value={deliveryData.state}
                          onValueChange={(value) => setDeliveryData({ ...deliveryData, state: value as IndianState, district: "" })}
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
                          value={deliveryData.district}
                          onValueChange={(value) => setDeliveryData({ ...deliveryData, district: value })}
                          required
                          disabled={!deliveryData.state}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={deliveryData.state ? "Select district" : "Select state first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryData.state && getDistrictsForState(deliveryData.state).map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="delivery_location">Delivery Address *</Label>
                        <Input
                          id="delivery_location"
                          value={deliveryData.delivery_location}
                          onChange={(e) => setDeliveryData({ ...deliveryData, delivery_location: e.target.value })}
                          placeholder="Village/City, Landmark"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Special Instructions</Label>
                        <Textarea
                          id="notes"
                          value={deliveryData.notes}
                          onChange={(e) => setDeliveryData({ ...deliveryData, notes: e.target.value })}
                          placeholder="Any delivery notes..."
                          rows={3}
                        />
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Placing Order..." : "Place Order"}
                      </Button>

                      {!user && (
                        <p className="text-sm text-muted-foreground text-center">
                          You'll need to <Link to="/auth" className="text-primary hover:underline">login</Link> to checkout
                        </p>
                      )}
                    </form>
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
