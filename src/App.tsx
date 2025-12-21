import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { LanguageProvider } from "@/hooks/useLanguage";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import Index from "./pages/Index";
import Services from "./pages/Services";
import TreePlantation from "./pages/TreePlantation";

import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Shop from "./pages/Shop";
import Gallery from "./pages/Gallery";
import OrderHistory from "./pages/OrderHistory";
import Cart from "./pages/Cart";
import WasteManagement from "./pages/WasteManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <WhatsAppButton />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/tree-plantation" element={<TreePlantation />} />
                
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/waste-management" element={<WasteManagement />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
