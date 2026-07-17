import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { MarketplaceCartProvider } from "@/hooks/useMarketplaceCart";
import { LanguageProvider } from "@/hooks/useLanguage";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MonsoonBanner } from "@/components/MonsoonBanner";
import { useAnalytics } from "@/hooks/useAnalytics";
import { lazy, Suspense } from "react";

// Eagerly load homepage for fast initial paint
import Index from "./pages/Index";

// Lazy load all other routes
const Services = lazy(() => import("./pages/Services"));
const TreePlantation = lazy(() => import("./pages/TreePlantation"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Admin = lazy(() => import("./pages/Admin"));
const Shop = lazy(() => import("./pages/Shop"));
const Gallery = lazy(() => import("./pages/Gallery"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const Cart = lazy(() => import("./pages/Cart"));
const WasteManagement = lazy(() => import("./pages/WasteManagement"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const B2BCorporate = lazy(() => import("./pages/B2BCorporate"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const MarketplaceProduct = lazy(() => import("./pages/MarketplaceProduct"));
const MarketplaceCheckout = lazy(() => import("./pages/MarketplaceCheckout"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const CampaignDetail = lazy(() => import("./pages/CampaignDetail"));
const MyContributions = lazy(() => import("./pages/MyContributions"));
const Plants = lazy(() => import("./pages/Plants"));
const PlantDetail = lazy(() => import("./pages/PlantDetail"));
const GiftCards = lazy(() => import("./pages/GiftCards"));
const RedeemGiftCard = lazy(() => import("./pages/RedeemGiftCard"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const VillageRegister = lazy(() => import("./pages/VillageRegister"));
const PartnerWithUs = lazy(() => import("./pages/PartnerWithUs"));
const CarbonDashboard = lazy(() => import("./pages/CarbonDashboard"));
const FarmerRegistration = lazy(() => import("./pages/FarmerRegistration"));
const CSRCarbonOffset = lazy(() => import("./pages/CSRCarbonOffset"));
const CSRGuide = lazy(() => import("./pages/CSRGuide"));
const CSRGuideThankYou = lazy(() => import("./pages/CSRGuideThankYou"));

const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard"));
const Impact = lazy(() => import("./pages/Impact"));
const ClimateImpactPack = lazy(() => import("./pages/ClimateImpactPack"));
const GreenQuiz = lazy(() => import("./pages/GreenQuiz"));
const TreeCheckout = lazy(() => import("./pages/TreeCheckout"));
const SingleTreePack = lazy(() => import("./pages/SingleTreePack"));
const TrackRequest = lazy(() => import("./pages/TrackRequest"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const SchoolProgram = lazy(() => import("./pages/SchoolProgram"));
const BulkPlantation = lazy(() => import("./pages/BulkPlantation"));
const SustainabilityDay = lazy(() => import("./pages/SustainabilityDay"));
const SustainabilityDaysIndex = lazy(() => import("./pages/SustainabilityDaysIndex"));
const PlantTreesInCity = lazy(() => import("./pages/PlantTreesInCity"));
const TreeSpeciesPage = lazy(() => import("./pages/TreeSpeciesPage"));
const PlantTreesForUseCase = lazy(() => import("./pages/PlantTreesForUseCase"));
const MonsoonPlantationHimachal = lazy(() => import("./pages/MonsoonPlantationHimachal"));
const Learn = lazy(() => import("./pages/Learn"));
const LearnLessons = lazy(() => import("./pages/LearnLessons"));
const LearnLessonDetail = lazy(() => import("./pages/LearnLessonDetail"));
const LearnDaily = lazy(() => import("./pages/LearnDaily"));
const LearnVideos = lazy(() => import("./pages/LearnVideos"));
const LearnWhyTreesMatter = lazy(() => import("./pages/LearnWhyTreesMatter"));
const LearnHowWePlant = lazy(() => import("./pages/LearnHowWePlant"));
const LearnHimachalJungles = lazy(() => import("./pages/LearnHimachalJungles"));
const LearnForestFires = lazy(() => import("./pages/LearnForestFires"));
const LearnSustainabilityHabits = lazy(() => import("./pages/LearnSustainabilityHabits"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch if data is fresh
      gcTime: 10 * 60 * 1000, // 10 minutes cache
      retry: 2, // Max 2 retries on failure
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: false, // Don't refetch on tab switch
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-xl">🌱</span>
      </div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => {
  useAnalytics();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <MarketplaceCartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <PWAInstallPrompt />
              <PWAUpdatePrompt />
              <WhatsAppButton />
              <BrowserRouter>
                <AnalyticsWrapper>
                  <MonsoonBanner />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/tree-plantation" element={<TreePlantation />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/marketplace" element={<Marketplace />} />
                      <Route path="/marketplace/:id" element={<MarketplaceProduct />} />
                      <Route path="/marketplace/checkout" element={<MarketplaceCheckout />} />
                      <Route path="/plants" element={<Plants />} />
                      <Route path="/plants/:id" element={<PlantDetail />} />
                      <Route path="/campaigns" element={<Campaigns />} />
                      <Route path="/campaign/:id" element={<CampaignDetail />} />
                      <Route path="/my-contributions" element={<MyContributions />} />
                      <Route path="/gift-cards" element={<GiftCards />} />
                      <Route path="/redeem-gift-card" element={<RedeemGiftCard />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/shop/:id" element={<TreeCheckout />} />
                      <Route path="/gallery" element={<Gallery />} />
                      <Route path="/order-history" element={<OrderHistory />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/waste-management" element={<WasteManagement />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/corporate" element={<B2BCorporate />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/refund-policy" element={<RefundPolicy />} />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/village-register" element={<VillageRegister />} />
                      <Route path="/partner-with-us" element={<PartnerWithUs />} />
                      <Route path="/carbon-dashboard" element={<CarbonDashboard />} />
                      <Route path="/farmer-registration" element={<FarmerRegistration />} />
                      <Route path="/csr-carbon-offset" element={<CSRCarbonOffset />} />
                      <Route path="/csr/guide-to-csr-plantation-india" element={<CSRGuide />} />
                      <Route path="/csr/guide-to-csr-plantation-india/thank-you" element={<CSRGuideThankYou />} />
                      <Route path="/apply-land-partner" element={<Navigate to="/farmer-registration" replace />} />
                      <Route path="/partner-dashboard" element={<PartnerDashboard />} />
                      <Route path="/impact" element={<Impact />} />
                      <Route path="/climate-impact-pack" element={<ClimateImpactPack />} />
                      <Route path="/single-tree-pack" element={<SingleTreePack />} />
                      <Route path="/green-quiz" element={<GreenQuiz />} />
                      <Route path="/track-request" element={<TrackRequest />} />
                      <Route path="/track-request/:trackingId" element={<TrackRequest />} />
                      <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                      <Route path="/schools" element={<SchoolProgram />} />
                      <Route path="/bulk-plantation" element={<BulkPlantation />} />
                      <Route path="/days" element={<SustainabilityDaysIndex />} />
                      <Route path="/days/:slug" element={<SustainabilityDay />} />
                      <Route path="/plant-trees-in/:city" element={<PlantTreesInCity />} />
                      <Route path="/trees/:slug" element={<TreeSpeciesPage />} />
                      <Route path="/plant-trees-for/:slug" element={<PlantTreesForUseCase />} />
                      <Route path="/monsoon-plantation-himachal" element={<MonsoonPlantationHimachal />} />
                      <Route path="/learn" element={<Learn />} />
                      <Route path="/learn/lessons" element={<LearnLessons />} />
                      <Route path="/learn/lessons/:slug" element={<LearnLessonDetail />} />
                      <Route path="/learn/daily" element={<LearnDaily />} />
                      <Route path="/learn/videos" element={<LearnVideos />} />
                      <Route path="/learn/why-trees-matter" element={<LearnWhyTreesMatter />} />
                     <Route path="/learn/how-we-plant" element={<LearnHowWePlant />} />
                     <Route path="/learn/himachal-jungles" element={<LearnHimachalJungles />} />
                     <Route path="/learn/forest-fires" element={<LearnForestFires />} />

                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </AnalyticsWrapper>
              </BrowserRouter>
            </TooltipProvider>
          </MarketplaceCartProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
