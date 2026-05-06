import { memo } from "react";
import { TreePine, Users, BarChart3 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const HowItWorksSection = memo(() => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const steps = [
    {
      number: "01",
      icon: TreePine,
      title: isHi ? "आप पेड़ प्रायोजित करें" : "You Sponsor Trees",
      description: isHi
        ? "क्लाइमेट इम्पैक्ट पैक चुनें या कस्टम मात्रा। पेमेंट Razorpay से सुरक्षित।"
        : "Choose a climate impact pack or custom quantity. Payment is processed securely via Razorpay.",
    },
    {
      number: "02",
      icon: Users,
      title: isHi ? "हम सत्यापित किसानों को आवंटित करते हैं" : "We Allocate to Verified Partner Farmers",
      description: isHi
        ? "पेड़ हिमाचल प्रदेश के ऑनबोर्डेड, स्वीकृत एग्रोफोरेस्ट्री किसानों को सौंपे जाते हैं।"
        : "Trees are assigned to onboarded, approved agroforestry farmers across Himachal Pradesh.",
    },
    {
      number: "03",
      icon: BarChart3,
      title: isHi ? "आपको सर्वाइवल रिपोर्ट और CO₂ डेटा मिलता है" : "You Receive Survival Reports & CO₂ Data",
      description: isHi
        ? "जियो-टैग फ़ोटो, समय-समय पर सर्वाइवल अपडेट और अनुमानित कार्बन ऑफसेट सर्टिफिकेट।"
        : "Get geo-tagged photos, periodic survival updates, and estimated carbon offset certificates.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {isHi ? "यह कैसे काम करता है" : "How It Works"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {isHi
              ? "प्रायोजन से मापने योग्य प्रभाव तक — एक पारदर्शी, तीन-चरणीय प्रक्रिया।"
              : "A transparent, three-step process from sponsorship to measurable impact."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-[60%] w-[80%] h-px bg-border" />
              )}
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-3xl font-bold text-muted-foreground/20">{step.number}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";
