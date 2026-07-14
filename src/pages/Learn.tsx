import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Flame, Video, TreePine, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const Learn = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const tiles = [
    {
      to: "/learn/lessons",
      icon: BookOpen,
      title: isHi ? "छोटे पाठ" : "Short Lessons",
      desc: isHi
        ? "5-10 मिनट के पाठ: कम्पोस्टिंग, बारिश का पानी, किचन गार्डन और अधिक। पूरा करो, बैज कमाओ।"
        : "5-10 min reads on composting, rainwater, kitchen gardening & more. Finish to earn badges.",
    },
    {
      to: "/learn/daily",
      icon: Flame,
      title: isHi ? "आज की ग्रीन टिप" : "Daily Green Tip",
      desc: isHi
        ? "रोज़ एक नई पर्यावरण टिप। स्ट्रीक बनाओ, हर 7 दिन पर ₹10 वॉलेट बोनस पाओ।"
        : "A new eco-tip every day. Build a streak — get ₹10 wallet bonus every 7 days.",
    },
    {
      to: "/learn/videos",
      icon: Video,
      title: isHi ? "वीडियो लाइब्रेरी" : "Video Library",
      desc: isHi
        ? "किसान की कहानियाँ, प्लांटेशन साइट टूर, DIY सस्टेनेबिलिटी।"
        : "Farmer stories, plantation site tours, DIY sustainability reels.",
    },
    {
      to: "/plants",
      icon: TreePine,
      title: isHi ? "पेड़ों का विश्वकोश" : "Tree Encyclopedia",
      desc: isHi
        ? "प्रत्येक प्रजाति के लिए देखभाल, जलवायु फिट और पारिस्थितिक लाभ।"
        : "Care guides, climate fit, and ecological benefits for every species.",
    },
  ];

  return (
    <div className="min-h-screen">
      <SEO
        title={isHi ? "लर्न हब — पर्यावरण सीखो और कार्य करो | Himsols" : "Learn Hub — Sustainability Lessons, Tips & Videos | Himsols"}
        description={isHi
          ? "मुफ्त पर्यावरण पाठ, दैनिक हरी टिप्स, वीडियो और पेड़ों का विश्वकोश।"
          : "Free sustainability lessons, daily green tips, videos, and a tree encyclopedia. Learn, earn badges, plant a tree."}
        url="https://himsols.com/learn"
      />
      <Navbar />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary">
              <BookOpen className="h-3.5 w-3.5" />
              {isHi ? "लर्न हब" : "Learn Hub"}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {isHi ? "सीखो. आदत बनाओ. पेड़ लगाओ." : "Learn. Build habits. Plant a tree."}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isHi
                ? "मुफ्त पाठ, दैनिक टिप्स और वीडियो — सब कुछ जो तुम्हें हरित जीवन शुरू करने के लिए चाहिए।"
                : "Free lessons, daily eco-tips, and videos — everything you need to start living greener."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tiles.map((tile) => (
              <Link key={tile.to} to={tile.to} className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-0.5 border-primary/10 hover:border-primary/30">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <tile.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">{tile.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tile.desc}</p>
                    <div className="flex items-center text-primary text-sm font-medium pt-2">
                      {isHi ? "देखो" : "Explore"}
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Link to="/learn/why-trees-matter" className="group block mt-8">
            <Card className="overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white hover:shadow-2xl transition-all hover:-translate-y-0.5">
              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-7 w-7 text-emerald-300" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] tracking-[0.3em] uppercase text-emerald-300 mb-2">
                    {isHi ? "विशेष अनुभव" : "Featured experience"}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {isHi ? "पेड़ क्यों मायने रखते हैं" : "Why trees matter"}
                  </h2>
                  <p className="text-sm text-white/70 max-w-xl">
                    {isHi
                      ? "एक सिनेमैटिक स्क्रॉल कहानी — विज़ुअल्स, एनिमेशन और असली प्रभाव."
                      : "A cinematic scrollytelling story — visuals, motion, and real impact."}
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/learn/how-we-plant" className="group block mt-4">
            <Card className="overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white hover:shadow-2xl transition-all hover:-translate-y-0.5">
              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-7 w-7 text-emerald-300" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] tracking-[0.3em] uppercase text-emerald-300 mb-2">
                    {isHi ? "विशेष अनुभव" : "Featured experience"}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {isHi ? "हम कैसे पेड़ लगाते हैं" : "How we plant"}
                  </h2>
                  <p className="text-sm text-white/70 max-w-xl">
                    {isHi
                      ? "छह असली कदम — ज़मीन, प्रजाति, मानसून, प्लांटिंग, सर्वाइवल, रिकॉर्ड."
                      : "Six real steps — land, species, monsoon, planting, survival, record."}
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Learn;
