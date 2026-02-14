import { memo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";
import { TreePine, Users, Heart, MapPin, Camera, FileText, Sprout, Mountain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const values = [
  {
    icon: TreePine,
    title_en: "Real Plantations",
    title_hi: "असली वृक्षारोपण",
    desc_en: "Every tree is planted on real land by local farmers in Himachal Pradesh — no shortcuts, no greenwashing.",
    desc_hi: "हर पेड़ हिमाचल प्रदेश में स्थानीय किसानों द्वारा असली ज़मीन पर लगाया जाता है।",
  },
  {
    icon: Users,
    title_en: "Farmer First",
    title_hi: "किसान पहले",
    desc_en: "We work directly with rural communities — no middlemen. Farmers earn fair wages and lead the plantation drives.",
    desc_hi: "हम सीधे ग्रामीण समुदायों के साथ काम करते हैं — कोई बिचौलिया नहीं।",
  },
  {
    icon: Camera,
    title_en: "Full Transparency",
    title_hi: "पूर्ण पारदर्शिता",
    desc_en: "You get photo proof, geo-tagged location, and a digital certificate for every tree planted in your name.",
    desc_hi: "आपको हर पेड़ के लिए फोटो प्रमाण, स्थान और डिजिटल प्रमाणपत्र मिलता है।",
  },
  {
    icon: Heart,
    title_en: "Impact Driven",
    title_hi: "प्रभाव-संचालित",
    desc_en: "From CSR campaigns to individual contributions — every action creates measurable environmental impact.",
    desc_hi: "CSR अभियानों से लेकर व्यक्तिगत योगदान तक — हर कार्य मापनीय पर्यावरणीय प्रभाव बनाता है।",
  },
];

const milestones = [
  { icon: Sprout, value: "2020", label_en: "Founded", label_hi: "स्थापना" },
  { icon: TreePine, value: "10,000+", label_en: "Trees Planted", label_hi: "पेड़ लगाए" },
  { icon: Users, value: "500+", label_en: "Farmers Supported", label_hi: "किसानों को सहायता" },
  { icon: Mountain, value: "Himachal", label_en: "Pradesh Based", label_hi: "प्रदेश आधारित" },
];

const AboutUs = memo(() => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Us | Himsols"
        description="Learn about Himsols — our mission to green the Himalayas, support local farmers, and create real environmental impact."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {isHi ? "हिमसोल्स के बारे में" : "About Himsols"}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {isHi
              ? "हम हिमाचल प्रदेश में स्थानीय किसानों के साथ मिलकर पेड़ लगाते हैं — असली प्रभाव, पूरी पारदर्शिता।"
              : "We partner with local farmers in Himachal Pradesh to plant real trees — creating genuine impact with full transparency."}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {isHi ? "हमारा मिशन" : "Our Mission"}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {isHi
                  ? "हिमसोल्स की स्थापना एक सरल विश्वास के साथ हुई थी: पर्यावरण संरक्षण और ग्रामीण आजीविका साथ-साथ चल सकते हैं। हम लोगों को पेड़ लगाने, किसानों का समर्थन करने और हिमालय को हरा-भरा बनाने का एक पारदर्शी तरीका प्रदान करते हैं।"
                  : "Himsols was founded with a simple belief: environmental conservation and rural livelihoods can go hand in hand. We provide a transparent way for individuals and organizations to plant trees, support farmers, and heal the Himalayas."}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {isHi
                  ? "हर पेड़ जो आप हमारे माध्यम से लगाते हैं, सीधे एक स्थानीय किसान परिवार को लाभ पहुंचाता है और पारिस्थितिकी तंत्र की बहाली में योगदान देता है।"
                  : "Every tree you plant through us directly benefits a local farmer family and contributes to ecosystem restoration in the fragile Himalayan region."}
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

      {/* Milestones */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {milestones.map((m, i) => (
              <Card key={i} className="text-center border-none shadow-sm">
                <CardContent className="pt-6">
                  <m.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{m.value}</p>
                  <p className="text-sm text-muted-foreground">{isHi ? m.label_hi : m.label_en}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            {isHi ? "हमारे मूल्य" : "What We Stand For"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <Card key={i} className="border shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl h-fit">
                      <v.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{isHi ? v.title_hi : v.title_en}</h3>
                      <p className="text-sm text-muted-foreground">{isHi ? v.desc_hi : v.desc_en}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {isHi ? "हमारे साथ जुड़ें" : "Join the Green Movement"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isHi
              ? "एक पेड़ लगाकर या ग्रीन गिफ्ट भेजकर शुरुआत करें।"
              : "Start by planting a tree or sending a green gift to someone you love."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/shop">🌱 {isHi ? "पेड़ लगाओ" : "Plant a Tree"}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/gift-cards">🎁 {isHi ? "ग्रीन गिफ्ट भेजें" : "Send a Green Gift"}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
});

AboutUs.displayName = "AboutUs";
export default AboutUs;
