import { memo, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Leaf, Recycle, TreeDeciduous, Globe } from "lucide-react";

interface ExternalApp {
  id: string;
  name: string;
  description: string | null;
  url: string;
  icon: string | null;
  image_url: string | null;
  display_order: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf,
  Recycle,
  TreeDeciduous,
  Globe,
  ExternalLink,
};

export const MoreFromHimsolsSection = memo(() => {
  const [apps, setApps] = useState<ExternalApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      const { data } = await supabase
        .from("external_apps")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      setApps(data || []);
      setLoading(false);
    };
    loadApps();
  }, []);

  if (loading || apps.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            More from Himsols
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our other sustainability initiatives and tools
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {apps.map((app) => {
            const IconComponent = iconMap[app.icon || "ExternalLink"] || ExternalLink;
            
            return (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/30 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6 flex flex-col h-full">
                    {app.image_url ? (
                      <div className="w-full h-32 mb-4 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={app.image_url}
                          alt={app.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-7 h-7 text-primary" />
                      </div>
                    )}
                    
                    <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                      {app.name}
                    </h3>
                    
                    {app.description && (
                      <p className="text-sm text-muted-foreground flex-1 line-clamp-3">
                        {app.description}
                      </p>
                    )}
                    
                    <div className="mt-4 flex items-center text-sm font-medium text-primary">
                      <span>Explore</span>
                      <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
});

MoreFromHimsolsSection.displayName = "MoreFromHimsolsSection";
