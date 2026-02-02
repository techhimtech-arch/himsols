import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ReferralBannerSection } from "@/components/home/ReferralBannerSection";
import { ActionableServicesSection } from "@/components/home/ActionableServicesSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { FeaturedTreesSection } from "@/components/home/FeaturedTreesSection";
import { FeaturedPlantsSection } from "@/components/home/FeaturedPlantsSection";
import { FeaturedCampaignsSection } from "@/components/home/FeaturedCampaignsSection";
import { LiveStatsSection } from "@/components/home/LiveStatsSection";
import { TrustSection } from "@/components/home/TrustSection";
import { RecentActivitiesSection } from "@/components/home/RecentActivitiesSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { MoreFromHimsolsSection } from "@/components/home/MoreFromHimsolsSection";
import { MobileStickyCTA } from "@/components/home/MobileStickyCTA";
import { SEO, SEOSchemas } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Himsols - Tree Plantation & Waste Management | Himachal Pradesh"
        description="Book tree plantation, schedule scrap pickup, and shop eco-friendly products from rural Himachal Pradesh. पेड़ लगाओ, कबाड़ बेचो, पर्यावरण बचाओ।"
        keywords="tree plantation Himachal, scrap pickup HP, waste management, eco products, farmer marketplace, पेड़ लगाओ, कबाड़"
        url="https://himsols-web-companion.lovable.app"
      />
      <SEOSchemas includeServices={true} />
      <Navbar />

      {/* Hero Section - Action-focused with 3 CTAs */}
      <HeroSection />

      {/* Referral Banner - Signup bonus and referral rewards */}
      <ReferralBannerSection />

      {/* Actionable Services - Cards with Request buttons */}
      {/* <ActionableServicesSection /> */}

      {/* Featured Products - Marketplace products with Add to Cart */}
      <FeaturedProductsSection />

      {/* Featured Trees - Tree plants with Add to Cart */}
      <FeaturedTreesSection />

      {/* Featured Plants - Ornamental plants with image gallery */}
      <FeaturedPlantsSection />

      {/* Featured Campaigns - Active campaigns with show_on_homepage=true */}
      <FeaturedCampaignsSection />

      {/* Live Stats - Animated counters */}
      <LiveStatsSection />

      {/* Trust Section - Photos, Testimonials, Partner logos */}
      <TrustSection />

      {/* Recent Activities - Live updates feed */}
      <RecentActivitiesSection />

      {/* More from Himsols - External apps */}
      <MoreFromHimsolsSection />

      {/* Final CTA - Strong call to action */}
      <FinalCTASection />

      <Footer />

      {/* Mobile Sticky CTA - Only shows on mobile after scroll */}
      <MobileStickyCTA />
    </div>
  );
};

export default Index;
