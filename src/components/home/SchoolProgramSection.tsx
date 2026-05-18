import { memo } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, TreePine, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

export const SchoolProgramSection = memo(() => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-primary/5 pointer-events-none" />
      <div className="container mx-auto relative z-10 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary">
              <GraduationCap className="h-3.5 w-3.5" />
              {isHi ? "स्कूल पार्टनरशिप" : "Schools Partnership"}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {isHi ? (
                <>बच्चों को सिखाएँ <span className="text-primary">सस्टेनेबिलिटी</span></>
              ) : (
                <>Teach kids <span className="text-primary">sustainability</span>, the right way</>
              )}
            </h2>
            <p className="text-muted-foreground text-lg">
              {isHi
                ? "हम स्कूलों, कॉलेजों और NGOs के साथ मिलकर वृक्षारोपण ड्राइव, इंटरैक्टिव वर्कशॉप और इको-क्लब चलाते हैं — मुफ्त।"
                : "We partner with schools, colleges and NGOs to run plantation drives, interactive workshops, and student-led eco-clubs — free of cost."}
            </p>
            <ul className="space-y-2">
              {[
                { icon: TreePine, en: "On-campus tree plantation drives", hi: "कैंपस पर वृक्षारोपण ड्राइव" },
                { icon: BookOpen, en: "Kids' workshops on climate, waste & water", hi: "बच्चों के लिए क्लाइमेट और कचरा वर्कशॉप" },
                { icon: Sparkles, en: "Student-led eco-club setup with mentor support", hi: "स्टूडेंट इको-क्लब + मेंटर सहयोग" },
              ].map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <b.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm md:text-base text-foreground/90 mt-1.5">{isHi ? b.hi : b.en}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/schools">
                <Button size="lg" className="gap-2 group">
                  {isHi ? "अपने स्कूल के लिए अप्लाई करें" : "Apply for your school"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/schools#apply">
                <Button size="lg" variant="outline">
                  {isHi ? "और जानें" : "Learn more"}
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: GraduationCap, n: "Schools", n_hi: "स्कूल", color: "from-primary/20 to-primary/5" },
                { icon: TreePine, n: "Plantation drives", n_hi: "वृक्षारोपण", color: "from-secondary/20 to-secondary/5" },
                { icon: BookOpen, n: "Eco workshops", n_hi: "वर्कशॉप", color: "from-accent/20 to-accent/5" },
                { icon: Sparkles, n: "Eco-clubs", n_hi: "इको-क्लब", color: "from-primary/20 to-secondary/5" },
              ].map((c, i) => (
                <div key={i} className={`rounded-2xl p-6 bg-gradient-to-br ${c.color} border border-border/40 backdrop-blur`}>
                  <c.icon className="h-8 w-8 text-primary mb-2" />
                  <div className="font-semibold text-sm">{isHi ? c.n_hi : c.n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SchoolProgramSection.displayName = "SchoolProgramSection";
