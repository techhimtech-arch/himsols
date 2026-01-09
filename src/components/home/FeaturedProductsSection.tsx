import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MarketplaceProductCard } from "@/components/marketplace/MarketplaceProductCard";

export const FeaturedProductsSection = memo(() => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select(`
          *,
          seller:sellers(name, village)
        `)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(4);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-slide-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <ShoppingBag className="h-4 w-4" />
            Featured Products
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Fresh From Local Farmers
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Support local farmers by purchasing fresh produce, handmade goods, and sustainable products directly from the source.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {products.map((product) => (
            <MarketplaceProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Explore More Button */}
        <div className="text-center">
          <Link to="/marketplace">
            <Button size="lg" className="gap-2 group">
              Explore More Products
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

FeaturedProductsSection.displayName = "FeaturedProductsSection";
