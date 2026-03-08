import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { TreePine, ArrowRight, Wallet, Download, Loader2, MapPin, Sprout, Activity } from "lucide-react";
import { CO2ImpactCard } from "@/components/contributions/CO2ImpactCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard } from "@/components/admin/MobileCard";

interface OrderWithAllocation {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  delivery_location: string;
  tree_allocations: {
    id: string;
    tree_count: number;
    species: string;
    plantation_date: string;
    status: string;
    partner_id: string;
    batch_id: string | null;
    trees_alive: number | null;
    trees_dead: number | null;
    review_date: string | null;
    payout_status: string;
  }[] | null;
}

interface SurvivalUpdate {
  id: string;
  health_status: string;
  height_cm: number | null;
  photo_url: string | null;
  update_date: string;
  notes: string | null;
  order_id: string;
}

const MyContributions = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch orders with linked allocations
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders-with-allocations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("orders")
        .select(`id, quantity, total_price, status, created_at, delivery_location, tree_allocations(id, tree_count, species, plantation_date, status, partner_id, batch_id, trees_alive, trees_dead, review_date, payout_status)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as OrderWithAllocation[];
    },
    enabled: !!user,
  });

  // Fetch survival updates for user's orders
  const { data: survivalUpdates = [] } = useQuery({
    queryKey: ["my-survival-updates", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("survival_updates")
        .select("*")
        .order("update_date", { ascending: false });
      if (error) throw error;
      return (data || []) as SurvivalUpdate[];
    },
    enabled: !!user,
  });

  // Fetch donations too
  const { data: donations = [] } = useQuery({
    queryKey: ["my-donations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("donations")
        .select("id, amount, payment_status, created_at, campaigns(id, title, price_per_tree)")
        .eq("user_id", user.id)
        .eq("payment_status", "SUCCESS")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleDownloadCertificate = async (donationId: string) => {
    setDownloadingId(donationId);
    try {
      const response = await supabase.functions.invoke("generate-donation-certificate", {
        body: { donationId },
      });
      if (response.error) throw new Error(response.error.message);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HIMSOLS-Certificate.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Certificate Downloaded! 🎉" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  const totalTreesOrdered = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalAllocated = orders.reduce((sum, o) => sum + (o.tree_allocations?.reduce((s, a) => s + a.tree_count, 0) || 0), 0);
  const totalTreesAlive = orders.reduce((sum, o) => sum + (o.tree_allocations?.reduce((s, a) => s + (a.trees_alive ?? a.tree_count), 0) || 0), 0);
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_price), 0) + 
    donations.reduce((sum: number, d: any) => sum + Number(d.amount), 0);
  const healthyUpdates = survivalUpdates.filter(s => s.health_status === "healthy").length;
  const totalUpdates = survivalUpdates.length;
  const survivalRate = totalAllocated > 0 ? Math.round((totalTreesAlive / totalAllocated) * 100) : (totalUpdates > 0 ? Math.round((healthyUpdates / totalUpdates) * 100) : 0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 py-16 text-center">
          <TreePine className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Login Required</h1>
          <p className="text-muted-foreground mb-6">Login to view your climate impact dashboard.</p>
          <Button onClick={() => navigate("/auth")}>Login Now</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isLoading = ordersLoading;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Impact Dashboard | Himsols" description="Track your tree sponsorships, allocations, and survival updates." />
      <Navbar />
      
      <main className="pt-20 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Impact Dashboard</h1>
            <p className="text-muted-foreground">Track your climate contributions end-to-end</p>
          </div>
          <Button onClick={() => navigate("/climate-impact-pack")}>
            Sponsor More Trees <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">₹{totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Invested</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TreePine className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{totalTreesOrdered}</p>
                  <p className="text-xs text-muted-foreground">Trees Sponsored</p>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Sprout className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{totalTreesAlive}</p>
                  <p className="text-xs text-muted-foreground">Trees Alive</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{survivalRate}%</p>
                  <p className="text-xs text-muted-foreground">Survival Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CloudRain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{Math.round(totalTreesAlive * (survivalRate / 100) * 22)} kg</p>
                  <p className="text-xs text-muted-foreground">CO₂ Offset/yr</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders & Allocations Pipeline */}
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
        ) : orders.length === 0 && donations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TreePine className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Contributions Yet</h2>
              <p className="text-muted-foreground mb-4">Sponsor your first Climate Impact Pack to start building your impact.</p>
              <Button onClick={() => navigate("/climate-impact-pack")}>Get Climate Impact Pack</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Tree Orders with Allocation Status */}
            {orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tree Sponsorship Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {isMobile ? (
                    <div className="space-y-3">
                      {orders.map(order => {
                        const alloc = order.tree_allocations?.[0];
                        return (
                          <MobileCard key={order.id}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{order.quantity} Trees · ₹{Number(order.total_price).toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), "dd MMM yyyy")}</p>
                              </div>
                              <Badge variant={order.status === "completed" ? "default" : "secondary"} className="text-xs capitalize">
                                {order.status}
                              </Badge>
                            </div>
                            {alloc ? (
                              <div className="text-xs space-y-1 p-2 rounded bg-muted/50">
                                <p><Sprout className="h-3 w-3 inline mr-1" />{alloc.tree_count} × {alloc.species}</p>
                                <p>Plantation: {format(new Date(alloc.plantation_date), "dd MMM yyyy")}</p>
                                {alloc.trees_alive !== null && (
                                  <p className="font-medium">Alive: {alloc.trees_alive} / {alloc.tree_count}</p>
                                )}
                                <Badge variant="outline" className="text-xs capitalize">{alloc.status}</Badge>
                                {alloc.batch_id && <p className="text-muted-foreground font-mono">{alloc.batch_id}</p>}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">⏳ Awaiting land partner allocation</p>
                            )}
                          </MobileCard>
                        );
                      })}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Trees</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Order Status</TableHead>
                          <TableHead>Allocation</TableHead>
                          <TableHead>Species</TableHead>
                          <TableHead>Plantation Date</TableHead>
                          <TableHead>Alive</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map(order => {
                          const alloc = order.tree_allocations?.[0];
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="text-sm">{format(new Date(order.created_at), "dd MMM yyyy")}</TableCell>
                              <TableCell className="font-medium">{order.quantity}</TableCell>
                              <TableCell>₹{Number(order.total_price).toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={order.status === "completed" ? "default" : "secondary"} className="capitalize">
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {alloc ? (
                                  <Badge variant="outline" className="capitalize">{alloc.status}</Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Pending</span>
                                )}
                              </TableCell>
                              <TableCell>{alloc?.species || "—"}</TableCell>
                              <TableCell>{alloc ? format(new Date(alloc.plantation_date), "dd MMM yyyy") : "—"}</TableCell>
                              <TableCell>
                                {alloc?.trees_alive !== null && alloc?.trees_alive !== undefined
                                  ? <span className="font-medium">{alloc.trees_alive} / {alloc.tree_count}</span>
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Survival Updates */}
            {survivalUpdates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Survival Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {survivalUpdates.slice(0, 6).map(update => (
                      <div key={update.id} className="rounded-lg border p-4 space-y-2">
                        {update.photo_url && (
                          <img src={update.photo_url} alt="Tree" className="w-full h-32 object-cover rounded-md" />
                        )}
                        <div className="flex justify-between items-center">
                          <Badge variant={update.health_status === "healthy" ? "default" : update.health_status === "weak" ? "secondary" : "destructive"} className="capitalize">
                            {update.health_status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(update.update_date), "dd MMM yyyy")}</span>
                        </div>
                        {update.height_cm && <p className="text-sm">Height: {update.height_cm} cm</p>}
                        {update.notes && <p className="text-xs text-muted-foreground">{update.notes}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Campaign Donations */}
            {donations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Campaign Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {donations.map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{d.campaigns?.title || "General"}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(d.created_at), "dd MMM yyyy")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={downloadingId === d.id} onClick={() => handleDownloadCertificate(d.id)}>
                            {downloadingId === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                            Certificate
                          </Button>
                          <span className="font-bold text-primary">₹{Number(d.amount).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyContributions;
