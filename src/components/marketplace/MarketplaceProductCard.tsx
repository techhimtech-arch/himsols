import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MapPin, User, Leaf } from "lucide-react";
import { useMarketplaceCart } from "@/hooks/useMarketplaceCart";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface MarketplaceProductCardProps {
  product: {
    id: string;
    name: string;
    name_hi?: string | null;
    category: string;
    subcategory?: string | null;
    price: number;
    unit: string;
    stock_quantity: number;
    image_url?: string | null;
    origin_location?: string | null;
    is_seasonal?: boolean;
    delivery_timeline?: string | null;
    seller?: {
      name: string;
      village: string;
    } | null;
  };
}

const categoryLabels: Record<string, string> = {
  farmer_produce: "Farmer Produce",
  value_added: "Value Added",
  plants_gardening: "Plants & Garden",
  home_utility: "Home & Utility",
};

const categoryColors: Record<string, string> = {
  farmer_produce: "bg-green-500/10 text-green-700 border-green-200",
  value_added: "bg-amber-500/10 text-amber-700 border-amber-200",
  plants_gardening: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  home_utility: "bg-blue-500/10 text-blue-700 border-blue-200",
};

export const MarketplaceProductCard = ({ product }: MarketplaceProductCardProps) => {
  const { addToCart } = useMarketplaceCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock_quantity < 1) {
      toast.error("Product out of stock");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image_url: product.image_url || null,
      stock_quantity: product.stock_quantity,
      seller_name: product.seller?.name || null,
      origin_location: product.origin_location || null,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link to={`/marketplace/${product.id}`}>
      <div className="group glass-card rounded-2xl overflow-hidden hover-lift cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <Leaf className="w-16 h-16 text-primary/30" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge className={`${categoryColors[product.category]} border`}>
              {categoryLabels[product.category]}
            </Badge>
            {product.is_seasonal && (
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 border-orange-200">
                Seasonal
              </Badge>
            )}
          </div>
          
          {product.stock_quantity < 1 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-muted-foreground font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
            {product.name_hi && (
              <p className="text-sm text-muted-foreground line-clamp-1">{product.name_hi}</p>
            )}
          </div>

          {/* Seller & Origin */}
          <div className="space-y-1">
            {product.seller && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{product.seller.name}</span>
              </div>
            )}
            {product.origin_location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{product.origin_location}</span>
              </div>
            )}
          </div>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div>
              <span className="text-lg font-bold text-primary">₹{product.price}</span>
              <span className="text-sm text-muted-foreground">/{product.unit}</span>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock_quantity < 1}
              className="gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};
