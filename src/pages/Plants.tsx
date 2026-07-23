import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Flower2, ShoppingCart, Package, Search, Filter, SlidersHorizontal, X, ChevronDown, ArrowUpDown, Sun, Droplets, Heart } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
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
import { SEO, CollectionPageSchema } from "@/components/SEO";

interface PlantImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface Plant {
  id: string;
  name: string;
  name_hi: string | null;
  scientific_name: string | null;
  description: string;
  description_hi: string | null;
  price: number;
  stock_quantity: number;
  category: string;
  category_hi: string | null;
  care_level: string | null;
  light_requirement: string | null;
  water_requirement: string | null;
  is_featured: boolean;
  images?: PlantImage[];
}

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock-desc";

const CARE_LEVELS = ["Easy", "Medium", "Hard"];
const LIGHT_REQUIREMENTS = ["Low", "Medium", "Bright", "Direct"];
const WATER_REQUIREMENTS = ["Low", "Moderate", "High"];

const Plants = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedCareLevels, setSelectedCareLevels] = useState<string[]>([]);
  const [selectedLightReqs, setSelectedLightReqs] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      // Fetch plants
      const { data: plantsData, error: plantsError } = await supabase
        .from("plants")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (plantsError) throw plantsError;

      // Fetch images for all plants
      const plantIds = plantsData?.map(p => p.id) || [];
      const { data: imagesData } = await supabase
        .from("plant_images")
        .select("*")
        .in("plant_id", plantIds)
        .order("sort_order", { ascending: true });

      // Group images by plant
      const imagesByPlant: Record<string, PlantImage[]> = {};
      (imagesData || []).forEach(img => {
        if (!imagesByPlant[img.plant_id]) {
          imagesByPlant[img.plant_id] = [];
        }
        imagesByPlant[img.plant_id].push(img);
      });

      const plantsWithImages = (plantsData || []).map(plant => ({
        ...plant,
        images: imagesByPlant[plant.id] || []
      }));

      setPlants(plantsWithImages);
      
      const uniqueCategories = [...new Set(plantsData?.map(p => p.category) || [])];
      setCategories(uniqueCategories);

      const highestPrice = Math.max(...(plantsData?.map(p => p.price) || [100]));
      setMaxPrice(Math.ceil(highestPrice / 100) * 100);
      setPriceRange([0, Math.ceil(highestPrice / 100) * 100]);
    } catch (error: any) {
      console.error("Error loading plants:", error);
      toast({
        title: "Error",
        description: "Failed to load plants.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPlants = useMemo(() => {
    let filtered = [...plants];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        plant => 
          plant.name.toLowerCase().includes(query) ||
          plant.name_hi?.toLowerCase().includes(query) ||
          plant.description.toLowerCase().includes(query) ||
          plant.scientific_name?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(plant => plant.category === selectedCategory);
    }

    filtered = filtered.filter(plant => plant.price >= priceRange[0] && plant.price <= priceRange[1]);

    if (selectedCareLevels.length > 0) {
      filtered = filtered.filter(plant => plant.care_level && selectedCareLevels.includes(plant.care_level));
    }

    if (selectedLightReqs.length > 0) {
      filtered = filtered.filter(plant => plant.light_requirement && selectedLightReqs.includes(plant.light_requirement));
    }

    if (inStockOnly) {
      filtered = filtered.filter(plant => plant.stock_quantity > 0);
    }

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
  }, [plants, searchQuery, selectedCategory, priceRange, selectedCareLevels, selectedLightReqs, inStockOnly, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (selectedCareLevels.length > 0) count++;
    if (selectedLightReqs.length > 0) count++;
    if (inStockOnly) count++;
    return count;
  }, [selectedCategory, priceRange, maxPrice, selectedCareLevels, selectedLightReqs, inStockOnly]);

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, maxPrice]);
    setSelectedCareLevels([]);
    setSelectedLightReqs([]);
    setInStockOnly(false);
    setSearchQuery("");
  };

  const getPlantName = (plant: Plant) => {
    return language === "hi" && plant.name_hi ? plant.name_hi : plant.name;
  };

  const getPrimaryImage = (plant: Plant) => {
    if (!plant.images || plant.images.length === 0) return null;
    const primary = plant.images.find(img => img.is_primary);
    return primary?.image_url || plant.images[0]?.image_url;
  };

  const handleAddToCart = (plant: Plant) => {
    if (plant.stock_quantity === 0) return;
    
    addToCart({
      id: plant.id,
      name: plant.name,
      price: plant.price,
      image_url: getPrimaryImage(plant),
      stock_quantity: plant.stock_quantity,
      category: plant.category,
    });

    toast({
      title: "Added to Cart",
      description: `${getPlantName(plant)} has been added to your cart.`,
    });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Category</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border z-50">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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

      {/* Care Level Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Care Level</Label>
        <div className="space-y-2">
          {CARE_LEVELS.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`care-${level}`}
                checked={selectedCareLevels.includes(level)}
                onCheckedChange={() => {
                  setSelectedCareLevels(prev => 
                    prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
                  );
                }}
              />
              <label htmlFor={`care-${level}`} className="text-sm text-foreground cursor-pointer">
                {level}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Light Requirement Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Light Requirement</Label>
        <div className="space-y-2">
          {LIGHT_REQUIREMENTS.map((light) => (
            <div key={light} className="flex items-center space-x-2">
              <Checkbox
                id={`light-${light}`}
                checked={selectedLightReqs.includes(light)}
                onCheckedChange={() => {
                  setSelectedLightReqs(prev => 
                    prev.includes(light) ? prev.filter(l => l !== light) : [...prev, light]
                  );
                }}
              />
              <label htmlFor={`light-${light}`} className="text-sm text-foreground cursor-pointer">
                {light}
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
        <label htmlFor="in-stock" className="text-sm font-medium text-foreground cursor-pointer">
          In Stock Only
        </label>
      </div>

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
      <SEO
        title="Ornamental Plants | Indoor & Decorative Plants"
        description="Discover our handpicked collection of indoor and decorative plants. Easy care, beautiful aesthetics."
        keywords="indoor plants, ornamental plants, decorative plants, houseplants, plant shop"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-8 md:pb-16 px-4 bg-gradient-to-br from-pink-600 via-purple-600 to-pink-700 text-white">
        <div className="container mx-auto text-center">
          <Flower2 className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 md:mb-6" />
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Ornamental Plants</h1>
          <p className="text-base md:text-xl max-w-3xl mx-auto opacity-90">
            Beautify your home with our handpicked collection of indoor and decorative plants
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-4 md:py-8 px-4 bg-card border-b border-border sticky top-16 z-40">
        <div className="container mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
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

            <div className="flex items-center justify-between gap-3">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden flex-1">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle>Filter Plants</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden md:flex items-center gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className={selectedCategory === "all" ? "bg-pink-500 hover:bg-pink-600" : ""}
                >
                  All
                </Button>
                {categories.slice(0, 5).map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? "bg-pink-500 hover:bg-pink-600" : ""}
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
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {filteredPlants.length} plants
              </p>
            </div>

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
                {selectedCareLevels.map(level => (
                  <Badge key={level} variant="secondary" className="cursor-pointer" onClick={() => setSelectedCareLevels(prev => prev.filter(l => l !== level))}>
                    {level} Care <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {selectedLightReqs.map(light => (
                  <Badge key={light} variant="secondary" className="cursor-pointer" onClick={() => setSelectedLightReqs(prev => prev.filter(l => l !== light))}>
                    {light} Light <X className="h-3 w-3 ml-1" />
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

      {/* Main Content */}
      <section className="py-8 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-36 bg-card rounded-xl p-6 border border-pink-100 dark:border-pink-900/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-pink-700 dark:text-pink-400">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                <FilterContent />
              </div>
            </aside>

            {/* Plants Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading plants...</p>
                </div>
              ) : filteredPlants.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    {plants.length === 0 ? "No plants available yet." : "No plants match your filters."}
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {filteredPlants.map((plant) => (
                    <Card key={plant.id} className="group overflow-hidden border-pink-100 dark:border-pink-900/20 hover:shadow-xl transition-all duration-300">
                      <Link to={`/plants/${plant.id}`}>
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          {getPrimaryImage(plant) ? (
                            <img
                              src={getPrimaryImage(plant)!}
                              alt={getPlantName(plant)}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20">
                              <Flower2 className="w-16 h-16 text-pink-300" />
                            </div>
                          )}
                          
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-pink-500/90 text-white border-0">{plant.category}</Badge>
                          </div>
                          
                          {plant.is_featured && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-yellow-500 text-white border-0">Featured</Badge>
                            </div>
                          )}

                          {plant.images && plant.images.length > 1 && (
                            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                              {plant.images.length} photos
                            </div>
                          )}
                          
                          {plant.stock_quantity < 1 && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                              <span className="text-muted-foreground font-medium">Out of Stock</span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <CardContent className="p-4 space-y-3">
                        <Link to={`/plants/${plant.id}`}>
                          <h3 className="font-semibold text-foreground group-hover:text-pink-600 transition-colors line-clamp-1">
                            {getPlantName(plant)}
                          </h3>
                          {plant.scientific_name && (
                            <p className="text-sm text-muted-foreground italic line-clamp-1">{plant.scientific_name}</p>
                          )}
                        </Link>

                        <div className="flex flex-wrap gap-1.5">
                          {plant.care_level && (
                            <span className="inline-flex items-center gap-1 text-xs bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full">
                              <Heart className="w-3 h-3" /> {plant.care_level}
                            </span>
                          )}
                          {plant.light_requirement && (
                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                              <Sun className="w-3 h-3" /> {plant.light_requirement}
                            </span>
                          )}
                          {plant.water_requirement && (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                              <Droplets className="w-3 h-3" /> {plant.water_requirement}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-pink-100 dark:border-pink-900/20">
                          <div>
                            <span className="text-lg font-bold text-pink-600">₹{plant.price}</span>
                            <span className="text-sm text-muted-foreground">/plant</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(plant);
                            }}
                            disabled={plant.stock_quantity < 1}
                            className="gap-1.5 bg-pink-500 hover:bg-pink-600"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
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

export default Plants;
