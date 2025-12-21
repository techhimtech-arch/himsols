import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Trash2, TreePine, ExternalLink } from "lucide-react";
import { useState } from "react";

export const CartSheet = () => {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const goToCart = () => {
    setOpen(false);
    navigate("/cart");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">Add some trees to get started!</p>
            <Button variant="outline" onClick={() => { setOpen(false); navigate("/shop"); }}>
              Browse Trees
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-card border border-border rounded-lg">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                      <TreePine className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <p className="text-primary font-semibold">₹{item.price}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock_quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={goToCart}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Cart & Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
