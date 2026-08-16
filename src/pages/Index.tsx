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
        description="We plant trees in Himachal Pradesh — CSR & school drives, individual and farmer plantation requests, geo-tagged photos, survival tracking and CO₂ estimates."
        keywords="CSR tree plantation India, ESG plantation partner, tree plantation Himachal, school plantation program, carbon offset Himachal, plantation implementation partner"

        url="https://himsols.online/"
      />
      <SEOSchemas includeServices={true} />
      <Navbar />
      <main>
        <HeroSection />
        <FourDoorsSection />
        <HowItWorksSection />
        <FreePlantationSection />
        <ImpactDashboardSection />
        <CSRSection />
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
