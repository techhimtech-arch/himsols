import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, TreePine, Loader2, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export const FeaturedTreesSection = memo(() => {
  const { addToCart } = useCart();

  const { data: trees, isLoading } = useQuery({
    queryKey: ["featured-trees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trees")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("name", { ascending: true })
        .limit(4);
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddToCart = (tree: any) => {
    if (tree.stock_quantity < 1) {
      toast.error("Tree out of stock");
      return;
    }
    addToCart({
      id: tree.id,
      name: tree.name,
      price: tree.price,
      image_url: tree.image_url,
      stock_quantity: tree.stock_quantity,
      category: tree.category,
    });
    toast.success(`${tree.name} added to cart`);
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!trees || trees.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 px-4 relative bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-slide-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium mb-4">
            <TreePine className="h-4 w-4" />
            Featured Trees
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Plant a Tree, Grow a Future
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose from our curated selection of native and eco-friendly trees perfect for plantation drives and personal gardens.
          </p>
        </div>

        {/* Tree Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {trees.map((tree) => (
            <div key={tree.id} className="group glass-card rounded-2xl overflow-hidden hover-lift">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                {tree.image_url ? (
                  <img
                    src={tree.image_url}
                    alt={tree.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                    <TreePine className="w-16 h-16 text-green-500/30" />
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-green-500/10 text-green-700 border-green-200">
                    {tree.category}
                  </Badge>
                </div>
                
                {tree.stock_quantity < 1 && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="text-muted-foreground font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {tree.name}
                  </h3>
                  {tree.scientific_name && (
                    <p className="text-sm text-muted-foreground italic line-clamp-1">{tree.scientific_name}</p>
                  )}
                </div>

                {/* Growth Info */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {tree.growth_rate && (
                    <span className="bg-muted px-2 py-0.5 rounded">{tree.growth_rate} Growth</span>
                  )}
                  {tree.max_height && (
                    <span className="bg-muted px-2 py-0.5 rounded">↑ {tree.max_height}</span>
                  )}
                </div>

                {/* Price & Add to Cart */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div>
                    <span className="text-lg font-bold text-primary">₹{tree.price}</span>
                    <span className="text-sm text-muted-foreground">/plant</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(tree)}
                    disabled={tree.stock_quantity < 1}
                    className="gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explore More Button */}
        <div className="text-center">
          <Link to="/shop">
            <Button size="lg" variant="outline" className="gap-2 group border-green-500 text-green-700 hover:bg-green-500 hover:text-white">
              Explore All Trees
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

FeaturedTreesSection.displayName = "FeaturedTreesSection";
