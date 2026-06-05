import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { MarketplaceProductCard } from "@/components/marketplace/MarketplaceProductCard";
import { MarketplaceCartSheet } from "@/components/marketplace/MarketplaceCartSheet";
import { CategoryFilter } from "@/components/marketplace/CategoryFilter";
import { Input } from "@/components/ui/input";
import { Store, Search, Truck, Shield, Leaf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type MarketplaceCategory = "farmer_produce" | "value_added" | "plants_gardening" | "home_utility";

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["marketplace-products", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("marketplace_products")
        .select(`
          *,
          seller:sellers(name, village)
        `)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name_hi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <SEO
        title="Rural Marketplace — Farmer Produce & Handmade Goods | Himsols"
        description="Shop directly from Himachal farmers and artisans: fresh produce, handmade crafts, plants, and home essentials. Pan-India delivery."
        url="https://himsols.com/marketplace"
      />
      <Navbar />


      {/* Hero Section */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Store className="w-4 h-4" />
              <span className="text-sm font-medium">Himsols Marketplace</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Buy Direct from <span className="text-primary">Farmers</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Fresh produce, plants, and authentic rural products delivered straight from Himachal's villages to your doorstep.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary" />
                </div>
                <span>100% Fresh</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-primary" />
                </div>
                <span>Farm to Door</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <span>Trusted Sellers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-6 border-y border-border/50 bg-background/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <MarketplaceCartSheet />
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="text-center py-16">
              <Store className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Check back soon for new products"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts?.map((product) => (
                <MarketplaceProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Marketplace;
