import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Flower2, Loader2, ShoppingCart, ChevronLeft, ChevronRight, Droplets, Sun, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface PlantImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  caption: string | null;
}

interface Plant {
  id: string;
  name: string;
  name_hi: string | null;
  scientific_name: string | null;
  description: string;
  category: string;
  price: number;
  stock_quantity: number;
  care_level: string | null;
  light_requirement: string | null;
  water_requirement: string | null;
  is_featured: boolean;
}

const ImageGallery = memo(({ images, plantName }: { images: PlantImage[]; plantName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500/10 to-purple-500/10">
        <Flower2 className="w-16 h-16 text-pink-500/30" />
      </div>
    );
  }

  const primaryIndex = images.findIndex(img => img.is_primary);
  const displayIndex = primaryIndex >= 0 ? primaryIndex : 0;
  const displayImage = images[currentIndex] || images[displayIndex];

  return (
    <>
      <div className="relative w-full h-full group/gallery">
        <img
          src={displayImage.image_url}
          alt={plantName}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setIsOpen(true)}
        />
        
        {images.length > 1 && (
          <>
            {/* Dots indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex 
                      ? "bg-white scale-110" 
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
            
            {/* Navigation arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-2 bg-black/95">
          <DialogTitle className="sr-only">{plantName} Gallery</DialogTitle>
          <div className="relative">
            <img
              src={displayImage.image_url}
              alt={plantName}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            {displayImage.caption && (
              <p className="text-white/80 text-center mt-2 text-sm">{displayImage.caption}</p>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 justify-center mt-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

ImageGallery.displayName = "ImageGallery";

export const FeaturedPlantsSection = memo(() => {
  const { addToCart } = useCart();

  const { data: plantsWithImages, isLoading } = useQuery({
    queryKey: ["featured-plants-with-images"],
    queryFn: async () => {
      // Fetch featured plants
      const { data: plants, error: plantsError } = await supabase
        .from("plants")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("sort_order", { ascending: true })
        .limit(4);
      
      if (plantsError) throw plantsError;
      if (!plants || plants.length === 0) return [];

      // Fetch images for all featured plants
      const plantIds = plants.map(p => p.id);
      const { data: images, error: imagesError } = await supabase
        .from("plant_images")
        .select("*")
        .in("plant_id", plantIds)
        .order("sort_order", { ascending: true });

      if (imagesError) throw imagesError;

      // Group images by plant
      const imagesByPlant: Record<string, PlantImage[]> = {};
      (images || []).forEach(img => {
        if (!imagesByPlant[img.plant_id]) {
          imagesByPlant[img.plant_id] = [];
        }
        imagesByPlant[img.plant_id].push(img);
      });

      return plants.map(plant => ({
        ...plant,
        images: imagesByPlant[plant.id] || []
      }));
    },
  });

  const handleAddToCart = (plant: Plant) => {
    if (plant.stock_quantity < 1) {
      toast.error("Plant out of stock");
      return;
    }
    addToCart({
      id: plant.id,
      name: plant.name,
      price: plant.price,
      image_url: null, // Will use plant_images
      stock_quantity: plant.stock_quantity,
      category: plant.category,
    });
    toast.success(`${plant.name} added to cart`);
  };

  const getCareIcon = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'easy': return '🌱';
      case 'medium': return '🌿';
      case 'hard': return '🌳';
      default: return '🌱';
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      </section>
    );
  }

  if (!plantsWithImages || plantsWithImages.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 px-4 relative bg-gradient-to-b from-pink-50/50 to-purple-50/30 dark:from-pink-950/20 dark:to-purple-950/10">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200/30 dark:bg-pink-500/10 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-slide-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-700 dark:text-pink-400 text-sm font-medium mb-4">
            <Flower2 className="h-4 w-4" />
            Ornamental Plants
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Beautify Your Space
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our handpicked collection of indoor and decorative plants that bring life and freshness to your home.
          </p>
        </div>

        {/* Plants Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {plantsWithImages.map((plant) => (
            <div 
              key={plant.id} 
              className="group bg-white dark:bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-pink-100 dark:border-pink-900/20"
            >
              {/* Image Gallery */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <ImageGallery images={plant.images} plantName={plant.name} />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-pink-500/90 text-white border-0 shadow-lg">
                    {plant.category}
                  </Badge>
                </div>
                
                {/* Image count indicator */}
                {plant.images.length > 1 && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                    {plant.images.length} photos
                  </div>
                )}
                
                {plant.stock_quantity < 1 && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="text-muted-foreground font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-pink-600 transition-colors line-clamp-1">
                    {plant.name}
                  </h3>
                  {plant.scientific_name && (
                    <p className="text-sm text-muted-foreground italic line-clamp-1">{plant.scientific_name}</p>
                  )}
                </div>

                {/* Care Info */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {plant.care_level && (
                    <span className="inline-flex items-center gap-1 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3" />
                      {plant.care_level}
                    </span>
                  )}
                  {plant.light_requirement && (
                    <span className="inline-flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                      <Sun className="w-3 h-3" />
                      {plant.light_requirement}
                    </span>
                  )}
                  {plant.water_requirement && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      <Droplets className="w-3 h-3" />
                      {plant.water_requirement}
                    </span>
                  )}
                </div>

                {/* Price & Add to Cart */}
                <div className="flex items-center justify-between pt-2 border-t border-pink-100 dark:border-pink-900/20">
                  <div>
                    <span className="text-lg font-bold text-pink-600">₹{plant.price}</span>
                    <span className="text-sm text-muted-foreground">/plant</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(plant)}
                    disabled={plant.stock_quantity < 1}
                    className="gap-1.5 bg-pink-500 hover:bg-pink-600"
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
          <Link to="/plants">
            <Button size="lg" variant="outline" className="gap-2 group border-pink-500 text-pink-700 hover:bg-pink-500 hover:text-white">
              Explore All Plants
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

FeaturedPlantsSection.displayName = "FeaturedPlantsSection";
