import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TreePine, ArrowRight, Phone, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/hooks/useLanguage";
import { useHomepageContent, getLocalizedText } from "@/hooks/useHomepageContent";

export const FinalCTASection = memo(() => {
  const { settings } = useSiteSettings();
  const { language } = useLanguage();
  const { getSection, counters } = useHomepageContent();
  
  const whatsappNumber = settings?.whatsapp_number || "919876543210";
  const section = getSection("final_cta");

  // Default values
  const title = section ? getLocalizedText(section, "title", language) : (
    language === "hi" ? "बदलाव लाने के लिए तैयार हैं?" : "Ready to Make an Impact?"
  );

  const subtitle = section ? getLocalizedText(section, "subtitle", language) : (
    language === "hi" 
      ? `${counters?.people_involved || 120}+ समुदाय सदस्यों के साथ जुड़ें जो एक हरित हिमाचल बना रहे हैं`
      : `Join ${counters?.people_involved || 120}+ community members building a greener Himachal`
  );

  const ctaText = section ? getLocalizedText(section, "cta_text", language) : (
    language === "hi" ? "पेड़ लगाना शुरू करें" : "Start Planting Trees"
  );

  if (!section?.is_active && section !== undefined) return null;

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
          {title}
        </h2>
        
        {/* Subheading */}
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-white/90 leading-relaxed">
          {subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to={section?.cta_link || "/tree-plantation"}>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-2xl gap-2 text-base px-8 w-full sm:w-auto"
            >
              {ctaText}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <a href={`https://wa.me/${whatsappNumber}?text=${language === "hi" ? "नमस्ते! मुझे हिमसोल्स की सेवाओं के बारे में जानना है।" : "Hi! I want to know more about Himsols services."}`} target="_blank" rel="noopener noreferrer">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/20 gap-2 text-base px-8 w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              {language === "hi" ? "WhatsApp पर चैट करें" : "Chat on WhatsApp"}
            </Button>
          </a>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-white/80">
          <a href={`tel:+${whatsappNumber}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone className="h-4 w-4" />
            <span>+91 {whatsappNumber.slice(2)}</span>
          </a>
          <span className="hidden sm:inline">•</span>
          <span>{language === "hi" ? "सोम-शनि, सुबह 9 - शाम 6" : "Available Mon-Sat, 9 AM - 6 PM"}</span>
        </div>
      </div>
    </section>
  );
});

FinalCTASection.displayName = "FinalCTASection";
