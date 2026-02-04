import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TreePine, ArrowRight, Phone, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const FinalCTASection = memo(() => {
  const { settings } = useSiteSettings();
  const whatsappNumber = settings?.whatsapp_number || "919876543210";

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto text-center relative z-10">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl mb-8 animate-float">
          <TreePine className="h-10 w-10 text-white" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-lg leading-tight">
          Start Small. Create Real Impact.
        </h2>
        
        {/* Subheading */}
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-white/90 leading-relaxed">
          Every tree you plant supports local farmers and helps heal the Himalayas. 
          Begin your green journey today.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to="/shop">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-2xl gap-2 text-base px-8 w-full sm:w-auto"
            >
              🌱 Plant a Tree
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/gift-cards">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/20 gap-2 text-base px-8 w-full sm:w-auto"
            >
              🎁 Send a Green Gift
            </Button>
          </Link>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-white/80">
          <a href={`tel:+${whatsappNumber}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone className="h-4 w-4" />
            <span>+91 {whatsappNumber.slice(2)}</span>
          </a>
          <span className="hidden sm:inline">•</span>
          <span>Available Mon-Sat, 9 AM - 6 PM</span>
        </div>
      </div>
    </section>
  );
});

FinalCTASection.displayName = "FinalCTASection";
