import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TreePine, ShoppingCart, Package, Search, Filter, Plus, SlidersHorizontal, X, ChevronDown, ArrowUpDown, Share2 } from "lucide-react";
import { ShareButtons } from "@/components/ShareButtons";
import { useState, useEffect, useMemo } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

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

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock-desc";

const GROWTH_RATES = ["Slow", "Medium", "Fast", "Very Fast"];

const Shop = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedGrowthRates, setSelectedGrowthRates] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    loadTrees();
  }, []);

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

      // Set max price from data
      const highestPrice = Math.max(...(data?.map(t => t.price) || [100]));
      setMaxPrice(Math.ceil(highestPrice / 100) * 100);
      setPriceRange([0, Math.ceil(highestPrice / 100) * 100]);
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

  const filteredTrees = useMemo(() => {
    let filtered = [...trees];
    
    // Search filter
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
    
    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(tree => tree.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(tree => tree.price >= priceRange[0] && tree.price <= priceRange[1]);

    // Growth rate filter
    if (selectedGrowthRates.length > 0) {
      filtered = filtered.filter(tree => tree.growth_rate && selectedGrowthRates.includes(tree.growth_rate));
    }

    // Stock filter
    if (inStockOnly) {
      filtered = filtered.filter(tree => tree.stock_quantity > 0);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "stock-desc":
          return b.stock_quantity - a.stock_quantity;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [trees, searchQuery, selectedCategory, priceRange, selectedGrowthRates, inStockOnly, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (selectedGrowthRates.length > 0) count++;
    if (inStockOnly) count++;
    return count;
  }, [selectedCategory, priceRange, maxPrice, selectedGrowthRates, inStockOnly]);

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, maxPrice]);
    setSelectedGrowthRates([]);
    setInStockOnly(false);
    setSearchQuery("");
  };

  const toggleGrowthRate = (rate: string) => {
    setSelectedGrowthRates(prev => 
      prev.includes(rate) 
        ? prev.filter(r => r !== rate)
        : [...prev, rate]
    );
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

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Category</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder={t("common.allCategories")} />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border z-50">
            <SelectItem value="all">{t("common.allCategories")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Price Range</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={maxPrice}
            min={0}
            step={50}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Growth Rate Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Growth Rate</Label>
        <div className="space-y-2">
          {GROWTH_RATES.map((rate) => (
            <div key={rate} className="flex items-center space-x-2">
              <Checkbox
                id={`growth-${rate}`}
                checked={selectedGrowthRates.includes(rate)}
                onCheckedChange={() => toggleGrowthRate(rate)}
              />
              <label
                htmlFor={`growth-${rate}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {rate}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="in-stock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked === true)}
        />
        <label
          htmlFor="in-stock"
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          In Stock Only
        </label>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearAllFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-8 md:pb-16 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <ShoppingCart className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 md:mb-6" />
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">{t("shop.title")}</h1>
          <p className="text-base md:text-xl max-w-3xl mx-auto">
            {t("shop.subtitle")}
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-4 md:py-8 px-4 bg-card border-b border-border sticky top-16 z-40">
        <div className="container mx-auto">
          <div className="flex flex-col gap-4">
            {/* Search and Sort Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("shop.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="stock-desc">Availability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Row - Mobile Filter Button & Desktop Filters */}
            <div className="flex items-center justify-between gap-3">
              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden flex-1">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle>Filter Trees</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Category Quick Filter */}
              <div className="hidden md:flex items-center gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All
                </Button>
                {categories.slice(0, 5).map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
                {categories.length > 5 && (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-auto h-8 bg-background">
                      <ChevronDown className="h-4 w-4" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      {categories.slice(5).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Results count */}
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {filteredTrees.length} {filteredTrees.length !== 1 ? t("common.trees") : t("common.tree")}
              </p>
            </div>

            {/* Active Filters Pills */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-muted-foreground">Active:</span>
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
                    {selectedCategory} <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setPriceRange([0, maxPrice])}>
                    ₹{priceRange[0]}-₹{priceRange[1]} <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {selectedGrowthRates.map(rate => (
                  <Badge key={rate} variant="secondary" className="cursor-pointer" onClick={() => toggleGrowthRate(rate)}>
                    {rate} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {inStockOnly && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setInStockOnly(false)}>
                    In Stock <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-8 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-36 bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                <FilterContent />
              </div>
            </aside>

            {/* Trees Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">{t("common.loading")}</p>
                </div>
              ) : filteredTrees.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    {trees.length === 0 ? t("shop.noTrees") : t("shop.noMatch")}
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {filteredTrees.map((tree) => (
                    <Card key={tree.id} className="hover:shadow-hover transition-all duration-300 overflow-hidden group">
                      <div className="relative">
                        {tree.image_url ? (
                          <img
                            src={tree.image_url}
                            alt={getTreeName(tree)}
                            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-40 sm:h-48 bg-muted flex items-center justify-center">
                            <TreePine className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2 text-xs" variant="secondary">
                          {getTreeCategory(tree)}
                        </Badge>
                        {tree.stock_quantity < 10 && tree.stock_quantity > 0 && (
                          <Badge className="absolute top-2 left-2 text-xs" variant="destructive">
                            {t("common.onlyLeft").replace("{count}", tree.stock_quantity.toString())}
                          </Badge>
                        )}
                        {tree.stock_quantity === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                      <CardHeader className="p-3 sm:p-4 pb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground line-clamp-1">{getTreeName(tree)}</h3>
                        {tree.scientific_name && (
                          <p className="text-xs text-muted-foreground italic line-clamp-1">{tree.scientific_name}</p>
                        )}
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4 pt-0">
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{getTreeDescription(tree)}</p>
                        <div className="flex flex-wrap gap-1">
                          {tree.growth_rate && (
                            <Badge variant="outline" className="text-xs">{tree.growth_rate}</Badge>
                          )}
                          {tree.max_height && (
                            <Badge variant="outline" className="text-xs">{tree.max_height}</Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-2 p-3 sm:p-4 pt-0 border-t border-border mt-2">
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <span className="text-xl sm:text-2xl font-bold text-primary">₹{tree.price}</span>
                            <p className="text-xs text-muted-foreground">{tree.stock_quantity} {t("common.inStock")}</p>
                          </div>
                          <Button
                            onClick={() => navigate(`/shop/${tree.id}`)}
                            disabled={tree.stock_quantity === 0}
                            size="sm"
                            className="text-xs sm:text-sm"
                          >
                            {tree.stock_quantity === 0 ? (
                              t("shop.outOfStock")
                            ) : (
                              <>
                                <ArrowRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Buy Now</span>
                                <span className="sm:hidden">Buy</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Share2 className="h-3 w-3" /> Share
                          </span>
                          <ShareButtons
                            title={`🌳 ${getTreeName(tree)} - CSR Tree Plantation`}
                            description={`Plant ${getTreeName(tree)} trees for CSR & environmental impact! ₹${tree.price} per sapling. Support local farmers in Himachal Pradesh.`}
                            url={`/shop?tree=${tree.id}`}
                            image={tree.image_url}
                            whatsappMessage={`🌳 *${getTreeName(tree)} - CSR Tree Plantation*

Hey! Check out this amazing tree for plantation:

🌱 *${getTreeName(tree)}*
${tree.scientific_name ? `📚 Scientific: ${tree.scientific_name}` : ''}
💰 Price: ₹${tree.price} per sapling
📈 Growth Rate: ${tree.growth_rate || 'Moderate'}
${tree.max_height ? `📏 Max Height: ${tree.max_height}` : ''}

${getTreeDescription(tree).substring(0, 150)}...

Perfect for CSR initiatives, corporate gifting, or personal contribution! 🏢🎁

👉 Order now: ${window.location.origin}/shop

Your contribution supports local farmers and Himachal's future! 💚

- Himsols Green Initiative`}
                            size="sm"
                          />
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
