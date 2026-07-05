import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

// Convert common URLs to embeddable form
const toEmbed = (url: string): string => {
  try {
    const u = new URL(url);
    // YouTube watch → embed
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // YouTube Shorts
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/shorts/")) {
      return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`;
    }
    return url;
  } catch {
    return url;
  }
};

const LearnVideos = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["learn-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learn_videos")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen">
      <SEO
        title={isHi ? "वीडियो लाइब्रेरी | Himsols Learn" : "Video Library | Himsols Learn"}
        description={isHi ? "किसान की कहानियाँ, प्लांटेशन साइट टूर और DIY सस्टेनेबिलिटी रील्स।" : "Farmer stories, plantation site tours, and DIY sustainability reels."}
        url="https://himsols.com/learn/videos"
      />
      <Navbar />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 space-y-2">
            <Link to="/learn" className="text-sm text-muted-foreground hover:text-primary">← {isHi ? "लर्न हब" : "Learn Hub"}</Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{isHi ? "वीडियो लाइब्रेरी" : "Video Library"}</h1>
            <p className="text-muted-foreground">{isHi ? "किसानों की कहानियाँ, प्लांटेशन साइटें, DIY सस्टेनेबिलिटी।" : "Farmer stories, plantation sites, DIY sustainability."}</p>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : videos.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              {isHi ? "जल्द ही वीडियो जुड़ेंगे।" : "Videos coming soon."}
            </CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v: any) => {
                const title = isHi && v.title_hi ? v.title_hi : v.title;
                const desc = isHi && v.description_hi ? v.description_hi : v.description;
                return (
                  <Card key={v.id} className="overflow-hidden">
                    <div className="aspect-video bg-black">
                      <iframe
                        src={toEmbed(v.embed_url)}
                        title={title}
                        className="w-full h-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <Badge variant="secondary" className="text-xs">{v.category}</Badge>
                      <h3 className="font-semibold leading-snug">{title}</h3>
                      {desc && <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LearnVideos;
