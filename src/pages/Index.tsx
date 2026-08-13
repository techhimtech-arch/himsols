import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FourDoorsSection } from "@/components/home/FourDoorsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ImpactDashboardSection } from "@/components/home/ImpactDashboardSection";
import { FreePlantationSection } from "@/components/home/FreePlantationSection";
import { TrustProofSection } from "@/components/home/TrustProofSection";
import { CSRSection } from "@/components/home/CSRSection";
import { LearnHubStripSection } from "@/components/home/LearnHubStripSection";
import { HomepageFAQSection } from "@/components/home/HomepageFAQSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { MobileStickyCTA } from "@/components/home/MobileStickyCTA";
import { SEO, SEOSchemas } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Himsols — Verified CSR Plantation Partner in Himachal Pradesh"
        description="Report-ready CSR & ESG tree plantation in Himachal Pradesh. Geo-tagged photos, survival tracking, CO₂ impact reports. Trusted by CSR teams. Get a proposal."
        keywords="CSR tree plantation India, ESG plantation partner, carbon offset Himachal, corporate tree planting, Section 135 CSR, verified plantation vendor, geo-tagged plantation"
        url="https://himsols.online/"
      />
      <SEOSchemas includeServices={true} />
      <Navbar />
      <main>
        <HeroSection />
        <FreePlantationSection />
        <HowItWorksSection />
        <CSRSection />
        <ImpactDashboardSection />
        <TrustProofSection />
        <HomepageFAQSection />
        <FinalCTASection />
      </main>
      <Footer />
      <MobileStickyCTA />
    </div>
  );
};

export default Index;
