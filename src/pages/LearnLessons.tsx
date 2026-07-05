import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSafe } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

const LearnLessons = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { user } = useAuthSafe();

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, slug, title, title_hi, summary, summary_hi, category, cover_image_url, read_minutes")
        .eq("is_published", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: completedIds = [] } = useQuery({
    queryKey: ["lesson-completions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_completions")
        .select("lesson_id")
        .eq("user_id", user!.id);
      return (data ?? []).map((r: any) => r.lesson_id);
    },
  });

  const title = (l: any) => (isHi && l.title_hi ? l.title_hi : l.title);
  const summary = (l: any) => (isHi && l.summary_hi ? l.summary_hi : l.summary);

  return (
    <div className="min-h-screen">
      <SEO
        title={isHi ? "पर्यावरण पाठ | Himsols Learn" : "Sustainability Lessons | Himsols Learn"}
        description={isHi
          ? "छोटे 5-10 मिनट के पर्यावरण पाठ जिन्हें पूरा करके बैज कमाओ।"
          : "Short 5-10 min sustainability lessons. Finish quizzes to earn badges."}
        url="https://himsols.com/learn/lessons"
      />
      <Navbar />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 space-y-2">
            <Link to="/learn" className="text-sm text-muted-foreground hover:text-primary">← {isHi ? "लर्न हब" : "Learn Hub"}</Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{isHi ? "छोटे पर्यावरण पाठ" : "Short Sustainability Lessons"}</h1>
            <p className="text-muted-foreground">{isHi ? "प्रत्येक पाठ 5-10 मिनट का है, अंत में एक छोटा क्विज़ है।" : "Each lesson takes 5-10 minutes and ends with a short quiz."}</p>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : lessons.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              {isHi ? "जल्द ही आ रहा है — पहले पाठ प्रकाशित हो रहे हैं।" : "Coming soon — first lessons are being published."}
            </CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {lessons.map((l: any) => {
                const done = completedIds.includes(l.id);
                return (
                  <Link key={l.id} to={`/learn/lessons/${l.slug}`} className="group">
                    <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                      {l.cover_image_url && (
                        <div className="aspect-[16/9] overflow-hidden rounded-t-lg bg-muted">
                          <img src={l.cover_image_url} alt={title(l)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                        </div>
                      )}
                      <CardContent className="p-5 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">{l.category}</Badge>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {l.read_minutes} min
                          </span>
                          {done && (
                            <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                              <CheckCircle2 className="h-3 w-3" /> {isHi ? "पूरा हुआ" : "Completed"}
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors">{title(l)}</h2>
                        {summary(l) && <p className="text-sm text-muted-foreground line-clamp-2">{summary(l)}</p>}
                      </CardContent>
                    </Card>
                  </Link>
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

export default LearnLessons;
