import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TreePine, Recycle, BookOpen, Calendar, Award, Users, Target } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import heroImage from "@/assets/hero-tree.jpg";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
                {t("hero.title")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/tree-plantation">
                  <Button size="lg">
                    {t("hero.startPlanting")}
                  </Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline">
                    {t("hero.exploreServices")}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary font-semibold px-4 py-2 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 w-fit animate-glow">
                <Award className="h-5 w-5" />
                <span>{t("hero.ecoCertified")}</span>
              </div>
            </div>
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Beautiful tree representing sustainability"
                className="relative rounded-3xl shadow-hover hover:scale-105 transition-transform duration-700 w-full h-[500px] object-cover border-4 border-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm" />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">{t("services.title")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("services.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard
              icon={<TreePine className="h-8 w-8 text-white" />}
              title={t("services.treePlantation")}
              description={t("services.treePlantationDesc")}
              color="hsl(150, 45%, 35%)"
            />
            <ServiceCard
              icon={<Recycle className="h-8 w-8 text-white" />}
              title={t("services.wasteManagement")}
              description={t("services.wasteManagementDesc")}
              color="hsl(200, 70%, 45%)"
            />
            <ServiceCard
              icon={<BookOpen className="h-8 w-8 text-white" />}
              title={t("services.conservation")}
              description={t("services.conservationDesc")}
              color="hsl(40, 65%, 50%)"
            />
            <ServiceCard
              icon={<Calendar className="h-8 w-8 text-white" />}
              title={t("services.ecoEvents")}
              description={t("services.ecoEventsDesc")}
              color="hsl(280, 60%, 50%)"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-white/30 hover-lift animate-scale-in">
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">450+</div>
              <p className="text-foreground font-semibold text-lg">{t("stats.treesPlanted")}</p>
            </div>
            <div className="space-y-4 p-8 rounded-2xl bg-gradient-to-br from-secondary/10 to-primary/10 backdrop-blur-sm border border-white/30 hover-lift animate-scale-in" style={{animationDelay: '0.1s'}}>
              <div className="text-6xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">120+</div>
              <p className="text-foreground font-semibold text-lg">{t("stats.users")}</p>
            </div>
            <div className="space-y-4 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-white/30 hover-lift animate-scale-in" style={{animationDelay: '0.2s'}}>
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">5</div>
              <p className="text-foreground font-semibold text-lg">{t("stats.panchayatsServed")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 backdrop-blur-sm bg-black/10" />
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-float">
            <Target className="h-20 w-20 mx-auto mb-8 text-white drop-shadow-2xl" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">{t("mission.title")}</h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-white/95 leading-relaxed">
            {t("mission.description")}
          </p>
          <Link to="/services">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-2xl">
              {t("mission.learnMore")}
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 backdrop-blur-xl" />
            <div className="absolute inset-0 border-2 border-white/30 rounded-3xl" />
            <div className="relative z-10">
              <div className="animate-float">
                <Users className="h-20 w-20 mx-auto mb-8 text-primary drop-shadow-lg" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">{t("cta.title")}</h2>
              <p className="text-foreground/80 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                {t("cta.description")}
              </p>
              <Link to="/auth">
                <Button size="lg">{t("cta.getStarted")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
