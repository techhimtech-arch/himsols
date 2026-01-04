import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { MarketplaceCartProvider } from "@/hooks/useMarketplaceCart";
import { LanguageProvider } from "@/hooks/useLanguage";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useAnalytics } from "@/hooks/useAnalytics";
import Index from "./pages/Index";
import Services from "./pages/Services";
import TreePlantation from "./pages/TreePlantation";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Shop from "./pages/Shop";
import Gallery from "./pages/Gallery";
import OrderHistory from "./pages/OrderHistory";
import Cart from "./pages/Cart";
import WasteManagement from "./pages/WasteManagement";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import B2BCorporate from "./pages/B2BCorporate";
import Marketplace from "./pages/Marketplace";
import MarketplaceProduct from "./pages/MarketplaceProduct";
import MarketplaceCheckout from "./pages/MarketplaceCheckout";

const queryClient = new QueryClient();

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
              <WhatsAppButton />
              <BrowserRouter>
                <AnalyticsWrapper>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/tree-plantation" element={<TreePlantation />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/marketplace/:id" element={<MarketplaceProduct />} />
                    <Route path="/marketplace/checkout" element={<MarketplaceCheckout />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/order-history" element={<OrderHistory />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/waste-management" element={<WasteManagement />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/corporate" element={<B2BCorporate />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
