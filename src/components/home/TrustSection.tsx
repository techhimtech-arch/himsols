import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star, Building2, School, Users2, Leaf, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlantationPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
}

// Fallback static activities when no photos in database
const fallbackActivities = [
  {
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop",
    caption: "Plantation drive at Kullu Panchayat",
    date: "Dec 2025"
  },
  {
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400&h=300&fit=crop",
    caption: "Community cleanup campaign",
    date: "Nov 2025"
  },
  {
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=300&fit=crop",
    caption: "School awareness program",
    date: "Oct 2025"
  }
];

// Testimonials data
const testimonials = [
  {
    quote: "Himsols planted 50 trees in our panchayat area. The team was professional and the saplings are growing well. Excellent initiative!",
    name: "Ramesh Sharma",
    role: "Panchayat Pradhan",
    location: "Kullu District",
    avatar: "RS"
  },
  {
    quote: "We organized a tree plantation drive with Himsols at our school. Students loved it! Great awareness program for the next generation.",
    name: "Anita Devi",
    role: "School Principal",
    location: "Mandi District",
    avatar: "AD"
  },
  {
    quote: "The scrap collection service is very convenient. They pick up from doorstep and pay fair prices. Highly recommended!",
    name: "Suresh Kumar",
    role: "Local Farmer",
    location: "Shimla District",
    avatar: "SK"
  }
];

// Partner types
const partnerTypes = [
  { icon: Building2, label: "5 Panchayats" },
  { icon: School, label: "3 Schools" },
  { icon: Users2, label: "2 NGOs" },
  { icon: Leaf, label: "4 Nurseries" }
];

export const TrustSection = () => {
  const [photos, setPhotos] = useState<PlantationPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("plantation_photos")
        .select("id, photo_url, caption, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Use database photos if available, otherwise fallback
  const displayActivities = photos.length > 0 
    ? photos.map(photo => ({
        image: photo.photo_url,
        caption: photo.caption || "Plantation activity",
        date: formatDate(photo.created_at)
      }))
    : fallbackActivities;

  return (
    <section className="py-16 md:py-24 px-4 relative">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            Real Impact on the Ground
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            See Our Work in Action
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real stories from communities we've worked with across Himachal Pradesh
          </p>
        </div>

        {/* Activity Photos Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, index) => (
              <div 
                key={index}
                className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-muted animate-pulse"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </div>
            ))
          ) : (
            displayActivities.map((activity, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3]"
              >
                <img 
                  src={activity.image} 
                  alt={activity.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-medium text-sm md:text-base">{activity.caption}</p>
                  <p className="text-white/70 text-xs md:text-sm">{activity.date}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              className="bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                
                {/* Quote Text */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{testimonial.name}</div>
                    <div className="text-muted-foreground text-xs">{testimonial.role} • {testimonial.location}</div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Partner Logos */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-6">Trusted by communities across Himachal</p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {partnerTypes.map((partner) => (
              <div key={partner.label} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <partner.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{partner.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
