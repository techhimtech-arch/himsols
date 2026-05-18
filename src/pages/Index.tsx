import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ImpactDashboardSection } from "@/components/home/ImpactDashboardSection";
import { ClimateImpactPackSection } from "@/components/home/ClimateImpactPackSection";
import { ScrapToWalletSection } from "@/components/home/ScrapToWalletSection";
import { TrustProofSection } from "@/components/home/TrustProofSection";
import { CSRSection } from "@/components/home/CSRSection";
import { PartnerFarmerSection } from "@/components/home/PartnerFarmerSection";
import { SchoolProgramSection } from "@/components/home/SchoolProgramSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { MobileStickyCTA } from "@/components/home/MobileStickyCTA";
import { SEO, SEOSchemas } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Himsols - Plant Trees. Support Rural Communities. Track Your Impact."
        description="Sponsor verified tree plantations on farmer land in Himachal Pradesh. Get geo-tagged proof, survival tracking, and carbon impact reports. ₹2,999 for 10 trees."
        keywords="climate impact Himachal, verified tree plantation, CSR plantation India, carbon offset, agroforestry, sustainability platform, plant trees India"
        url="https://himsols-web-companion.lovable.app"
      />
      <SEOSchemas includeServices={true} />
      <Navbar />

      {/* 1. Hero - Clear value proposition */}
      <HeroSection />

      {/* 2. How It Works - 3 Steps */}
      <HowItWorksSection />

      {/* 3. Scrap → Wallet → Plant flagship loop */}
      <ScrapToWalletSection />

      {/* 4. ₹2,999 Plantation Pack */}
      <ClimateImpactPackSection />

      {/* 4. Live Impact Dashboard */}
      <ImpactDashboardSection />

      {/* 5. Trust Proof - Photos + Founder Story */}
      <TrustProofSection />

      {/* 6. CSR & Corporate */}
      <CSRSection />

      {/* 7. Partner Farmer Network */}
      <PartnerFarmerSection />

      {/* 8. Testimonials */}
      <TestimonialsSection />

      {/* 9. Final CTA */}
      <FinalCTASection />

      <Footer />
      <MobileStickyCTA />
    </div>
  );
};

export default Index;
