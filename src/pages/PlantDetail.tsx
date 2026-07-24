import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Flower2, ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight, Sun, Droplets, Heart, Minus, Plus, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { SEO, ProductSchema } from "@/components/SEO";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface PlantImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  caption: string | null;
  sort_order: number | null;
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
}

const PlantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { language } = useLanguage();
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [images, setImages] = useState<PlantImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [relatedPlants, setRelatedPlants] = useState<(Plant & { images: PlantImage[] })[]>([]);

  useEffect(() => {
    if (id) {
      loadPlant();
    }
  }, [id]);

  const loadPlant = async () => {
    try {
      // Fetch plant details
      const { data: plantData, error: plantError } = await supabase
        .from("plants")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (plantError) throw plantError;
      
      if (!plantData) {
        setPlant(null);
        setLoading(false);
        return;
      }

      setPlant(plantData);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from("plant_images")
        .select("*")
        .eq("plant_id", id)
        .order("sort_order", { ascending: true });

      if (imagesError) throw imagesError;
      setImages(imagesData || []);

      // Set initial image to primary
      const primaryIndex = (imagesData || []).findIndex(img => img.is_primary);
      if (primaryIndex >= 0) {
        setCurrentImageIndex(primaryIndex);
      }

      // Fetch related plants from same category
      const { data: relatedData } = await supabase
        .from("plants")
        .select("*")
        .eq("is_active", true)
        .eq("category", plantData.category)
        .neq("id", id)
        .limit(4);

      if (relatedData && relatedData.length > 0) {
        // Fetch images for related plants
        const relatedIds = relatedData.map(p => p.id);
        const { data: relatedImages } = await supabase
          .from("plant_images")
          .select("*")
          .in("plant_id", relatedIds);

        const imagesByPlant: Record<string, PlantImage[]> = {};
        (relatedImages || []).forEach(img => {
          if (!imagesByPlant[img.plant_id]) {
            imagesByPlant[img.plant_id] = [];
          }
          imagesByPlant[img.plant_id].push(img);
        });

        setRelatedPlants(relatedData.map(p => ({
          ...p,
          images: imagesByPlant[p.id] || []
        })));
      }

    } catch (error) {
      console.error("Error loading plant:", error);
      toast({
        title: "Error",
        description: "Failed to load plant details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlantName = (p: Plant) => {
    return language === "hi" && p.name_hi ? p.name_hi : p.name;
  };

  const getPlantDescription = (p: Plant) => {
    return language === "hi" && p.description_hi ? p.description_hi : p.description;
  };

  const getPrimaryImage = (imgs: PlantImage[]) => {
    if (imgs.length === 0) return null;
    const primary = imgs.find(img => img.is_primary);
    return primary?.image_url || imgs[0]?.image_url;
  };

  const handleAddToCart = () => {
    if (!plant || plant.stock_quantity < quantity) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: plant.id,
        name: plant.name,
        price: plant.price,
        image_url: images.length > 0 ? getPrimaryImage(images) : null,
        stock_quantity: plant.stock_quantity,
        category: plant.category,
      });
    }

    toast({
      title: "Added to Cart",
      description: `${quantity} × ${getPlantName(plant)} added to your cart.`,
    });
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto text-center py-16">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Plant Not Found</h1>
            <p className="text-muted-foreground mb-6">The plant you're looking for doesn't exist or has been removed.</p>
            <Link to="/plants">
              <Button className="bg-pink-500 hover:bg-pink-600">
                <ArrowLeft className="h-4 w-4 mr-2" /> Browse All Plants
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen">
      <SEO
        title={`${plant.name} | Ornamental Plants`}
        description={plant.description.slice(0, 160)}
        keywords={`${plant.name}, ${plant.category}, ornamental plants, indoor plants`}
        url={`https://himsols.online/plants/${plant.id}`}
        image={currentImage?.image_url || undefined}
        type="product"
      />
      <ProductSchema
        name={plant.name}
        description={plant.description.slice(0, 300)}
        image={currentImage?.image_url || undefined}
        price={plant.price}
        availability={plant.stock_quantity > 0 ? 'InStock' : 'OutOfStock'}
        url={`https://himsols.online/plants/${plant.id}`}
      />
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link to="/plants" className="text-pink-600 hover:text-pink-700 inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Plants
            </Link>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div 
                className="relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-pointer group"
                onClick={() => images.length > 0 && setIsLightboxOpen(true)}
              >
                {currentImage ? (
                  <img
                    src={currentImage.image_url}
                    alt={plant.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20">
                    <Flower2 className="w-24 h-24 text-pink-300" />
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex 
                          ? "border-pink-500 ring-2 ring-pink-500/30" 
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-pink-500/90 text-white border-0">{plant.category}</Badge>
                  {plant.is_featured && (
                    <Badge className="bg-yellow-500 text-white border-0">Featured</Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {getPlantName(plant)}
                </h1>
                {plant.scientific_name && (
                  <p className="text-lg text-muted-foreground italic">{plant.scientific_name}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-pink-600">₹{plant.price}</span>
                <span className="text-muted-foreground">/plant</span>
              </div>

              {/* Care Info */}
              <div className="flex flex-wrap gap-3">
                {plant.care_level && (
                  <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 px-4 py-2 rounded-lg">
                    <Heart className="w-5 h-5" />
                    <div>
                      <p className="text-xs opacity-70">Care Level</p>
                      <p className="font-medium">{plant.care_level}</p>
                    </div>
                  </div>
                )}
                {plant.light_requirement && (
                  <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-4 py-2 rounded-lg">
                    <Sun className="w-5 h-5" />
                    <div>
                      <p className="text-xs opacity-70">Light</p>
                      <p className="font-medium">{plant.light_requirement}</p>
                    </div>
                  </div>
                )}
                {plant.water_requirement && (
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg">
                    <Droplets className="w-5 h-5" />
                    <div>
                      <p className="text-xs opacity-70">Water</p>
                      <p className="font-medium">{plant.water_requirement}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-lg mb-2">About this plant</h3>
                <p className="text-muted-foreground leading-relaxed">{getPlantDescription(plant)}</p>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
                {plant.stock_quantity > 0 ? (
                  <>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-green-600 font-medium">In Stock</span>
                    <span className="text-muted-foreground">({plant.stock_quantity} available)</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              {plant.stock_quantity > 0 && (
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(q => Math.min(plant.stock_quantity, q + 1))}
                      disabled={quantity >= plant.stock_quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button 
                    size="lg" 
                    className="flex-1 bg-pink-500 hover:bg-pink-600 gap-2"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart - ₹{plant.price * quantity}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Related Plants */}
          {relatedPlants.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">You might also like</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedPlants.map((rp) => (
                  <Link key={rp.id} to={`/plants/${rp.id}`}>
                    <Card className="group overflow-hidden border-pink-100 dark:border-pink-900/20 hover:shadow-xl transition-all">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {getPrimaryImage(rp.images) ? (
                          <img
                            src={getPrimaryImage(rp.images)!}
                            alt={getPlantName(rp)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                            <Flower2 className="w-12 h-12 text-pink-300" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold group-hover:text-pink-600 transition-colors line-clamp-1">
                          {getPlantName(rp)}
                        </h3>
                        <p className="text-pink-600 font-bold">₹{rp.price}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-5xl p-2 bg-black/95">
          <DialogTitle className="sr-only">{plant.name} Gallery</DialogTitle>
          <div className="relative">
            {currentImage && (
              <img
                src={currentImage.image_url}
                alt={plant.name}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
            {currentImage?.caption && (
              <p className="text-white/80 text-center mt-3 text-sm">{currentImage.caption}</p>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 justify-center mt-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PlantDetail;
