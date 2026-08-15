import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FourDoorsSection } from "@/components/home/FourDoorsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ImpactDashboardSection } from "@/components/home/ImpactDashboardSection";
import { FreePlantationSection } from "@/components/home/FreePlantationSection";
import { TrustProofSection } from "@/components/home/TrustProofSection";
import { CSRSection } from "@/components/home/CSRSection";
import { EngageSection } from "@/components/home/EngageSection";
import { HomepageFAQSection } from "@/components/home/HomepageFAQSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { MobileStickyCTA } from "@/components/home/MobileStickyCTA";
import { SEO, SEOSchemas } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Himsols — Tree Plantation Partner in Himachal Pradesh"
        description="We plant trees in Himachal Pradesh — paid CSR & school drives, free plantation for individuals and farmers. Geo-tagged photos, survival tracking, CO₂ estimates."
        keywords="CSR tree plantation India, ESG plantation partner, free tree plantation, school plantation program, carbon offset Himachal, plantation implementation partner"
        url="https://himsols.online/"
      />
      <SEOSchemas includeServices={true} />
      <Navbar />
      <main>
        <HeroSection />
        <FourDoorsSection />
        <FreePlantationSection />
        <HowItWorksSection />
        <CSRSection />
        <ImpactDashboardSection />
        <TrustProofSection />
        <EngageSection />
        <HomepageFAQSection />
        <FinalCTASection />
      </main>
      <Footer />
      <MobileStickyCTA />
    </div>
  );
};

export default Index;
