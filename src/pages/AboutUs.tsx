import { memo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TreePine, Users, Heart, MapPin, Camera, Sprout, Mountain, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const iconMap: Record<string, any> = { TreePine, Users, Heart, MapPin, Camera, Sprout, Mountain };

const AboutUs = memo(() => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const { data: sections = [], isLoading: sLoading } = useQuery({
    queryKey: ["about-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .in("section_key", ["about_hero", "about_mission", "about_values", "about_cta"])
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: items = [], isLoading: iLoading } = useQuery({
    queryKey: ["about-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_items")
        .select("*")
        .in("section_key", ["about_values", "about_milestones"])
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const getSection = (key: string) => sections.find(s => s.section_key === key);
  const getItems = (key: string) => items.filter(i => i.section_key === key);

  const hero = getSection("about_hero");
  const mission = getSection("about_mission");
  const valuesSection = getSection("about_values");
  const cta = getSection("about_cta");
  const valueItems = getItems("about_values");
  const milestoneItems = getItems("about_milestones");

  if (sLoading || iLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="About Us | Himsols" description="Learn about Himsols — our mission to green the Himalayas." />
      <Navbar />

      {/* Hero */}
      {hero && (
        <section className="relative bg-primary/5 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              {isHi ? hero.title_hi : hero.title_en}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {isHi ? hero.subtitle_hi : hero.subtitle_en}
            </p>
          </div>
        </section>
      )}

      {/* Mission */}
      {mission && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {isHi ? mission.title_hi : mission.title_en}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {isHi ? mission.content_hi : mission.content_en}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-primary/10 rounded-2xl p-8 text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isHi ? "हिमाचल प्रदेश, भारत से संचालित" : "Operating from Himachal Pradesh, India"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Milestones */}
      {milestoneItems.length > 0 && (
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              {milestoneItems.map((m) => {
                const Icon = iconMap[m.icon || "Sprout"] || Sprout;
                return (
                  <Card key={m.id} className="text-center border-none shadow-sm">
                    <CardContent className="pt-6">
                      <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-foreground">{isHi ? m.title_hi || m.title_en : m.title_en}</p>
                      <p className="text-sm text-muted-foreground">{isHi ? m.description_hi || m.description_en : m.description_en}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Values */}
      {valuesSection && valueItems.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              {isHi ? valuesSection.title_hi : valuesSection.title_en}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {valueItems.map((v) => {
                const Icon = iconMap[v.icon || "TreePine"] || TreePine;
                return (
                  <Card key={v.id} className="border shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl h-fit">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{isHi ? v.title_hi || v.title_en : v.title_en}</h3>
                          <p className="text-sm text-muted-foreground">{isHi ? v.description_hi || v.description_en : v.description_en}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {cta && (
        <section className="py-12 bg-primary/5">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {isHi ? cta.title_hi : cta.title_en}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isHi ? cta.subtitle_hi : cta.subtitle_en}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to={cta.cta_link || "/shop"}>🌱 {isHi ? cta.cta_text_hi || cta.cta_text_en : cta.cta_text_en}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/gift-cards">🎁 {isHi ? "ग्रीन गिफ्ट भेजें" : "Send a Green Gift"}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
});

AboutUs.displayName = "AboutUs";
export default AboutUs;
