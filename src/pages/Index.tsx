import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ImpactDashboardSection } from "@/components/home/ImpactDashboardSection";
import { ClimateImpactPackSection } from "@/components/home/ClimateImpactPackSection";
import { CSRSection } from "@/components/home/CSRSection";
import { PartnerFarmerSection } from "@/components/home/PartnerFarmerSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { MobileStickyCTA } from "@/components/home/MobileStickyCTA";
import { SEO, SEOSchemas } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Himsols - Build Measurable Climate Impact in Himachal"
        description="Sponsor verified tree plantations on farmer land with geo-tag proof, survival tracking, and carbon impact reporting. ₹2,999 for 10 trees."
        keywords="climate impact Himachal, verified tree plantation, CSR plantation India, carbon offset, agroforestry, sustainability platform"
        url="https://himsols-web-companion.lovable.app"
      />
      <SEOSchemas includeServices={true} />
      <Navbar />

      {/* 1. Hero - Primary Offer */}
      <HeroSection />

      {/* 2. How It Works - 3 Steps */}
      <HowItWorksSection />

      {/* 3. Live Impact Dashboard */}
      <ImpactDashboardSection />

      {/* 4. ₹2,999 Climate Impact Pack */}
      <ClimateImpactPackSection />

      {/* 5. CSR & Corporate */}
      <CSRSection />

      {/* 6. Partner Farmer Network */}
      <PartnerFarmerSection />

      {/* 7. Final CTA */}
      <FinalCTASection />

      <Footer />
      <MobileStickyCTA />
    </div>
  );
};

export default Index;
