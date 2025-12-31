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
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, TreePine, TrendingUp, Loader2, Package, Settings, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { TreesTab } from "@/components/admin/TreesTab";
import { ScrapRequestsTab } from "@/components/admin/ScrapRequestsTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { CorporateTab } from "@/components/admin/CorporateTab";
import { BlogTab } from "@/components/admin/BlogTab";
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

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [scrapRequests, setScrapRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalUsers: 0,
    totalTrees: 0,
    pendingRequests: 0,
    scrapRequests: 0,
  });

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

      // Load scrap requests
      const { data: scrapData, error: scrapError } = await supabase
        .from("waste_management_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (scrapError) throw scrapError;

      setRequests(requestsData || []);
      setScrapRequests(scrapData || []);
      setProfiles(profilesData || []);
      setUserRoles(rolesData || []);
      setOrders(ordersData || []);
      setTrees(treesData || []);

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
      const { error } = await supabase.from("trees").insert(treeData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tree added successfully.",
      });

      loadData();
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

      toast({
        title: "Success",
        description: "Tree updated successfully.",
      });

      loadData();
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

      toast({
        title: "Success",
        description: "Tree deleted successfully.",
      });

      loadData();
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
          <Tabs defaultValue="requests" className="space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="w-max md:w-auto">
                <TabsTrigger value="requests" className="text-xs md:text-sm">Plantation</TabsTrigger>
                <TabsTrigger value="scrap" className="text-xs md:text-sm">Scrap</TabsTrigger>
                <TabsTrigger value="orders" className="text-xs md:text-sm">Orders</TabsTrigger>
                <TabsTrigger value="trees" className="text-xs md:text-sm">Trees</TabsTrigger>
                <TabsTrigger value="blog" className="text-xs md:text-sm">
                  <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Blog
                </TabsTrigger>
                <TabsTrigger value="users" className="text-xs md:text-sm">Users</TabsTrigger>
                <TabsTrigger value="corporate" className="text-xs md:text-sm">Corporate</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs md:text-sm">
                  <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Requests Tab */}
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Tree Plantation Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mobile View */}
                  <div className="block md:hidden space-y-4">
                    {requests.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No requests found</p>
                    ) : (
                      requests.map((request) => (
                        <MobileCard key={request.id}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-sm">{request.tracking_id}</span>
                            <StatusBadge status={request.status} />
                          </div>
                          <MobileCardRow label="Name" value={request.name} />
                          <MobileCardRow label="Location" value={request.location} />
                          <MobileCardRow label="Tree Type" value={request.tree_type} />
                          <MobileCardRow label="Quantity" value={request.quantity} />
                          <MobileCardRow label="Date" value={new Date(request.created_at).toLocaleDateString()} />
                          <div className="pt-2 border-t border-border">
                            <Select
                              value={request.status}
                              onValueChange={(value) => updateRequestStatus(request.id, value)}
                            >
                              <SelectTrigger className="w-full bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border border-border z-50">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="site_verified">Site Verified</SelectItem>
                                <SelectItem value="saplings_arranged">Saplings Arranged</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                          <TableHead>Tracking ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Tree Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.tracking_id}</TableCell>
                            <TableCell>{request.name}</TableCell>
                            <TableCell>{request.location}</TableCell>
                            <TableCell>{request.tree_type}</TableCell>
                            <TableCell>{request.quantity}</TableCell>
                            <TableCell>
                              <StatusBadge status={request.status} />
                            </TableCell>
                            <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Select
                                value={request.status}
                                onValueChange={(value) => updateRequestStatus(request.id, value)}
                              >
                                <SelectTrigger className="w-[150px] bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border border-border z-50">
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="site_verified">Site Verified</SelectItem>
                                  <SelectItem value="saplings_arranged">Saplings Arranged</SelectItem>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
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
              <OrdersTab orders={orders} onUpdateStatus={updateOrderStatus} />
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

            {/* Blog Tab */}
            <TabsContent value="blog">
              <BlogTab />
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
