import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface MarketplaceCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image_url: string | null;
  stock_quantity: number;
  seller_name: string | null;
  origin_location: string | null;
}

interface MarketplaceCartContextType {
  items: MarketplaceCartItem[];
  addToCart: (item: Omit<MarketplaceCartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const MarketplaceCartContext = createContext<MarketplaceCartContextType | undefined>(undefined);

export const MarketplaceCartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<MarketplaceCartItem[]>(() => {
    const stored = localStorage.getItem("marketplace_cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("marketplace_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<MarketplaceCartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock_quantity) }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.min(quantity, i.stock_quantity) } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <MarketplaceCartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </MarketplaceCartContext.Provider>
  );
};

export const useMarketplaceCart = () => {
  const context = useContext(MarketplaceCartContext);
  if (!context) {
    throw new Error("useMarketplaceCart must be used within a MarketplaceCartProvider");
  }
  return context;
};
