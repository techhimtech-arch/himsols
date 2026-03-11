import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Camera, MapPin, TreePine, Users, Globe, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const TrustProofSection = memo(() => {
  // Fetch recent plantation photos as proof
  const { data: photos } = useQuery({
    queryKey: ["trust-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plantation_photos")
        .select("id, photo_url, caption, latitude, longitude, created_at")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Camera className="h-4 w-4" />
            Real Proof, Real Impact
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            See Our Work on the Ground
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every tree we plant is documented with geo-tagged photos. Here's proof from our recent plantations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left — Photo Grid */}
          <div>
            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative rounded-xl overflow-hidden aspect-square group">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || "Plantation activity"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {photo.latitude && photo.longitude && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white/90 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                        <MapPin className="h-3 w-3" />
                        GPS Verified
                      </div>
                    )}
                    {photo.caption && (
                      <p className="absolute bottom-2 right-2 text-xs text-white/80 max-w-[60%] text-right truncate">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl bg-muted/50 aspect-square flex items-center justify-center">
                    <TreePine className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link to="/gallery">
                <Button variant="ghost" size="sm" className="text-primary gap-1">
                  View Full Gallery
                  <Camera className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — Founder Story + Quick Stats */}
          <div className="space-y-8">
            {/* Founder Story */}
            <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Quote className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Our Story</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Himsols started with a simple observation — Himachal's villages have the land, the farmers, and the need, but lack the resources and connections to create lasting green infrastructure.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We bridge the gap between urban supporters who want real climate impact and rural communities who can deliver it — with full transparency, geo-tagging, and survival tracking.
              </p>
              <Link to="/about" className="inline-block mt-4">
                <Button variant="link" className="text-primary p-0 h-auto gap-1">
                  Read our full story →
                </Button>
              </Link>
            </div>

            {/* Quick Impact Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: TreePine, value: "1,200+", label: "Trees Planted" },
                { icon: Globe, value: "4+", label: "Villages Covered" },
                { icon: Users, value: "27+", label: "Farmers Engaged" },
                { icon: MapPin, value: "25+", label: "Tons CO₂ Offset" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-center">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

TrustProofSection.displayName = "TrustProofSection";
