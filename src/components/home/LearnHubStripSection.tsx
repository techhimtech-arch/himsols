import { Link } from "react-router-dom";
import { BookOpen, Flame, Video, TreePine, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";

export const LearnHubStripSection = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const tiles = [
    { to: "/learn/why-trees-matter", icon: Sparkles, label: isHi ? "क्यों पेड़?" : "Why Trees?" },
    { to: "/learn/lessons", icon: BookOpen, label: isHi ? "छोटे पाठ" : "Lessons" },
    { to: "/learn/daily", icon: Flame, label: isHi ? "आज की टिप" : "Daily Tip" },
    { to: "/learn/videos", icon: Video, label: isHi ? "वीडियो" : "Videos" },
    { to: "/plants", icon: TreePine, label: isHi ? "पेड़ों का ज्ञान" : "Tree Wiki" },
  ];

  return (
    <section className="py-16 px-4 bg-primary/5">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {isHi ? "नया" : "New"}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {isHi ? "लर्न हब — सीखो, आदत बनाओ, पेड़ लगाओ" : "Learn Hub — Learn, build habits, plant a tree"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isHi
              ? "मुफ्त पर्यावरण पाठ, रोज़ की टिप्स और वीडियो। बैज कमाओ, स्ट्रीक बनाओ, वॉलेट बोनस पाओ।"
              : "Free sustainability lessons, daily tips, and videos. Earn badges, build streaks, unlock wallet bonuses."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {tiles.map((t) => (
            <Link key={t.to} to={t.to}>
              <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40">
                <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <t.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold text-sm">{t.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            {isHi ? "पूरा लर्न हब देखो" : "Explore the full Learn Hub"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
