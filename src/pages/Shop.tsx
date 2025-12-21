import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TreePine, ShoppingCart, Package, Search, Filter, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Tree {
  id: string;
  name: string;
  name_hi: string | null;
  scientific_name: string | null;
  description: string;
  description_hi: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category: string;
  category_hi: string | null;
  growth_rate: string | null;
  max_height: string | null;
}

const Shop = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [filteredTrees, setFilteredTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadTrees();
  }, []);

  useEffect(() => {
    filterTrees();
  }, [trees, searchQuery, selectedCategory]);

  const loadTrees = async () => {
    try {
      const { data, error } = await supabase
        .from("trees")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setTrees(data || []);
      
      const uniqueCategories = [...new Set(data?.map(t => t.category) || [])];
      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error("Error loading trees:", error);
      toast({
        title: "Error",
        description: "Failed to load available trees.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTrees = () => {
    let filtered = [...trees];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        tree => 
          tree.name.toLowerCase().includes(query) ||
          tree.name_hi?.toLowerCase().includes(query) ||
          tree.description.toLowerCase().includes(query) ||
          tree.description_hi?.toLowerCase().includes(query) ||
          tree.scientific_name?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(tree => tree.category === selectedCategory);
    }
    
    setFilteredTrees(filtered);
  };

  const getTreeName = (tree: Tree) => {
    return language === "hi" && tree.name_hi ? tree.name_hi : tree.name;
  };

  const getTreeDescription = (tree: Tree) => {
    return language === "hi" && tree.description_hi ? tree.description_hi : tree.description;
  };

  const getTreeCategory = (tree: Tree) => {
    return language === "hi" && tree.category_hi ? tree.category_hi : tree.category;
  };

  const handleAddToCart = (tree: Tree) => {
    if (tree.stock_quantity === 0) return;
    
    addToCart({
      id: tree.id,
      name: tree.name,
      price: tree.price,
      image_url: tree.image_url,
      stock_quantity: tree.stock_quantity,
      category: tree.category,
    });

    toast({
      title: t("shop.addedToCart"),
      description: t("shop.addedToCartDesc").replace("{name}", getTreeName(tree)),
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-6">{t("shop.title")}</h1>
          <p className="text-xl max-w-3xl mx-auto">
            {t("shop.subtitle")}
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 px-4 bg-card border-b border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("shop.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("common.allCategories")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.allCategories")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Trees Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("common.loading")}</p>
            </div>
          ) : filteredTrees.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {trees.length === 0 ? t("shop.noTrees") : t("shop.noMatch")}
              </p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">
                {t("common.showing")} {filteredTrees.length} {filteredTrees.length !== 1 ? t("common.trees") : t("common.tree")}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTrees.map((tree) => (
                  <Card key={tree.id} className="hover:shadow-hover transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      {tree.image_url ? (
                        <img
                          src={tree.image_url}
                          alt={getTreeName(tree)}
                          className="w-full h-52 object-cover"
                        />
                      ) : (
                        <div className="w-full h-52 bg-muted flex items-center justify-center">
                          <TreePine className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-3 right-3" variant="secondary">
                        {getTreeCategory(tree)}
                      </Badge>
                      {tree.stock_quantity < 10 && tree.stock_quantity > 0 && (
                        <Badge className="absolute top-3 left-3" variant="destructive">
                          {t("common.onlyLeft").replace("{count}", tree.stock_quantity.toString())}
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <h3 className="text-2xl font-bold text-foreground">{getTreeName(tree)}</h3>
                      {tree.scientific_name && (
                        <p className="text-sm text-muted-foreground italic">{tree.scientific_name}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{getTreeDescription(tree)}</p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {tree.growth_rate && (
                          <Badge variant="outline">{tree.growth_rate} {t("common.growth")}</Badge>
                        )}
                        {tree.max_height && (
                          <Badge variant="outline">{t("common.height")}: {tree.max_height}</Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                      <div>
                        <span className="text-2xl font-bold text-primary">₹{tree.price}</span>
                        <p className="text-xs text-muted-foreground">{tree.stock_quantity} {t("common.inStock")}</p>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(tree)}
                        disabled={tree.stock_quantity === 0}
                      >
                        {tree.stock_quantity === 0 ? (
                          t("shop.outOfStock")
                        ) : (
                          <>
                            <Plus className="mr-1 h-4 w-4" />
                            {t("shop.addToCart")}
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
