import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Brain, Newspaper, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const EngageSection = memo(() => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const cards = [
    {
      icon: BookOpen,
      tag: isHi ? "लर्न हब" : "Learn hub",
      title: isHi ? "पेड़ और पर्यावरण समझो" : "Understand trees & climate",
      text: isHi
        ? "हिमाचल के जंगल, जंगल की आग और रोज़ की आदतों पर छोटे, पढ़ने में आसान पाठ।"
        : "Short, readable pages on Himachal's forests, forest fires and everyday habits.",
      cta: isHi ? "लर्न हब खोलो" : "Open Learn hub",
      to: "/learn",
    },
    {
      icon: Brain,
      tag: isHi ? "ग्रीन क्विज़" : "Green quiz",
      title: isHi ? "अपना फुटप्रिंट जांचो" : "Check your footprint",
      text: isHi
        ? "2 मिनट का क्विज़ — अपना अनुमानित कार्बन फुटप्रिंट देखो और दोस्तों से शेयर करो।"
        : "A 2-minute quiz to see your estimated carbon footprint and share it with friends.",
      cta: isHi ? "क्विज़ शुरू करो" : "Take the quiz",
      to: "/green-quiz",
    },
    {
      icon: Newspaper,
      tag: isHi ? "ब्लॉग" : "Blog",
      title: isHi ? "ज़मीन से अपडेट" : "Updates from the ground",
      text: isHi
        ? "प्लांटेशन ड्राइव, किसानों की कहानियाँ और CSR अपडेट — सीधे फील्ड से।"
        : "Plantation drives, farmer stories and CSR updates — straight from the field.",
      cta: isHi ? "ब्लॉग पढ़ो" : "Read the blog",
      to: "/blog",
    },
  ];

  return (
    <section className="py-20 px-4 bg-primary/5">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
            {isHi ? "सीखो और जुड़ो" : "Learn & engage"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-4">
            {isHi ? "पेड़ लगाने से पहले — समझो" : "Before you plant — learn"}
          </h2>
          <p className="text-muted-foreground">
            {isHi
              ? "मुफ़्त पाठ, एक छोटा क्विज़ और फील्ड अपडेट। कोई साइनअप ज़रूरी नहीं।"
              : "Free lessons, a quick quiz and field updates. No signup needed."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.to}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card className="h-full flex flex-col transition-shadow hover:shadow-hover">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-muted-foreground">
                    {card.tag}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-1.5 mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1">{card.text}</p>
                  <Link to={card.to} className="mt-5">
                    <Button variant="outline" className="w-full group" size="sm">
                      {card.cta}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

EngageSection.displayName = "EngageSection";
