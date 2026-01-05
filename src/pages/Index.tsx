import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ActionableServicesSection } from "@/components/home/ActionableServicesSection";
import { LiveStatsSection } from "@/components/home/LiveStatsSection";
import { TrustSection } from "@/components/home/TrustSection";
import { RecentActivitiesSection } from "@/components/home/RecentActivitiesSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { MobileStickyCTA } from "@/components/home/MobileStickyCTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section - Action-focused with 3 CTAs */}
      <HeroSection />

      {/* Actionable Services - Cards with Request buttons */}
      <ActionableServicesSection />

      {/* Live Stats - Animated counters */}
      <LiveStatsSection />

      {/* Trust Section - Photos, Testimonials, Partner logos */}
      <TrustSection />

      {/* Recent Activities - Live updates feed */}
      <RecentActivitiesSection />

      {/* Final CTA - Strong call to action */}
      <FinalCTASection />

      <Footer />

      {/* Mobile Sticky CTA - Only shows on mobile after scroll */}
      <MobileStickyCTA />
    </div>
  );
};

export default Index;
