import { Suspense, lazy } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { MobileStickyCTA } from "@/components/home/MobileStickyCTA";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load below-the-fold sections for faster initial paint
const ActionableServicesSection = lazy(() => 
  import("@/components/home/ActionableServicesSection").then(m => ({ default: m.ActionableServicesSection }))
);
const LiveStatsSection = lazy(() => 
  import("@/components/home/LiveStatsSection").then(m => ({ default: m.LiveStatsSection }))
);
const TrustSection = lazy(() => 
  import("@/components/home/TrustSection").then(m => ({ default: m.TrustSection }))
);
const RecentActivitiesSection = lazy(() => 
  import("@/components/home/RecentActivitiesSection").then(m => ({ default: m.RecentActivitiesSection }))
);
const FinalCTASection = lazy(() => 
  import("@/components/home/FinalCTASection").then(m => ({ default: m.FinalCTASection }))
);

// Simple loading skeleton
const SectionLoader = () => (
  <div className="py-16 px-4">
    <div className="container mx-auto">
      <Skeleton className="h-8 w-64 mx-auto mb-8" />
      <div className="grid md:grid-cols-3 gap-6">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section - Critical, loaded immediately */}
      <HeroSection />

      {/* Lazy loaded sections with Suspense */}
      <Suspense fallback={<SectionLoader />}>
        <ActionableServicesSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <LiveStatsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <TrustSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <RecentActivitiesSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <FinalCTASection />
      </Suspense>

      <Footer />

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA />
    </div>
  );
};

export default Index;
