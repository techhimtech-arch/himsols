import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { WhyHimsolsSection } from "@/components/home/WhyHimsolsSection";
import { ActionableServicesSection } from "@/components/home/ActionableServicesSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { FeaturedTreesSection } from "@/components/home/FeaturedTreesSection";
import { LiveStatsSection } from "@/components/home/LiveStatsSection";
import { TrustSection } from "@/components/home/TrustSection";
import { RecentActivitiesSection } from "@/components/home/RecentActivitiesSection";
import { StorySection } from "@/components/home/StorySection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { MoreFromHimsolsSection } from "@/components/home/MoreFromHimsolsSection";
import { MobileStickyCTA } from "@/components/home/MobileStickyCTA";
import { SEO, SEOSchemas } from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";

const Index = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen">
      <SEO 
        title={language === "hi" 
          ? "हिमसोल्स - वृक्षारोपण और कचरा प्रबंधन | हिमाचल प्रदेश"
          : "Himsols - Tree Plantation & Waste Management | Himachal Pradesh"
        }
        description={language === "hi"
          ? "पेड़ लगाएं, स्क्रैप पिकअप शेड्यूल करें, और हिमाचल प्रदेश से इको-फ्रेंडली उत्पाद खरीदें। पेड़ लगाओ, कबाड़ बेचो, पर्यावरण बचाओ।"
          : "Book tree plantation, schedule scrap pickup, and shop eco-friendly products from rural Himachal Pradesh. Plant trees, sell scrap, save environment."
        }
        keywords={language === "hi"
          ? "वृक्षारोपण हिमाचल, स्क्रैप पिकअप, कचरा प्रबंधन, इको उत्पाद, किसान मार्केटप्लेस, पेड़ लगाओ"
          : "tree plantation Himachal, scrap pickup HP, waste management, eco products, farmer marketplace"
        }
        url="https://himsols-web-companion.lovable.app"
      />
      <SEOSchemas includeServices={true} />
      <Navbar />
      
      {/* Hero Section - CMS Driven with bilingual support */}
      <HeroSection />

      {/* How It Works - CMS Driven steps */}
      <HowItWorksSection />

      {/* Why Himsols - CMS Driven benefit cards */}
      <WhyHimsolsSection />

      {/* Actionable Services - Cards with Request buttons */}
      <ActionableServicesSection />

      {/* Featured Products - Marketplace products with Add to Cart */}
      <FeaturedProductsSection />

      {/* Featured Trees - Tree plants with Add to Cart */}
      <FeaturedTreesSection />

      {/* Live Stats - Dynamic counters from CMS */}
      <LiveStatsSection />

      {/* Trust Section - Photos, Testimonials, Partner logos */}
      <TrustSection />

      {/* Recent Activities - Live updates feed */}
      <RecentActivitiesSection />

      {/* Our Story - CMS Driven */}
      <StorySection />

      {/* More from Himsols - External apps */}
      <MoreFromHimsolsSection />

      {/* Final CTA - CMS Driven */}
      <FinalCTASection />

      <Footer />

      {/* Mobile Sticky CTA - Only shows on mobile after scroll */}
      <MobileStickyCTA />
    </div>
  );
};

export default Index;
