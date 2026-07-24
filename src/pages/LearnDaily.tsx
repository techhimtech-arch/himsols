import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, TreePine, Share2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSafe } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";

// Deterministic pick: same tip index for a given date
const pickIndex = (poolSize: number) => {
  const d = new Date();
  const dayNumber = Math.floor(d.getTime() / (1000 * 60 * 60 * 24));
  return poolSize > 0 ? dayNumber % poolSize : 0;
};

const LearnDaily = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { user } = useAuthSafe();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [streakBonus, setStreakBonus] = useState(0);

  const { data: tips = [] } = useQuery({
    queryKey: ["eco-tips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eco_tips")
        .select("id, title, title_hi, body, body_hi, category, image_url")
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: streak } = useQuery({
    queryKey: ["user-streak", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  // Record daily visit when logged in
  useEffect(() => {
    const record = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase.rpc("record_daily_visit", { p_user_id: user.id });
      if (error) return;
      const row = Array.isArray(data) ? data[0] : data;
      if (row?.bonus_awarded > 0) {
        setStreakBonus(row.bonus_awarded);
        toast({
          title: isHi ? "🎉 स्ट्रीक बोनस!" : "🎉 Streak bonus!",
          description: isHi ? `₹${row.bonus_awarded} वॉलेट में जोड़ा गया` : `₹${row.bonus_awarded} added to your wallet`,
        });
      }
      qc.invalidateQueries({ queryKey: ["user-streak", user.id] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
    };
    record();
  }, [user?.id]);

  const tip = tips.length > 0 ? tips[pickIndex(tips.length)] : null;
  const title = tip ? (isHi && tip.title_hi ? tip.title_hi : tip.title) : "";
  const body = tip ? (isHi && tip.body_hi ? tip.body_hi : tip.body) : "";

  const share = async () => {
    const text = `${title}\n\n${body}\n\n${isHi ? "आज की टिप Himsols से" : "Today's eco-tip from Himsols"} → https://himsols.online/learn/daily`;
    if (navigator.share) {
      try { await navigator.share({ title, text, url: "https://himsols.online/learn/daily" }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: isHi ? "कॉपी हुआ!" : "Copied!" });
    }
  };

  return (
    <div className="min-h-screen">
      <SEO
        title={isHi ? "आज की ग्रीन टिप | Himsols" : "Today's Green Tip | Himsols"}
        description={isHi ? "रोज़ एक नई पर्यावरण टिप। स्ट्रीक बनाओ, बोनस पाओ।" : "A new eco-tip every day. Build a streak, earn wallet bonuses."}
        url="https://himsols.online/learn/daily"
      />
      <Navbar />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to="/learn" className="text-sm text-muted-foreground hover:text-primary">← {isHi ? "लर्न हब" : "Learn Hub"}</Link>

          {user && (
            <Card className="mt-4 mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isHi ? "तुम्हारी स्ट्रीक" : "Your streak"}</p>
                    <p className="text-xl font-bold">{streak?.current_streak ?? 0} {isHi ? "दिन" : "days"}</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Trophy className="h-3 w-3" /> {isHi ? "बेस्ट" : "Best"}: {streak?.longest_streak ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">{isHi ? "हर 7 दिन → ₹10 बोनस" : "Every 7 days → ₹10 bonus"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {tip ? (
            <Card className="overflow-hidden">
              {tip.image_url && (
                <div className="aspect-[16/9] bg-muted">
                  <img src={tip.image_url} alt={title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-6 md:p-8 space-y-4">
                <p className="text-xs uppercase tracking-widest text-primary font-semibold">{isHi ? "आज की टिप" : "Today's tip"} · {tip.category}</p>
                <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{body}</p>
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button onClick={share} variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" /> {isHi ? "शेयर करो" : "Share"}
                  </Button>
                  <Link to="/single-tree-pack">
                    <Button className="gap-2"><TreePine className="h-4 w-4" /> {isHi ? "एक पेड़ लगाओ ₹269" : "Plant a Tree · ₹269"}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              {isHi ? "जल्द ही आ रहा है।" : "Coming soon."}
            </CardContent></Card>
          )}

          {!user && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link to="/auth" className="text-primary font-medium">{isHi ? "साइन इन करो" : "Sign in"}</Link>{" "}
              {isHi ? "स्ट्रीक ट्रैक और ₹10 बोनस पाने के लिए (हर 7 दिन)।" : "to track your streak and earn ₹10 every 7 days."}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LearnDaily;
