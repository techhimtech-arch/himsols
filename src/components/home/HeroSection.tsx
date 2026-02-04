import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TreePine, PlayCircle, MapPin, Camera, Award, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-tree.jpg";

export const HeroSection = memo(() => {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-20 md:pt-28 pb-16 md:pb-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/15 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
              <TreePine className="h-4 w-4" />
              <span>Himachal's Green Initiative</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="text-foreground">Plant a Tree.</span>
              <br />
              <span className="text-foreground">Support Farmers.</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Heal the Himalayas.
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              Himsols helps you plant real trees with local farmers in Himachal Pradesh — track impact, receive certificates, and create a greener future.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/shop">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-all group px-8">
                  <TreePine className="h-5 w-5" />
                  Plant a Tree Now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto gap-2 border-2"
                onClick={scrollToHowItWorks}
              >
                <PlayCircle className="h-5 w-5" />
                See How It Works
              </Button>
            </div>

            {/* Trust Line */}
            <div className="pt-4 space-y-3">
              <p className="text-sm font-medium text-foreground flex items-center justify-center lg:justify-start gap-2">
                <span className="text-lg">🌱</span>
                Trusted by individuals, farmers & institutions
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  Real plantations
                </span>
                <span className="flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-primary" />
                  Photo proof
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" />
                  Certificate included
                </span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative order-first lg:order-last">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-3xl opacity-60" />
            <div className="relative">
              <img
                src={heroImage}
                alt="Beautiful tree representing sustainability in Himachal Pradesh"
                className="relative rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-700 w-full h-[320px] sm:h-[400px] lg:h-[520px] object-cover border-4 border-white/50"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-background/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-border/50 animate-bounce-subtle hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <TreePine className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">₹499</div>
                    <div className="text-sm text-muted-foreground">per tree planted</div>
                  </div>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground rounded-full px-4 py-2 shadow-lg font-semibold text-sm animate-float hidden sm:block">
                🌳 Verified Impact
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
