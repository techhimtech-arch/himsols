import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard, MobileCardRow, StatusBadge } from "./MobileCard";
import { format } from "date-fns";
import { Loader2, TreePine, IndianRupee, Camera, CheckCircle2, AlertCircle } from "lucide-react";

interface Allocation {
  id: string;
  order_id: string | null;
  partner_id: string;
  application_id: string;
  tree_count: number;
  species: string;
  plantation_date: string;
  status: string;
  notes: string | null;
  batch_id: string | null;
  incentive_per_tree: number;
  trees_alive: number | null;
  trees_dead: number | null;
  review_date: string | null;
  payout_status: string;
  payout_amount: number | null;
  payout_reference: string | null;
  payout_date: string | null;
  created_at: string;
}

export const AllocationsTab = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [survivalDialog, setSurvivalDialog] = useState<Allocation | null>(null);
  const [payoutDialog, setPayoutDialog] = useState<Allocation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [payoutFilter, setPayoutFilter] = useState<string>("all");

  // Survival form state
  const [treesAlive, setTreesAlive] = useState<number>(0);
  const [treesDead, setTreesDead] = useState<number>(0);
  const [survivalNotes, setSurvivalNotes] = useState("");
  const [survivalPhoto, setSurvivalPhoto] = useState("");

  // Payout form state
  const [payoutRef, setPayoutRef] = useState("");
  const [payoutDate, setPayoutDate] = useState("");

  const { data: allocations = [], isLoading } = useQuery({
    queryKey: ["admin-allocations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tree_allocations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Allocation[];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles-alloc"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name, phone");
      if (error) throw error;
      return data || [];
    },
  });

  const getPartnerName = (id: string) => profiles.find(p => p.id === id)?.full_name || id.slice(0, 8);

  const filteredAllocations = allocations.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (payoutFilter !== "all" && a.payout_status !== payoutFilter) return false;
    return true;
  });

  // Record survival update
  const survivalMutation = useMutation({
    mutationFn: async (alloc: Allocation) => {
      const alive = treesAlive;
      const dead = treesDead;

      if (alive + dead > alloc.tree_count) throw new Error("Alive + Dead cannot exceed total trees");

      // Update allocation with survival data
      const incentiveAmount = alive * alloc.incentive_per_tree;
      const newStatus = alive > 0 ? "planted" : "failed";
      const payoutStatus = alive > 0 ? "eligible" : "not_applicable";

      const { error: allocError } = await supabase
        .from("tree_allocations")
        .update({
          trees_alive: alive,
          trees_dead: dead,
          status: newStatus,
          payout_status: payoutStatus,
          payout_amount: incentiveAmount,
        } as any)
        .eq("id", alloc.id);

      if (allocError) throw allocError;

      // Create survival_update record
      const { data: { user } } = await supabase.auth.getUser();
      const { error: survError } = await supabase
        .from("survival_updates")
        .insert({
          order_id: alloc.order_id,
          health_status: alive >= alloc.tree_count * 0.8 ? "healthy" : alive > 0 ? "weak" : "dead",
          height_cm: null,
          photo_url: survivalPhoto || null,
          notes: survivalNotes || `Survival check: ${alive}/${alloc.tree_count} alive`,
          uploaded_by: user!.id,
        } as any);

      if (survError) throw survError;

      // Log allocation action
      await supabase.from("allocation_logs").insert({
        allocation_id: alloc.id,
        action: "survival_recorded",
        performed_by: user!.id,
        details: { trees_alive: alive, trees_dead: dead, incentive: incentiveAmount },
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-allocations"] });
      setSurvivalDialog(null);
      setTreesAlive(0);
      setTreesDead(0);
      setSurvivalNotes("");
      setSurvivalPhoto("");
      toast({ title: "Survival recorded ✅", description: "Incentive auto-calculated." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Approve payout
  const payoutMutation = useMutation({
    mutationFn: async (alloc: Allocation) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("tree_allocations")
        .update({
          payout_status: "paid",
          payout_reference: payoutRef,
          payout_date: payoutDate || new Date().toISOString().split("T")[0],
          status: "completed",
        } as any)
        .eq("id", alloc.id);
      if (error) throw error;

      await supabase.from("allocation_logs").insert({
        allocation_id: alloc.id,
        action: "payout_approved",
        performed_by: user!.id,
        details: { amount: alloc.payout_amount, reference: payoutRef },
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-allocations"] });
      setPayoutDialog(null);
      setPayoutRef("");
      setPayoutDate("");
      toast({ title: "Payout Approved ✅", description: "Farmer marked as paid." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openSurvivalDialog = (alloc: Allocation) => {
    setTreesAlive(alloc.trees_alive || 0);
    setTreesDead(alloc.trees_dead || 0);
    setSurvivalNotes("");
    setSurvivalPhoto("");
    setSurvivalDialog(alloc);
  };

  // Stats
  const totalAllocated = allocations.reduce((s, a) => s + a.tree_count, 0);
  const totalAlive = allocations.reduce((s, a) => s + (a.trees_alive || 0), 0);
  const totalIncentive = allocations.reduce((s, a) => s + (a.payout_amount || 0), 0);
  const totalPaid = allocations.filter(a => a.payout_status === "paid").reduce((s, a) => s + (a.payout_amount || 0), 0);
  const pendingPayout = allocations.filter(a => a.payout_status === "eligible").length;

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{totalAllocated}</p>
          <p className="text-xs text-muted-foreground">Trees Allocated</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalAlive}</p>
          <p className="text-xs text-muted-foreground">Trees Alive</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">₹{totalIncentive.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Incentive</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Paid Out</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingPayout}</p>
          <p className="text-xs text-muted-foreground">Pending Payouts</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle className="text-lg">Allocation Pipeline ({filteredAllocations.length})</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="planted">Planted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={payoutFilter} onValueChange={setPayoutFilter}>
                <SelectTrigger className="w-[140px] bg-background"><SelectValue placeholder="Payout" /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="all">All Payouts</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="eligible">Eligible</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAllocations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No allocations found</p>
          ) : isMobile ? (
            <div className="space-y-3">
              {filteredAllocations.map(alloc => (
                <MobileCard key={alloc.id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{alloc.batch_id || alloc.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{getPartnerName(alloc.partner_id)}</p>
                    </div>
                    <div className="flex gap-1">
                      <StatusBadge status={alloc.status} />
                    </div>
                  </div>
                  <MobileCardRow label="Trees" value={`${alloc.tree_count} × ${alloc.species}`} />
                  <MobileCardRow label="Planted" value={format(new Date(alloc.plantation_date), "dd MMM yyyy")} />
                  <MobileCardRow label="Review" value={alloc.review_date ? format(new Date(alloc.review_date), "dd MMM yyyy") : "—"} />
                  {alloc.trees_alive !== null && (
                    <>
                      <MobileCardRow label="Alive / Dead" value={`${alloc.trees_alive} / ${alloc.trees_dead || 0}`} />
                      <MobileCardRow label="Incentive" value={`₹${(alloc.payout_amount || 0).toLocaleString()}`} />
                    </>
                  )}
                  <MobileCardRow label="Payout" value={
                    <Badge variant={alloc.payout_status === "paid" ? "default" : alloc.payout_status === "eligible" ? "secondary" : "outline"} className="capitalize text-xs">
                      {alloc.payout_status}
                    </Badge>
                  } />
                  <div className="pt-2 border-t border-border flex gap-2">
                    {alloc.status !== "completed" && (
                      <Button size="sm" variant="outline" className="text-xs flex-1" onClick={() => openSurvivalDialog(alloc)}>
                        <Camera className="h-3 w-3 mr-1" /> Survival
                      </Button>
                    )}
                    {alloc.payout_status === "eligible" && (
                      <Button size="sm" className="text-xs flex-1" onClick={() => setPayoutDialog(alloc)}>
                        <IndianRupee className="h-3 w-3 mr-1" /> Payout
                      </Button>
                    )}
                  </div>
                </MobileCard>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Trees</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Planted</TableHead>
                  <TableHead>Review Date</TableHead>
                  <TableHead>Alive/Dead</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Incentive</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllocations.map(alloc => (
                  <TableRow key={alloc.id}>
                    <TableCell className="font-mono text-xs">{alloc.batch_id || alloc.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{getPartnerName(alloc.partner_id)}</TableCell>
                    <TableCell>{alloc.tree_count}</TableCell>
                    <TableCell>{alloc.species}</TableCell>
                    <TableCell className="text-sm">{format(new Date(alloc.plantation_date), "dd MMM yy")}</TableCell>
                    <TableCell className="text-sm">{alloc.review_date ? format(new Date(alloc.review_date), "dd MMM yy") : "—"}</TableCell>
                    <TableCell>
                      {alloc.trees_alive !== null ? (
                        <span className="text-sm">
                          <span className="text-green-600 font-medium">{alloc.trees_alive}</span>
                          {" / "}
                          <span className="text-destructive">{alloc.trees_dead || 0}</span>
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell><StatusBadge status={alloc.status} /></TableCell>
                    <TableCell className="font-medium">
                      {alloc.payout_amount ? `₹${alloc.payout_amount.toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={alloc.payout_status === "paid" ? "default" : alloc.payout_status === "eligible" ? "secondary" : "outline"} className="capitalize text-xs">
                        {alloc.payout_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {alloc.status !== "completed" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openSurvivalDialog(alloc)}>
                            <Camera className="h-3 w-3 mr-1" /> Survival
                          </Button>
                        )}
                        {alloc.payout_status === "eligible" && (
                          <Button size="sm" className="h-7 text-xs" onClick={() => setPayoutDialog(alloc)}>
                            <IndianRupee className="h-3 w-3 mr-1" /> Pay
                          </Button>
                        )}
                        {alloc.payout_status === "paid" && (
                          <span className="flex items-center text-xs text-green-600 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Survival Dialog */}
      <Dialog open={!!survivalDialog} onOpenChange={() => setSurvivalDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-primary" />
              Record Survival Update
            </DialogTitle>
          </DialogHeader>
          {survivalDialog && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                <p><strong>Batch:</strong> {survivalDialog.batch_id}</p>
                <p><strong>Partner:</strong> {getPartnerName(survivalDialog.partner_id)}</p>
                <p><strong>Total Trees:</strong> {survivalDialog.tree_count}</p>
                <p><strong>Incentive/Tree:</strong> ₹{survivalDialog.incentive_per_tree}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Trees Alive</Label>
                  <Input type="number" min={0} max={survivalDialog.tree_count} value={treesAlive}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      setTreesAlive(val);
                      setTreesDead(survivalDialog.tree_count - val);
                    }} />
                </div>
                <div>
                  <Label>Trees Dead</Label>
                  <Input type="number" min={0} max={survivalDialog.tree_count} value={treesDead}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      setTreesDead(val);
                      setTreesAlive(survivalDialog.tree_count - val);
                    }} />
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm font-medium">Auto-Calculated Incentive</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{(treesAlive * survivalDialog.incentive_per_tree).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{treesAlive} trees × ₹{survivalDialog.incentive_per_tree}/tree</p>
              </div>
              <div>
                <Label>Survival Photo URL</Label>
                <Input placeholder="https://..." value={survivalPhoto} onChange={e => setSurvivalPhoto(e.target.value)} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Survival observations..." value={survivalNotes} onChange={e => setSurvivalNotes(e.target.value)} />
              </div>
              <Button className="w-full" disabled={survivalMutation.isPending}
                onClick={() => survivalMutation.mutate(survivalDialog)}>
                {survivalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Record Survival & Calculate Incentive
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payout Dialog */}
      <Dialog open={!!payoutDialog} onOpenChange={() => setPayoutDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Approve Farmer Payout
            </DialogTitle>
          </DialogHeader>
          {payoutDialog && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                <p><strong>Partner:</strong> {getPartnerName(payoutDialog.partner_id)}</p>
                <p><strong>Trees Alive:</strong> {payoutDialog.trees_alive} / {payoutDialog.tree_count}</p>
                <p className="text-lg font-bold text-primary">Payout: ₹{(payoutDialog.payout_amount || 0).toLocaleString()}</p>
              </div>
              <div>
                <Label>Payment Reference (UPI/NEFT ID)</Label>
                <Input placeholder="UTR / Transaction ID" value={payoutRef} onChange={e => setPayoutRef(e.target.value)} />
              </div>
              <div>
                <Label>Payment Date</Label>
                <Input type="date" value={payoutDate} onChange={e => setPayoutDate(e.target.value)} />
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">This action marks the allocation as "Completed" and "Paid". Make sure UPI/bank transfer is done before approving.</p>
              </div>
              <Button className="w-full" disabled={payoutMutation.isPending || !payoutRef}
                onClick={() => payoutMutation.mutate(payoutDialog)}>
                {payoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Confirm Payout — ₹{(payoutDialog.payout_amount || 0).toLocaleString()}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
