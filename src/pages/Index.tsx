import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { KeyOffersSection } from "@/components/home/KeyOffersSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { LiveStatsSection } from "@/components/home/LiveStatsSection";
import { WhyTrustSection } from "@/components/home/WhyTrustSection";
import { TrustSection } from "@/components/home/TrustSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { MobileStickyCTA } from "@/components/home/MobileStickyCTA";
import { SEO, SEOSchemas } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Himsols - Plant Trees, Support Farmers, Heal the Himalayas"
        description="Plant real trees with local farmers in Himachal Pradesh. Track impact, receive certificates, and create a greener future. ₹499 per tree with photo proof."
        keywords="plant trees Himachal, tree plantation India, support farmers, CSR plantation, green gifts, eco-friendly, sustainability"
        url="https://himsols-web-companion.lovable.app"
      />
      <SEOSchemas includeServices={true} />
      <Navbar />

      {/* 1. Hero Section - Main CTA */}
      <HeroSection />

      {/* 2. How It Works - 3 Steps */}
      <HowItWorksSection />

      {/* 3. Key Offers - Revenue Drivers */}
      <KeyOffersSection />

      {/* 4. Live Stats - Impact Numbers */}
      <LiveStatsSection />

      {/* 5. Featured Eco Products */}
      <FeaturedProductsSection />

      {/* 6. Why Trust Himsols */}
      <WhyTrustSection />

      {/* 7. Social Proof / Testimonials */}
      <TrustSection />

      {/* 8. Final CTA */}
      <FinalCTASection />

      <Footer />

      {/* Mobile Sticky CTA - Only shows on mobile after scroll */}
      <MobileStickyCTA />
    </div>
  );
};

export default Index;
