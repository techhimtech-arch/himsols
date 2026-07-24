import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMarketplaceCart } from "@/hooks/useMarketplaceCart";
import { toast } from "sonner";
import { useState } from "react";
import {
  ShoppingCart,
  MapPin,
  User,
  Truck,
  ArrowLeft,
  Minus,
  Plus,
  Leaf,
  Package,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketplaceCartSheet } from "@/components/marketplace/MarketplaceCartSheet";
import { SEO, ProductSchema } from "@/components/SEO";

const categoryLabels: Record<string, string> = {
  farmer_produce: "Farmer Produce",
  value_added: "Value Added",
  plants_gardening: "Plants & Garden",
  home_utility: "Home & Utility",
};

const MarketplaceProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useMarketplaceCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["marketplace-product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select(`
          *,
          seller:sellers(name, village, region, description)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock_quantity < 1) {
      toast.error("Product out of stock");
      return;
    }
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        seller_name: product.seller?.name || null,
        origin_location: product.origin_location || null,
      },
      quantity
    );
    toast.success(`${quantity} ${product.unit} of ${product.name} added to cart`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link to="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const productUrl = `https://himsols.online/marketplace/${product.id}`;
  const metaDesc = (product.description || `${product.name} from ${product.seller?.name || 'Himsols'} — fresh from rural Himachal.`).slice(0, 155);

  return (
    <div className="min-h-screen">
      <SEO
        title={`${product.name} — ₹${product.price}/${product.unit} | Himsols Marketplace`}
        description={metaDesc}
        url={productUrl}
        type="product"
        image={product.image_url || undefined}
      />
      <ProductSchema
        name={product.name}
        description={metaDesc}
        image={product.image_url || undefined}
        price={product.price}
        availability={product.stock_quantity > 0 ? 'InStock' : 'OutOfStock'}
        url={productUrl}
      />
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/marketplace">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Marketplace
              </Button>
            </Link>
            <MarketplaceCartSheet />
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden glass-card">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <Leaf className="w-24 h-24 text-primary/30" />
                </div>
              )}
              {product.is_seasonal && (
                <Badge className="absolute top-4 right-4 bg-orange-500">Seasonal</Badge>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-3">{categoryLabels[product.category]}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                {product.name_hi && (
                  <p className="text-xl text-muted-foreground">{product.name_hi}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 flex-wrap">
                {product.mrp && product.mrp > product.price && (
                  <span className="text-2xl text-muted-foreground line-through">₹{product.mrp}</span>
                )}
                <span className="text-4xl font-bold text-primary">₹{product.price}</span>
                <span className="text-lg text-muted-foreground">per {product.unit}</span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Save ₹{product.mrp - product.price}</span>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">{product.description}</p>
                {product.description_hi && (
                  <p className="text-muted-foreground mt-2">{product.description_hi}</p>
                )}
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                {product.seller && (
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <User className="w-4 h-4" />
                      <span>Seller</span>
                    </div>
                    <p className="font-medium">{product.seller.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.seller.village}, {product.seller.region}
                    </p>
                  </div>
                )}
                {product.origin_location && (
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>Origin</span>
                    </div>
                    <p className="font-medium">{product.origin_location}</p>
                  </div>
                )}
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Truck className="w-4 h-4" />
                    <span>Delivery</span>
                  </div>
                  <p className="font-medium">{product.delivery_timeline || "3-5 days"}</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Package className="w-4 h-4" />
                    <span>Stock</span>
                  </div>
                  <p className="font-medium">
                    {product.stock_quantity > 0
                      ? `${product.stock_quantity} ${product.unit} available`
                      : "Out of stock"}
                  </p>
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity < 1}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart - ₹{(product.price * quantity).toFixed(2)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MarketplaceProduct;
