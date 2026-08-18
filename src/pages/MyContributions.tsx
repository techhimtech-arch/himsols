import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  TreePine,
  ArrowRight,
  Download,
  Loader2,
  MapPin,
  Sprout,
  Activity,
  ShieldCheck,
  Camera,
} from "lucide-react";
import { CO2ImpactCard } from "@/components/contributions/CO2ImpactCard";
import { ForestProgress } from "@/components/contributions/ForestProgress";
import { ShareButtons } from "@/components/ShareButtons";
import { useToast } from "@/hooks/use-toast";

interface Allocation {
  id: string;
  tree_count: number;
  species: string;
  plantation_date: string;
  status: string;
  batch_id: string | null;
  trees_alive: number | null;
  trees_dead: number | null;
  review_date: string | null;
  payout_status: string;
}

interface OrderWithAllocation {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  delivery_location: string;
  tree_allocations: Allocation[] | null;
}

interface PlantationRequest {
  id: string;
  tracking_id: string;
  quantity: number;
  tree_type: string;
  location: string;
  status: string;
  created_at: string;
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
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders-with-allocations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("orders")
        .select(
          `id, quantity, total_price, status, created_at, delivery_location, tree_allocations(id, tree_count, species, plantation_date, status, batch_id, trees_alive, trees_dead, review_date, payout_status)`
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as OrderWithAllocation[];
    },
    enabled: !!user,
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["my-plantation-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("tree_plantation_requests")
        .select("id, tracking_id, quantity, tree_type, location, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as PlantationRequest[];
    },
    enabled: !!user,
  });

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

  // Unified auth gating: same pattern as /profile
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/my-contributions", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const downloadRequestCertificate = async (requestId: string, trackingId: string) => {
    setDownloadingId(requestId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Please login again to download your certificate.");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-certificate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ requestId }),
        }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate certificate");
      }
      const blob = await response.blob();
      if (blob.type !== "application/pdf" || blob.size < 1000) {
        throw new Error("Certificate could not be generated. Please try again.");
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HIMSOLS-Certificate-${trackingId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Certificate downloaded" });
    } catch (err: any) {
      toast({ title: "Download failed", description: err.message, variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadCertificate = async (donationId: string) => {
    setDownloadingId(donationId);
    try {
      const response = await supabase.functions.invoke("generate-donation-certificate", {
        body: { donationId },
      });
      if (response.error) throw new Error(response.error.message);

      const data = response.data;
      if (!data) throw new Error("Certificate could not be generated. Please try again.");

      let blob: Blob;
      if (data instanceof Blob) {
        blob = data;
      } else if (data instanceof ArrayBuffer) {
        blob = new Blob([data], { type: "application/pdf" });
      } else if (typeof data === "object") {
        throw new Error((data as any)?.error || "Certificate service returned an error.");
      } else {
        blob = new Blob([data as any], { type: "application/pdf" });
      }

      if (blob.size < 1000) throw new Error("Certificate file looks invalid. Please try again.");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HIMSOLS-Contribution-Certificate.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Certificate downloaded" });
    } catch (err: any) {
      toast({ title: "Download Failed", description: err.message, variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  const allocations = orders.flatMap((o) => o.tree_allocations || []);
  const batches = allocations.filter((a) => !!a.batch_id);

  const treesFromOrders = orders.reduce((sum, o) => sum + o.quantity, 0);
  const treesFromRequests = requests.reduce((sum, r) => sum + r.quantity, 0);
  const totalTrees = treesFromOrders + treesFromRequests;
  const totalAllocated = allocations.reduce((s, a) => s + a.tree_count, 0);
  const totalTreesAlive = allocations.reduce((s, a) => s + (a.trees_alive ?? a.tree_count), 0);
  const healthyUpdates = survivalUpdates.filter((s) => s.health_status === "healthy").length;
  const totalUpdates = survivalUpdates.length;
  const survivalRate =
    totalAllocated > 0
      ? Math.round((totalTreesAlive / totalAllocated) * 100)
      : totalUpdates > 0
        ? Math.round((healthyUpdates / totalUpdates) * 100)
        : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
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
          <p className="text-muted-foreground mb-6">Login to view your forest.</p>
          <Button onClick={() => navigate("/auth")}>Login Now</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isLoading = ordersLoading || requestsLoading;
  const isEmpty = orders.length === 0 && requests.length === 0 && donations.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="My Forest | Himsols"
        description="Track your trees end-to-end — plantation progress, batch proof, survival updates and CO₂ estimate."
      />
      <Navbar />

      <main className="pt-20 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div>
              <span className="text-xs font-bold tracking-[0.18em] uppercase text-primary">
                My Forest
              </span>
              <h1 className="text-2xl md:text-3xl font-bold mt-2">
                {totalTrees} {totalTrees === 1 ? "tree" : "trees"} in your name
              </h1>
              <p className="text-muted-foreground mt-1 max-w-xl text-sm">
                Every tree is planted on farmer land or a forest patch in Himachal Pradesh,
                geo-tagged and survival-tracked. Progress, proof and certificates all live here.
              </p>
              <div className="mt-4">
                <ShareButtons
                  title={`I have ${totalTrees} trees growing in Himachal Pradesh 🌳`}
                  description="Himsols plants native trees on farmer land and tracks every one of them."
                  url="/tree-plantation"
                  whatsappMessage={`I have ${totalTrees} native trees growing in Himachal Pradesh with Himsols 🌳 Every tree is geo-tagged and survival-tracked. You can plant too:`}
                  variant="full"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button onClick={() => navigate("/tree-plantation")}>
                Plant more trees <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => navigate("/track-request")}>
                Track a request
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <CO2ImpactCard
              totalAllocated={totalAllocated || totalTrees}
              survivalRate={survivalRate || 100}
            />
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sprout className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{totalTreesAlive}</p>
                  <p className="text-xs text-muted-foreground">Trees confirmed alive</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{survivalRate}%</p>
                  <p className="text-xs text-muted-foreground">Survival rate (last check)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{batches.length}</p>
                  <p className="text-xs text-muted-foreground">Proof batches</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : isEmpty ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TreePine className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-lg font-semibold mb-2">Your forest is empty — for now</h2>
              <p className="text-muted-foreground mb-4">
                Send your first plantation request and we will plant, geo-tag and track it.
              </p>
              <Button onClick={() => navigate("/tree-plantation")}>Plant trees</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Plantation requests with progress */}
            {requests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Plantation requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requests.map((r) => (
                    <div key={r.id} className="rounded-xl border border-border p-4 space-y-3">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <p className="font-semibold">
                            {r.quantity} × {r.tree_type}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {r.location} · {format(new Date(r.created_at), "dd MMM yyyy")}
                          </p>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {r.tracking_id}
                        </Badge>
                      </div>
                      <ForestProgress status={r.status} />
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/track-request?id=${r.tracking_id}`}>Track</Link>
                        </Button>
                        {r.status === "completed" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1"
                            disabled={downloadingId === r.id}
                            onClick={() => downloadRequestCertificate(r.id, r.tracking_id)}
                          >
                            {downloadingId === r.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3" />
                            )}
                            Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Sponsored orders with allocation + batch proof */}
            {orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sponsored trees</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orders.map((order) => {
                    const alloc = order.tree_allocations?.[0];
                    return (
                      <div key={order.id} className="rounded-xl border border-border p-4 space-y-3">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <p className="font-semibold">
                              {order.quantity} trees · ₹{Number(order.total_price).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {order.delivery_location} ·{" "}
                              {format(new Date(order.created_at), "dd MMM yyyy")}
                            </p>
                          </div>
                          {alloc?.batch_id && (
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/batch/${alloc.batch_id}`}>
                                <Camera className="h-3 w-3 mr-1" />
                                View batch proof
                              </Link>
                            </Button>
                          )}
                        </div>
                        <ForestProgress status={order.status} />
                        {alloc ? (
                          <div className="grid sm:grid-cols-3 gap-3 rounded-lg bg-muted/50 p-3 text-xs">
                            <div>
                              <p className="text-muted-foreground">Species</p>
                              <p className="font-medium">{alloc.species}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Planted on</p>
                              <p className="font-medium">
                                {format(new Date(alloc.plantation_date), "dd MMM yyyy")}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Survival check</p>
                              <p className="font-medium">
                                {alloc.trees_alive != null
                                  ? `${alloc.trees_alive}/${alloc.tree_count} alive${
                                      alloc.review_date
                                        ? ` · ${format(new Date(alloc.review_date), "dd MMM yyyy")}`
                                        : ""
                                    }`
                                  : "First review pending"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Awaiting allocation to a verified land partner — proof page goes live
                            after plantation.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Survival updates */}
            {survivalUpdates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Survival updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {survivalUpdates.slice(0, 6).map((update) => (
                      <div key={update.id} className="rounded-lg border p-4 space-y-2">
                        {update.photo_url && (
                          <img
                            src={update.photo_url}
                            alt="Survival update photo of a planted tree"
                            loading="lazy"
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                        <div className="flex justify-between items-center">
                          <Badge
                            variant={
                              update.health_status === "healthy"
                                ? "default"
                                : update.health_status === "weak"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="capitalize"
                          >
                            {update.health_status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(update.update_date), "dd MMM yyyy")}
                          </span>
                        </div>
                        {update.height_cm && <p className="text-sm">Height: {update.height_cm} cm</p>}
                        {update.notes && (
                          <p className="text-xs text-muted-foreground">{update.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Campaign contributions */}
            {donations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Campaign contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {donations.map((d: any) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{d.campaigns?.title || "General"}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(d.created_at), "dd MMM yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            disabled={downloadingId === d.id}
                            onClick={() => handleDownloadCertificate(d.id)}
                          >
                            {downloadingId === d.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3" />
                            )}
                            Certificate
                          </Button>
                          <span className="font-bold text-primary">
                            ₹{Number(d.amount).toLocaleString()}
                          </span>
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
