import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, TreePine, TrendingUp, Loader2, Settings, FileText, Image, Quote, Activity, Handshake, Store, Globe, BarChart3, Heart, Flower2, Gift, MessageSquare, Menu, Link2, Info, MapPin, Building2, Sprout, Gauge, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlantsTab } from "@/components/admin/PlantsTab";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { TreesTab } from "@/components/admin/TreesTab";
import { ScrapRequestsTab } from "@/components/admin/ScrapRequestsTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { CorporateTab } from "@/components/admin/CorporateTab";
import { BlogTab } from "@/components/admin/BlogTab";
import { ActivityPhotosTab } from "@/components/admin/ActivityPhotosTab";
import { TestimonialsTab } from "@/components/admin/TestimonialsTab";
import { ActivitiesTab } from "@/components/admin/ActivitiesTab";
import { PartnerTypesTab } from "@/components/admin/PartnerTypesTab";
import { SellersTab } from "@/components/admin/SellersTab";
import { MarketplaceProductsTab } from "@/components/admin/MarketplaceProductsTab";
import { MarketplaceOrdersTab } from "@/components/admin/MarketplaceOrdersTab";
import { ExternalAppsTab } from "@/components/admin/ExternalAppsTab";
import { RequestsTab } from "@/components/admin/RequestsTab";
import { LiveStatsTab } from "@/components/admin/LiveStatsTab";
import { CampaignsTab } from "@/components/admin/CampaignsTab";
import { DonationsTab } from "@/components/admin/DonationsTab";
import { GiftCardsTab } from "@/components/admin/GiftCardsTab";
import { GiftCardContentTab } from "@/components/admin/GiftCardContentTab";
import { ContactMessagesTab } from "@/components/admin/ContactMessagesTab";
import { NavigationTab } from "@/components/admin/NavigationTab";
import { FooterLinksTab } from "@/components/admin/FooterLinksTab";
import { AboutPageTab } from "@/components/admin/AboutPageTab";
import { VillagesTab } from "@/components/admin/VillagesTab";
import { CSRPartnersTab } from "@/components/admin/CSRPartnersTab";
import { NurseriesTab } from "@/components/admin/NurseriesTab";
import CarbonSettingsTab from "@/components/admin/CarbonSettingsTab";
import FarmerRegistrationsTab from "@/components/admin/FarmerRegistrationsTab";
import { LandPartnersTab } from "@/components/admin/LandPartnersTab";
import { AllocationsTab } from "@/components/admin/AllocationsTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { ScrapTypesTab } from "@/components/admin/ScrapTypesTab";

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const currentTab = searchParams.get('tab') || 'requests';
  const handleTabChange = (value: string) => setSearchParams({ tab: value });

  // Lazy stats — only fetches counts, not full rows
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [reqRes, profileRes, orderRes] = await Promise.all([
        supabase.from("tree_plantation_requests").select("id, quantity, status", { count: "exact", head: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
      ]);
      const requests = reqRes.data || [];
      return {
        totalRequests: reqRes.count || 0,
        totalUsers: profileRes.count || 0,
        totalTrees: requests.reduce((sum: number, r: any) => sum + (r.quantity || 0), 0),
        pendingRequests: requests.filter((r: any) => r.status === 'pending').length,
      };
    },
    enabled: !!isAdmin,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({ title: "Access Denied", description: "You don't have permission.", variant: "destructive" });
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  if (adminLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h1 className="text-2xl md:text-4xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">Manage platform operations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[
              { label: "Total Requests", value: stats?.totalRequests ?? "—", icon: TreePine, color: "text-primary" },
              { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-secondary" },
              { label: "Total Trees", value: stats?.totalTrees ?? "—", icon: TrendingUp, color: "text-accent-foreground" },
              { label: "Pending", value: stats?.pendingRequests ?? "—", icon: TreePine, color: "text-primary" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
                    </div>
                    <s.icon className={`h-6 w-6 md:h-8 md:w-8 ${s.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="w-max md:w-auto">
                <TabsTrigger value="requests" className="text-xs md:text-sm">Plantation</TabsTrigger>
                <TabsTrigger value="scrap" className="text-xs md:text-sm">Scrap</TabsTrigger>
                <TabsTrigger value="orders" className="text-xs md:text-sm">Orders</TabsTrigger>
                <TabsTrigger value="trees" className="text-xs md:text-sm">Trees</TabsTrigger>
                <TabsTrigger value="plants" className="text-xs md:text-sm"><Flower2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />Plants</TabsTrigger>
                <TabsTrigger value="blog" className="text-xs md:text-sm"><FileText className="h-3 w-3 md:h-4 md:w-4 mr-1" />Blog</TabsTrigger>
                <TabsTrigger value="photos" className="text-xs md:text-sm"><Image className="h-3 w-3 md:h-4 md:w-4 mr-1" />Photos</TabsTrigger>
                <TabsTrigger value="testimonials" className="text-xs md:text-sm"><Quote className="h-3 w-3 md:h-4 md:w-4 mr-1" />Reviews</TabsTrigger>
                <TabsTrigger value="activities" className="text-xs md:text-sm"><Activity className="h-3 w-3 md:h-4 md:w-4 mr-1" />Activities</TabsTrigger>
                <TabsTrigger value="live-stats" className="text-xs md:text-sm"><BarChart3 className="h-3 w-3 md:h-4 md:w-4 mr-1" />Stats</TabsTrigger>
                <TabsTrigger value="partners" className="text-xs md:text-sm"><Handshake className="h-3 w-3 md:h-4 md:w-4 mr-1" />Partners</TabsTrigger>
                <TabsTrigger value="campaigns" className="text-xs md:text-sm"><Heart className="h-3 w-3 md:h-4 md:w-4 mr-1" />Campaigns</TabsTrigger>
                <TabsTrigger value="donations" className="text-xs md:text-sm">Donations</TabsTrigger>
                <TabsTrigger value="gift-cards" className="text-xs md:text-sm"><Gift className="h-3 w-3 md:h-4 md:w-4 mr-1" />Gift Cards</TabsTrigger>
                <TabsTrigger value="gift-card-content" className="text-xs md:text-sm">GC Content</TabsTrigger>
                <TabsTrigger value="users" className="text-xs md:text-sm">Users</TabsTrigger>
                <TabsTrigger value="corporate" className="text-xs md:text-sm">Corporate</TabsTrigger>
                <TabsTrigger value="marketplace" className="text-xs md:text-sm"><Store className="h-3 w-3 md:h-4 md:w-4 mr-1" />Marketplace</TabsTrigger>
                <TabsTrigger value="external-apps" className="text-xs md:text-sm"><Globe className="h-3 w-3 md:h-4 md:w-4 mr-1" />Apps</TabsTrigger>
                <TabsTrigger value="messages" className="text-xs md:text-sm"><MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />Messages</TabsTrigger>
                <TabsTrigger value="navigation" className="text-xs md:text-sm"><Menu className="h-3 w-3 md:h-4 md:w-4 mr-1" />Navbar</TabsTrigger>
                <TabsTrigger value="footer" className="text-xs md:text-sm"><Link2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />Footer</TabsTrigger>
                <TabsTrigger value="about-page" className="text-xs md:text-sm"><Info className="h-3 w-3 md:h-4 md:w-4 mr-1" />About</TabsTrigger>
                <TabsTrigger value="villages" className="text-xs md:text-sm"><MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />Villages</TabsTrigger>
                <TabsTrigger value="csr-partners" className="text-xs md:text-sm"><Building2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />CSR</TabsTrigger>
                <TabsTrigger value="nurseries" className="text-xs md:text-sm"><Flower2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />Nurseries</TabsTrigger>
                <TabsTrigger value="carbon" className="text-xs md:text-sm"><Gauge className="h-3 w-3 md:h-4 md:w-4 mr-1" />Carbon</TabsTrigger>
                <TabsTrigger value="farmers" className="text-xs md:text-sm"><Sprout className="h-3 w-3 md:h-4 md:w-4 mr-1" />Farmers</TabsTrigger>
                <TabsTrigger value="land-partners" className="text-xs md:text-sm"><ShieldCheck className="h-3 w-3 md:h-4 md:w-4 mr-1" />Land Partners</TabsTrigger>
                <TabsTrigger value="allocations" className="text-xs md:text-sm"><TreePine className="h-3 w-3 md:h-4 md:w-4 mr-1" />Allocations</TabsTrigger>
                <TabsTrigger value="scrap-types" className="text-xs md:text-sm"><IndianRupee className="h-3 w-3 md:h-4 md:w-4 mr-1" />Scrap Rates</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs md:text-sm"><Settings className="h-3 w-3 md:h-4 md:w-4 mr-1" />Settings</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="campaigns"><CampaignsTab /></TabsContent>
            <TabsContent value="donations"><DonationsTab /></TabsContent>
            <TabsContent value="gift-cards"><GiftCardsTab /></TabsContent>
            <TabsContent value="gift-card-content"><GiftCardContentTab /></TabsContent>
            <TabsContent value="requests"><RequestsTab /></TabsContent>
            <TabsContent value="scrap"><ScrapRequestsTab /></TabsContent>
            <TabsContent value="orders"><OrdersTab /></TabsContent>
            <TabsContent value="trees"><TreesTab /></TabsContent>
            <TabsContent value="plants"><PlantsTab /></TabsContent>
            <TabsContent value="blog"><BlogTab /></TabsContent>
            <TabsContent value="photos"><ActivityPhotosTab /></TabsContent>
            <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
            <TabsContent value="activities"><ActivitiesTab /></TabsContent>
            <TabsContent value="live-stats"><LiveStatsTab /></TabsContent>
            <TabsContent value="partners"><PartnerTypesTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="corporate"><CorporateTab /></TabsContent>
            <TabsContent value="marketplace">
              <div className="space-y-8">
                <SellersTab />
                <MarketplaceProductsTab />
                <MarketplaceOrdersTab />
              </div>
            </TabsContent>
            <TabsContent value="external-apps">
              <Card><CardContent className="p-6"><ExternalAppsTab /></CardContent></Card>
            </TabsContent>
            <TabsContent value="messages"><ContactMessagesTab /></TabsContent>
            <TabsContent value="navigation"><NavigationTab /></TabsContent>
            <TabsContent value="footer"><FooterLinksTab /></TabsContent>
            <TabsContent value="about-page"><AboutPageTab /></TabsContent>
            <TabsContent value="villages"><VillagesTab /></TabsContent>
            <TabsContent value="csr-partners"><CSRPartnersTab /></TabsContent>
            <TabsContent value="nurseries"><NurseriesTab /></TabsContent>
            <TabsContent value="carbon"><CarbonSettingsTab /></TabsContent>
            <TabsContent value="farmers"><FarmerRegistrationsTab /></TabsContent>
            <TabsContent value="land-partners"><LandPartnersTab /></TabsContent>
            <TabsContent value="allocations"><AllocationsTab /></TabsContent>
            <TabsContent value="scrap-types"><ScrapTypesTab /></TabsContent>
            <TabsContent value="settings"><SettingsTab /></TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
