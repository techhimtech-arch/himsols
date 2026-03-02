import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TreePine, CalendarDays, Sprout, ShieldCheck, IndianRupee, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const PartnerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [updateAlloc, setUpdateAlloc] = useState<any>(null);
  const [survivalForm, setSurvivalForm] = useState({ trees_alive: 0, trees_dead: 0 });
  const [updating, setUpdating] = useState(false);

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
      const [regRes, allocRes] = await Promise.all([
        supabase.from("farmer_registrations").select("*").eq("user_id", user!.id).maybeSingle(),
        supabase.from("tree_allocations").select("*").eq("partner_id", user!.id).order("created_at", { ascending: false }),
      ]);

      setRegistration(regRes.data);
      setAllocations(allocRes.data || []);

      // If no verified registration, redirect to register
      if (!regRes.data || regRes.data.status !== "verified") {
        navigate("/farmer-registration");
        return;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openSurvivalUpdate = (alloc: any) => {
    setUpdateAlloc(alloc);
    setSurvivalForm({
      trees_alive: alloc.trees_alive || alloc.tree_count,
      trees_dead: alloc.trees_dead || 0,
    });
  };

  const submitSurvivalUpdate = async () => {
    if (!updateAlloc) return;
    const alive = survivalForm.trees_alive;
    const dead = survivalForm.trees_dead;

    if (alive + dead !== updateAlloc.tree_count) {
      toast({ title: "Invalid Count", description: `Alive + Dead must equal ${updateAlloc.tree_count}`, variant: "destructive" });
      return;
    }

    setUpdating(true);
    try {
      const payoutAmount = alive * (updateAlloc.incentive_per_tree || 120);
      const { error } = await supabase.from("tree_allocations").update({
        trees_alive: alive,
        trees_dead: dead,
        payout_amount: payoutAmount,
        payout_status: "eligible",
        status: "monitoring",
        updated_at: new Date().toISOString(),
      }).eq("id", updateAlloc.id);

      if (error) throw error;
      toast({ title: "Survival Updated!", description: `${alive} trees alive. Incentive: ₹${payoutAmount}` });
      setUpdateAlloc(null);
      loadDashboard();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const totalTrees = allocations.reduce((sum: number, a: any) => sum + a.tree_count, 0);
  const totalAlive = allocations.reduce((sum: number, a: any) => sum + (a.trees_alive || 0), 0);
  const totalEarned = allocations.filter((a: any) => a.payout_status === "paid").reduce((sum: number, a: any) => sum + (a.payout_amount || 0), 0);
  const pendingPayout = allocations.filter((a: any) => a.payout_status === "eligible").reduce((sum: number, a: any) => sum + (a.payout_amount || 0), 0);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Partner Dashboard | Himsols" description="View your tree allocations and update survival status." />
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Partner Dashboard</h1>
              <p className="text-muted-foreground text-sm">{registration?.full_name} • {registration?.village}, {registration?.district}</p>
            </div>
            <Badge className="ml-auto bg-primary/10 text-primary">Verified Partner</Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
              <IndianRupee className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">₹{totalEarned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <IndianRupee className="h-6 w-6 mx-auto text-amber-600 mb-2" />
              <p className="text-2xl font-bold">₹{pendingPayout.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Pending Payout</p>
            </CardContent></Card>
          </div>

          {/* Allocations */}
          <Card>
            <CardHeader>
              <CardTitle>Tree Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              {allocations.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No tree allocations yet. Admin will assign batches to you soon.</p>
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
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{alloc.status}</Badge>
                          {/* Show update button for planted allocations without survival data yet */}
                          {(alloc.status === "planted" || alloc.status === "allocated") && alloc.payout_status !== "paid" && (
                            <Button size="sm" variant="outline" className="gap-1" onClick={() => openSurvivalUpdate(alloc)}>
                              <RefreshCw className="w-3 h-3" /> Update
                            </Button>
                          )}
                        </div>
                      </div>
                      {alloc.trees_alive !== null && (
                        <div className="flex items-center gap-4 text-sm pt-1 border-t border-border flex-wrap">
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

      {/* Survival Update Dialog */}
      <Dialog open={!!updateAlloc} onOpenChange={() => setUpdateAlloc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Survival Status</DialogTitle>
          </DialogHeader>
          {updateAlloc && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Batch: <strong>{updateAlloc.batch_id}</strong> • Total Trees: <strong>{updateAlloc.tree_count}</strong>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trees Alive</Label>
                  <Input type="number" min={0} max={updateAlloc.tree_count} value={survivalForm.trees_alive}
                    onChange={e => {
                      const alive = parseInt(e.target.value) || 0;
                      setSurvivalForm({ trees_alive: alive, trees_dead: updateAlloc.tree_count - alive });
                    }} />
                </div>
                <div className="space-y-2">
                  <Label>Trees Dead</Label>
                  <Input type="number" min={0} max={updateAlloc.tree_count} value={survivalForm.trees_dead}
                    onChange={e => {
                      const dead = parseInt(e.target.value) || 0;
                      setSurvivalForm({ trees_alive: updateAlloc.tree_count - dead, trees_dead: dead });
                    }} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Estimated Incentive: <strong className="text-primary">₹{(survivalForm.trees_alive * (updateAlloc.incentive_per_tree || 120)).toLocaleString()}</strong>
              </p>
              <Button onClick={submitSurvivalUpdate} disabled={updating} className="w-full">
                {updating ? "Updating..." : "Submit Survival Update"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PartnerDashboard;
