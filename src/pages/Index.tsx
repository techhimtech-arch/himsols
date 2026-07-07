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
import { HomepageFAQSection } from "@/components/home/HomepageFAQSection";
import { LearnHubStripSection } from "@/components/home/LearnHubStripSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { MobileStickyCTA } from "@/components/home/MobileStickyCTA";
import { SEO, SEOSchemas } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Himsols — Plant Trees, Support Rural Communities"
        description="Sponsor verified tree plantations on farmer land in Himachal Pradesh. Get geo-tagged proof, survival tracking, and carbon impact reports. ₹2,999 for 10 trees."
        keywords="climate impact Himachal, verified tree plantation, CSR plantation India, carbon offset, agroforestry, sustainability platform, plant trees India"
        url="https://himsols.com/"
      />
      <SEOSchemas includeServices={true} />
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <CSRSection />
        <ImpactDashboardSection />
        <TrustProofSection />
        <ClimateImpactPackSection />
        <ScrapToWalletSection />
        <PartnerFarmerSection />
        <SchoolProgramSection />
        <TestimonialsSection />
        <LearnHubStripSection />
        <HomepageFAQSection />
        <FinalCTASection />
      </main>
      <Footer />
      <MobileStickyCTA />
    </div>
  );
};

export default Index;
