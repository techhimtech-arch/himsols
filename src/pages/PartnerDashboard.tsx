import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Loader2, TreePine, CalendarDays, Sprout, ShieldCheck, IndianRupee } from "lucide-react";
import { format } from "date-fns";

const PartnerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/partner-dashboard");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      const [appRes, allocRes, roleRes] = await Promise.all([
        supabase.from("land_partner_applications").select("*").eq("user_id", user!.id).maybeSingle(),
        supabase.from("tree_allocations").select("*").eq("partner_id", user!.id).order("created_at", { ascending: false }),
        supabase.rpc("has_role", { _user_id: user!.id, _role: "verified_land_partner" }),
      ]);

      setApplication(appRes.data);
      setAllocations(allocRes.data || []);
      setIsVerified(!!roleRes.data);

      if (!roleRes.data) {
        navigate("/apply-land-partner");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalTrees = allocations.reduce((sum: number, a: any) => sum + a.tree_count, 0);
  const totalAlive = allocations.reduce((sum: number, a: any) => sum + (a.trees_alive || 0), 0);
  const totalEarned = allocations.filter((a: any) => a.payout_status === "paid").reduce((sum: number, a: any) => sum + (a.payout_amount || 0), 0);
  const pendingPayout = allocations.filter((a: any) => a.payout_status === "eligible").reduce((sum: number, a: any) => sum + (a.payout_amount || 0), 0);
  const upcomingPlantations = allocations.filter((a: any) => new Date(a.plantation_date) >= new Date());
  const completedAllocations = allocations.filter((a: any) => a.status === "planted" || a.status === "completed");

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Partner Dashboard | Himsols" description="View your tree allocations and plantation status." />
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Partner Dashboard</h1>
              <p className="text-muted-foreground text-sm">Verified Climate Land Partner</p>
            </div>
            <Badge className="ml-auto bg-primary/10 text-primary">Verified</Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card><CardContent className="p-4 text-center">
              <TreePine className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{totalTrees}</p>
              <p className="text-xs text-muted-foreground">Trees Allocated</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <Sprout className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{totalAlive}</p>
              <p className="text-xs text-muted-foreground">Trees Alive</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <CalendarDays className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{completedAllocations.length}</p>
              <p className="text-xs text-muted-foreground">Batches Done</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <IndianRupee className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">₹{totalEarned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <IndianRupee className="h-6 w-6 mx-auto text-amber-600 mb-2" />
              <p className="text-2xl font-bold">₹{pendingPayout.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Pending Payout</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{application?.land_size || 0}</p>
              <p className="text-xs text-muted-foreground">{application?.land_unit || "acre"} Land</p>
            </CardContent></Card>
          </div>

          {/* Allocations */}
          <Card>
            <CardHeader>
              <CardTitle>Tree Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              {allocations.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No tree allocations yet. Admin will assign batches after verification.</p>
              ) : (
                <div className="space-y-3">
                  {allocations.map((alloc: any) => (
                    <div key={alloc.id} className="p-4 rounded-lg border border-border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{alloc.tree_count} × {alloc.species}</p>
                          <p className="text-sm text-muted-foreground">
                            Plantation: {format(new Date(alloc.plantation_date), "dd MMM yyyy")}
                          </p>
                          {alloc.batch_id && <p className="text-xs font-mono text-muted-foreground">{alloc.batch_id}</p>}
                        </div>
                        <Badge variant="outline" className="capitalize">{alloc.status}</Badge>
                      </div>
                      {alloc.trees_alive !== null && (
                        <div className="flex items-center gap-4 text-sm pt-1 border-t border-border">
                          <span>Alive: <strong className="text-primary">{alloc.trees_alive}</strong></span>
                          <span>Dead: <strong className="text-destructive">{alloc.trees_dead || 0}</strong></span>
                          <span>Incentive: <strong>₹{(alloc.payout_amount || 0).toLocaleString()}</strong></span>
                          <Badge variant={alloc.payout_status === "paid" ? "default" : "secondary"} className="capitalize ml-auto text-xs">{alloc.payout_status}</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PartnerDashboard;
