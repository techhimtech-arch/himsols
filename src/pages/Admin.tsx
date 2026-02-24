import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, TreePine, TrendingUp, Loader2, Package, Settings, FileText, Image, Quote, Activity, Handshake, Store, Globe, BarChart3, Heart, Flower2, Gift, MessageSquare, Menu, Link2, Wallet, Info, MapPin, Building2, Sprout, Gauge } from "lucide-react";
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
import { INDIAN_STATES, getDistrictsForState, IndianState } from "@/lib/constants";
import { MobileCard, MobileCardRow, StatusBadge } from "@/components/admin/MobileCard";

interface Request {
  id: string;
  tracking_id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  tree_type: string;
  quantity: number;
  status: string;
  created_at: string;
  message: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
  state: string | null;
  district: string | null;
}

interface UserWallet {
  user_id: string;
  balance: number;
}

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [scrapRequests, setScrapRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userWallets, setUserWallets] = useState<UserWallet[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [trees, setTrees] = useState<any[]>([]);
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalUsers: 0,
    totalTrees: 0,
    pendingRequests: 0,
    scrapRequests: 0,
  });

  // Get current tab from URL or default to 'requests'
  const currentTab = searchParams.get('tab') || 'requests';
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("tree_plantation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      // Load all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Load user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Load trees
      const { data: treesData, error: treesError } = await supabase
        .from("trees")
        .select("*")
        .order("name");

      if (treesError) throw treesError;

      // Load plants
      const { data: plantsData, error: plantsError } = await supabase
        .from("plants")
        .select("*")
        .order("name");

      if (plantsError) throw plantsError;

      // Load scrap requests
      const { data: scrapData, error: scrapError } = await supabase
        .from("waste_management_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (scrapError) throw scrapError;

      // Load user wallets
      const { data: walletsData, error: walletsError } = await supabase
        .from("wallets")
        .select("user_id, balance");

      if (walletsError) throw walletsError;

      setRequests(requestsData || []);
      setScrapRequests(scrapData || []);
      setProfiles(profilesData || []);
      setUserRoles(rolesData || []);
      setUserWallets(walletsData || []);
      setOrders(ordersData || []);
      setTrees(treesData || []);
      setPlants(plantsData || []);

      // Calculate stats
      const totalTrees = requestsData?.reduce((sum, req) => sum + req.quantity, 0) || 0;
      const pendingCount = requestsData?.filter(req => req.status === 'pending').length || 0;

      setStats({
        totalRequests: requestsData?.length || 0,
        totalUsers: profilesData?.length || 0,
        totalTrees,
        pendingRequests: pendingCount,
        scrapRequests: scrapData?.length || 0,
      });
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserWalletBalance = (userId: string): number => {
    const wallet = userWallets.find(w => w.user_id === userId);
    return wallet?.balance || 0;
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tree_plantation_requests")
        .update({ status: newStatus as any })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request status updated successfully.",
      });

      loadData();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update request status.",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string, newDistrict: string | null = null) => {
    try {
      const existingRole = userRoles.find(r => r.user_id === userId);
      const districtToSet = newDistrict !== undefined ? newDistrict : existingRole?.district || null;
      
      // Delete existing role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Insert new role with district
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole as any, district: districtToSet });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully.",
      });

      loadData();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const updateUserDistrict = async (userId: string, newDistrict: string | null) => {
    try {
      const currentRole = getUserRole(userId);
      
      // Delete existing role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Insert with new district
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: currentRole as any, district: newDistrict });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User district updated successfully.",
      });

      loadData();
    } catch (error: any) {
      console.error("Error updating district:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user district.",
        variant: "destructive",
      });
    }
  };

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  const getUserDistrict = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.district || null;
  };

  const getUserState = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.state || null;
  };

  const updateUserState = async (userId: string, newState: string | null) => {
    try {
      const currentRole = getUserRole(userId);
      const currentDistrict = getUserDistrict(userId);
      
      // Delete existing role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Insert with new state
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: currentRole as any, state: newState, district: currentDistrict });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User state updated successfully.",
      });

      loadData();
    } catch (error: any) {
      console.error("Error updating state:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user state.",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });

      loadData();
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const addTree = async (treeData: any) => {
    try {
      const { data, error } = await supabase.from("trees").insert(treeData).select().single();

      if (error) throw error;

      // Optimistic update - add to local state
      setTrees(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));

      toast({
        title: "Success",
        description: "Tree added successfully.",
      });
    } catch (error: any) {
      console.error("Error adding tree:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add tree.",
        variant: "destructive",
      });
    }
  };

  const updateTree = async (treeId: string, treeData: any) => {
    try {
      const { error } = await supabase
        .from("trees")
        .update(treeData)
        .eq("id", treeId);

      if (error) throw error;

      // Optimistic update - update local state
      setTrees(prev => prev.map(tree => 
        tree.id === treeId ? { ...tree, ...treeData } : tree
      ));

      toast({
        title: "Success",
        description: "Tree updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating tree:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update tree.",
        variant: "destructive",
      });
    }
  };

  const deleteTree = async (treeId: string) => {
    if (!confirm("Are you sure you want to delete this tree?")) return;

    try {
      const { error } = await supabase
        .from("trees")
        .delete()
        .eq("id", treeId);

      if (error) throw error;

      // Optimistic update - remove from local state
      setTrees(prev => prev.filter(tree => tree.id !== treeId));

      toast({
        title: "Success",
        description: "Tree deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting tree:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete tree.",
        variant: "destructive",
      });
    }
  };

  const bulkUploadTrees = async (treesData: any[]) => {
    try {
      const { error } = await supabase.from("trees").insert(treesData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${treesData.length} trees added successfully.`,
      });

      loadData();
    } catch (error: any) {
      console.error("Error bulk uploading trees:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload trees.",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

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
            <p className="text-sm md:text-base text-muted-foreground">
              Manage tree plantation requests and users
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.totalRequests}</p>
                  </div>
                  <TreePine className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Trees</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.totalTrees}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-accent-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.pendingRequests}</p>
                  </div>
                  <TreePine className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="w-max md:w-auto">
                <TabsTrigger value="requests" className="text-xs md:text-sm">Plantation</TabsTrigger>
                <TabsTrigger value="scrap" className="text-xs md:text-sm">Scrap</TabsTrigger>
                <TabsTrigger value="orders" className="text-xs md:text-sm">Orders</TabsTrigger>
                <TabsTrigger value="trees" className="text-xs md:text-sm">Trees</TabsTrigger>
                <TabsTrigger value="plants" className="text-xs md:text-sm">
                  <Flower2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Plants
                </TabsTrigger>
                <TabsTrigger value="blog" className="text-xs md:text-sm">
                  <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Blog
                </TabsTrigger>
                <TabsTrigger value="photos" className="text-xs md:text-sm">
                  <Image className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Photos
                </TabsTrigger>
                <TabsTrigger value="testimonials" className="text-xs md:text-sm">
                  <Quote className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="activities" className="text-xs md:text-sm">
                  <Activity className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Activities
                </TabsTrigger>
                <TabsTrigger value="live-stats" className="text-xs md:text-sm">
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Stats
                </TabsTrigger>
                <TabsTrigger value="partners" className="text-xs md:text-sm">
                  <Handshake className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Partners
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="text-xs md:text-sm">
                  <Heart className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Campaigns
                </TabsTrigger>
                <TabsTrigger value="donations" className="text-xs md:text-sm">Donations</TabsTrigger>
                <TabsTrigger value="gift-cards" className="text-xs md:text-sm">
                  <Gift className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Gift Cards
                </TabsTrigger>
                <TabsTrigger value="gift-card-content" className="text-xs md:text-sm">
                  GC Content
                </TabsTrigger>
                <TabsTrigger value="users" className="text-xs md:text-sm">Users</TabsTrigger>
                <TabsTrigger value="corporate" className="text-xs md:text-sm">Corporate</TabsTrigger>
                <TabsTrigger value="marketplace" className="text-xs md:text-sm">
                  <Store className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="external-apps" className="text-xs md:text-sm">
                  <Globe className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Apps
                </TabsTrigger>
                <TabsTrigger value="messages" className="text-xs md:text-sm">
                  <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="navigation" className="text-xs md:text-sm">
                  <Menu className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Navbar
                </TabsTrigger>
                <TabsTrigger value="footer" className="text-xs md:text-sm">
                  <Link2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Footer
                </TabsTrigger>
                <TabsTrigger value="about-page" className="text-xs md:text-sm">
                  <Info className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  About
                </TabsTrigger>
                <TabsTrigger value="villages" className="text-xs md:text-sm">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Villages
                </TabsTrigger>
                <TabsTrigger value="csr-partners" className="text-xs md:text-sm">
                  <Building2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  CSR
                </TabsTrigger>
                <TabsTrigger value="nurseries" className="text-xs md:text-sm">
                  <Flower2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Nurseries
                </TabsTrigger>
                <TabsTrigger value="carbon" className="text-xs md:text-sm">
                  <Gauge className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Carbon
                </TabsTrigger>
                <TabsTrigger value="farmers" className="text-xs md:text-sm">
                  <Sprout className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Farmers
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs md:text-sm">
                  <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns">
              <CampaignsTab />
            </TabsContent>

            {/* Donations Tab */}
            <TabsContent value="donations">
              <DonationsTab />
            </TabsContent>

            {/* Gift Cards Tab */}
            <TabsContent value="gift-cards">
              <GiftCardsTab />
            </TabsContent>

            {/* Gift Card Page Content Tab */}
            <TabsContent value="gift-card-content">
              <GiftCardContentTab />
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests">
              <RequestsTab 
                requests={requests} 
                onUpdateStatus={updateRequestStatus} 
              />
            </TabsContent>

            {/* Scrap Requests Tab */}
            <TabsContent value="scrap">
              <ScrapRequestsTab 
                requests={scrapRequests} 
                onUpdateStatus={async (requestId, newStatus) => {
                  try {
                    const { error } = await supabase
                      .from("waste_management_requests")
                      .update({ status: newStatus as any })
                      .eq("id", requestId);

                    if (error) throw error;

                    toast({
                      title: "Success",
                      description: "Scrap request status updated successfully.",
                    });

                    loadData();
                  } catch (error: any) {
                    console.error("Error updating scrap request status:", error);
                    toast({
                      title: "Error",
                      description: error.message || "Failed to update scrap request status.",
                      variant: "destructive",
                    });
                  }
                }} 
              />
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <OrdersTab orders={orders} profiles={profiles} trees={trees} onUpdateStatus={updateOrderStatus} />
            </TabsContent>

            {/* Trees Tab */}
            <TabsContent value="trees">
              <TreesTab
                trees={trees}
                onAddTree={addTree}
                onUpdateTree={updateTree}
                onDeleteTree={deleteTree}
                onBulkUpload={bulkUploadTrees}
              />
            </TabsContent>

            {/* Plants Tab */}
            <TabsContent value="plants">
              <PlantsTab plants={plants} setPlants={setPlants} />
            </TabsContent>

            {/* Blog Tab */}
            <TabsContent value="blog">
              <BlogTab />
            </TabsContent>

            {/* Activity Photos Tab */}
            <TabsContent value="photos">
              <ActivityPhotosTab />
            </TabsContent>

            {/* Testimonials Tab */}
            <TabsContent value="testimonials">
              <TestimonialsTab />
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities">
              <ActivitiesTab />
            </TabsContent>

            {/* Live Stats Tab */}
            <TabsContent value="live-stats">
              <LiveStatsTab />
            </TabsContent>

            {/* Partner Types Tab */}
            <TabsContent value="partners">
              <PartnerTypesTab />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mobile View */}
                  <div className="block md:hidden space-y-4">
                    {profiles.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No users found</p>
                    ) : (
                      profiles.map((profile) => (
                        <MobileCard key={profile.id}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-sm">{profile.full_name}</span>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              getUserRole(profile.id) === 'admin' 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {getUserRole(profile.id)}
                            </span>
                          </div>
                          <MobileCardRow label="Email" value={<span className="text-xs break-all">{profile.email}</span>} />
                          <MobileCardRow label="Phone" value={profile.phone || '-'} />
                          <MobileCardRow 
                            label="Wallet" 
                            value={
                              <span className="inline-flex items-center gap-1 text-primary font-medium">
                                <Wallet className="h-3 w-3" />
                                ₹{getUserWalletBalance(profile.id).toLocaleString('en-IN')}
                              </span>
                            } 
                          />
                          <MobileCardRow label="Joined" value={new Date(profile.created_at).toLocaleDateString()} />
                          <div className="pt-3 border-t border-border space-y-2">
                            <Select
                              value={getUserRole(profile.id)}
                              onValueChange={(value) => updateUserRole(profile.id, value)}
                            >
                              <SelectTrigger className="w-full bg-background">
                                <SelectValue placeholder="Select Role" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border border-border z-50">
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              value={getUserState(profile.id) || "himachal"}
                              onValueChange={(value) => updateUserState(profile.id, value === "himachal" ? "Himachal Pradesh" : value)}
                            >
                              <SelectTrigger className="w-full bg-background">
                                <SelectValue placeholder="Select State" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border border-border z-50">
                                {INDIAN_STATES.map((state) => (
                                  <SelectItem key={state} value={state === "Himachal Pradesh" ? "himachal" : state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={getUserDistrict(profile.id) || "all"}
                              onValueChange={(value) => updateUserDistrict(profile.id, value === "all" ? null : value)}
                            >
                              <SelectTrigger className="w-full bg-background">
                                <SelectValue placeholder="All Districts" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border border-border z-50">
                                <SelectItem value="all">All Districts</SelectItem>
                                {getDistrictsForState((getUserState(profile.id) as IndianState) || "Himachal Pradesh").map((district) => (
                                  <SelectItem key={district} value={district}>
                                    {district}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </MobileCard>
                      ))
                    )}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Wallet Balance</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>District</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.full_name}</TableCell>
                            <TableCell>{profile.email}</TableCell>
                            <TableCell>{profile.phone || '-'}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 text-primary font-medium">
                                <Wallet className="h-4 w-4" />
                                ₹{getUserWalletBalance(profile.id).toLocaleString('en-IN')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={getUserRole(profile.id)}
                                onValueChange={(value) => updateUserRole(profile.id, value)}
                              >
                                <SelectTrigger className="w-[100px] bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border border-border z-50">
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={getUserState(profile.id) || "himachal"}
                                onValueChange={(value) => updateUserState(profile.id, value === "himachal" ? "Himachal Pradesh" : value)}
                              >
                                <SelectTrigger className="w-[130px] bg-background">
                                  <SelectValue placeholder="Select State" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border border-border z-50">
                                  {INDIAN_STATES.map((state) => (
                                    <SelectItem key={state} value={state === "Himachal Pradesh" ? "himachal" : state}>
                                      {state}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={getUserDistrict(profile.id) || "all"}
                                onValueChange={(value) => updateUserDistrict(profile.id, value === "all" ? null : value)}
                              >
                                <SelectTrigger className="w-[130px] bg-background">
                                  <SelectValue placeholder="All Districts" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border border-border z-50">
                                  <SelectItem value="all">All Districts</SelectItem>
                                  {getDistrictsForState((getUserState(profile.id) as IndianState) || "Himachal Pradesh").map((district) => (
                                    <SelectItem key={district} value={district}>
                                      {district}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Corporate Tab */}
            <TabsContent value="corporate">
              <CorporateTab />
            </TabsContent>

            {/* Marketplace Tab */}
            <TabsContent value="marketplace">
              <div className="space-y-8">
                <SellersTab />
                <MarketplaceProductsTab />
                <MarketplaceOrdersTab />
              </div>
            </TabsContent>

            {/* External Apps Tab */}
            <TabsContent value="external-apps">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">External Himsols Apps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExternalAppsTab />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Messages Tab */}
            <TabsContent value="messages">
              <ContactMessagesTab />
            </TabsContent>

            {/* Navigation Tab */}
            <TabsContent value="navigation">
              <NavigationTab />
            </TabsContent>

            {/* Footer Links Tab */}
            <TabsContent value="footer">
              <FooterLinksTab />
            </TabsContent>

            {/* About Page Tab */}
            <TabsContent value="about-page">
              <AboutPageTab />
            </TabsContent>

            {/* Villages Tab */}
            <TabsContent value="villages">
              <VillagesTab />
            </TabsContent>

            {/* CSR Partners Tab */}
            <TabsContent value="csr-partners">
              <CSRPartnersTab />
            </TabsContent>

            {/* Nurseries Tab */}
            <TabsContent value="nurseries">
              <NurseriesTab />
            </TabsContent>

            {/* Carbon Settings Tab */}
            <TabsContent value="carbon">
              <CarbonSettingsTab />
            </TabsContent>

            {/* Farmer Registrations Tab */}
            <TabsContent value="farmers">
              <FarmerRegistrationsTab />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
