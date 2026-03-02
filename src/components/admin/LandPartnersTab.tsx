import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, CheckCircle, XCircle, TreePine, Plus, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: string;
  user_id: string;
  full_name: string;
  mobile: string;
  district: string;
  village: string;
  land_size: number;
  land_unit: string;
  irrigation_type: string;
  ownership_type: string;
  land_photos: string[];
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface Allocation {
  id: string;
  partner_id: string;
  tree_count: number;
  species: string;
  plantation_date: string;
  status: string;
  order_id: string | null;
  created_at: string;
}

interface UnassignedOrder {
  id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  delivery_location: string;
  profiles?: { full_name: string; email: string } | null;
}

const statusColors: Record<string, string> = {
  PendingVerification: "bg-yellow-100 text-yellow-800",
  Verified: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Suspended: "bg-gray-100 text-gray-800",
};

export const LandPartnersTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<UnassignedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [allocDialog, setAllocDialog] = useState(false);
  const [allocForm, setAllocForm] = useState({
    partner_id: "", application_id: "", tree_count: "10", species: "", plantation_date: "", order_id: ""
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [appsRes, allocRes, ordersRes] = await Promise.all([
      supabase.from("land_partner_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("tree_allocations").select("*").order("created_at", { ascending: false }),
      // Fetch paid orders not yet linked to any allocation
      supabase.from("orders").select("id, user_id, quantity, total_price, status, created_at, delivery_location").eq("status", "completed" as any).order("created_at", { ascending: false }),
    ]);

    const allocs = (allocRes.data as Allocation[]) || [];
    const linkedOrderIds = new Set(allocs.filter(a => a.order_id).map(a => a.order_id));
    const orders = ((ordersRes.data as UnassignedOrder[]) || []).filter(o => !linkedOrderIds.has(o.id));

    // Fetch buyer names for unassigned orders
    if (orders.length > 0) {
      const userIds = [...new Set(orders.map(o => o.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      orders.forEach(o => {
        const p = profileMap.get(o.user_id);
        if (p) o.profiles = { full_name: p.full_name, email: p.email };
      });
    }

    setApplications((appsRes.data as Application[]) || []);
    setAllocations(allocs);
    setUnassignedOrders(orders);
    setLoading(false);
  };

  const updateStatus = async (appId: string, userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("land_partner_applications")
        .update({ status: newStatus, admin_notes: adminNotes, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
        .eq("id", appId);
      if (error) throw error;

      if (newStatus === "Verified") {
        await supabase.from("user_roles").delete().eq("user_id", userId);
        await supabase.from("user_roles").insert({ user_id: userId, role: "verified_land_partner" as any });
      }
      if (newStatus === "Rejected" || newStatus === "Suspended") {
        await supabase.from("user_roles").delete().eq("user_id", userId);
        await supabase.from("user_roles").insert({ user_id: userId, role: "user" as any });
      }

      toast({ title: "✅ Updated", description: `Status set to ${newStatus}` });
      setSelectedApp(null);
      setAdminNotes("");
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const allocateTrees = async () => {
    const count = parseInt(allocForm.tree_count);
    if (count < 10 || count % 10 !== 0) {
      toast({ title: "Error", description: "Trees must be in multiples of 10 (min 10).", variant: "destructive" });
      return;
    }
    if (!allocForm.species || !allocForm.plantation_date || !allocForm.partner_id) {
      toast({ title: "Error", description: "Fill all required fields.", variant: "destructive" });
      return;
    }

    const app = applications.find(a => a.id === allocForm.application_id);
    if (!app || app.status !== "Verified") {
      toast({ title: "Error", description: "Partner must be verified.", variant: "destructive" });
      return;
    }

    try {
      const insertData: any = {
        partner_id: allocForm.partner_id,
        application_id: allocForm.application_id,
        tree_count: count,
        species: allocForm.species,
        plantation_date: allocForm.plantation_date,
        allocated_by: user?.id,
      };
      if (allocForm.order_id) {
        insertData.order_id = allocForm.order_id;
      }

      const { error } = await supabase.from("tree_allocations").insert(insertData);
      if (error) throw error;

      // Update order status to fulfilled if linked
      if (allocForm.order_id) {
        await supabase.from("orders").update({ status: "completed" }).eq("id", allocForm.order_id);
      }

      await supabase.from("allocation_logs").insert({
        action: "TREES_ALLOCATED",
        performed_by: user?.id,
        details: {
          partner_id: allocForm.partner_id,
          tree_count: count,
          species: allocForm.species,
          order_id: allocForm.order_id || null,
        },
      });

      toast({ title: "✅ Allocated", description: `${count} trees allocated${allocForm.order_id ? " & order linked" : ""}.` });
      setAllocDialog(false);
      setAllocForm({ partner_id: "", application_id: "", tree_count: "10", species: "", plantation_date: "", order_id: "" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const verifiedPartners = applications.filter(a => a.status === "Verified");

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Unassigned Orders Pipeline */}
      {unassignedOrders.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Unassigned Orders ({unassignedOrders.length})
              <span className="text-sm font-normal text-muted-foreground ml-2">— Paid orders waiting for land partner allocation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unassignedOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">{order.profiles?.full_name || "Unknown Buyer"}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity} trees · ₹{Number(order.total_price).toLocaleString()} · {format(new Date(order.created_at), "dd MMM yyyy")}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    setAllocForm(f => ({ ...f, order_id: order.id, tree_count: String(Math.ceil(order.quantity / 10) * 10) }));
                    setAllocDialog(true);
                  }}>
                    <TreePine className="h-3 w-3 mr-1" /> Assign to Partner
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Land Partner Applications ({applications.length})</CardTitle>
          <Dialog open={allocDialog} onOpenChange={setAllocDialog}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={verifiedPartners.length === 0}>
                <Plus className="h-4 w-4 mr-1" /> Allocate Trees
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Allocate Tree Batch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Verified Partner *</Label>
                  <Select value={allocForm.application_id} onValueChange={v => {
                    const app = verifiedPartners.find(a => a.id === v);
                    setAllocForm(f => ({ ...f, application_id: v, partner_id: app?.user_id || "" }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
                    <SelectContent>
                      {verifiedPartners.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.full_name} — {p.village}, {p.district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Link to buyer order */}
                <div>
                  <Label>Link to Buyer Order (optional)</Label>
                  <Select value={allocForm.order_id} onValueChange={v => setAllocForm(f => ({ ...f, order_id: v === "none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="No order linked" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No order linked</SelectItem>
                      {unassignedOrders.map(o => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.profiles?.full_name || "Buyer"} — {o.quantity} trees · ₹{Number(o.total_price).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Number of Trees (multiples of 10) *</Label>
                  <Input type="number" min={10} step={10} value={allocForm.tree_count} onChange={e => setAllocForm(f => ({ ...f, tree_count: e.target.value }))} />
                </div>
                <div>
                  <Label>Species *</Label>
                  <Input value={allocForm.species} onChange={e => setAllocForm(f => ({ ...f, species: e.target.value }))} placeholder="e.g. Deodar, Apple, Walnut" />
                </div>
                <div>
                  <Label>Plantation Date *</Label>
                  <Input type="date" value={allocForm.plantation_date} onChange={e => setAllocForm(f => ({ ...f, plantation_date: e.target.value }))} />
                </div>
                <Button onClick={allocateTrees} className="w-full">
                  <TreePine className="h-4 w-4 mr-2" /> Allocate Batch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Land</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.full_name}</TableCell>
                    <TableCell>{app.district}</TableCell>
                    <TableCell>{app.village}</TableCell>
                    <TableCell>{app.land_size} {app.land_unit}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[app.status] || ""}>{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(app.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedApp(app); setAdminNotes(app.admin_notes || ""); }}>
                            <Eye className="h-3 w-3 mr-1" /> Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Review: {app.full_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div><span className="text-muted-foreground">Mobile:</span> {app.mobile}</div>
                              <div><span className="text-muted-foreground">District:</span> {app.district}</div>
                              <div><span className="text-muted-foreground">Village:</span> {app.village}</div>
                              <div><span className="text-muted-foreground">Land:</span> {app.land_size} {app.land_unit}</div>
                              <div><span className="text-muted-foreground">Irrigation:</span> {app.irrigation_type}</div>
                              <div><span className="text-muted-foreground">Ownership:</span> {app.ownership_type}</div>
                            </div>

                            <div>
                              <Label className="text-sm text-muted-foreground">Land Photos</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {app.land_photos?.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                    <img src={url} alt={`Land ${i + 1}`} className="w-28 h-28 rounded-lg object-cover border" />
                                  </a>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label>Admin Notes</Label>
                              <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add verification notes..." />
                            </div>

                            <div className="flex gap-2">
                              <Button onClick={() => updateStatus(app.id, app.user_id, "Verified")} className="flex-1">
                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button variant="destructive" onClick={() => updateStatus(app.id, app.user_id, "Rejected")} className="flex-1">
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                              {app.status === "Verified" && (
                                <Button variant="outline" onClick={() => updateStatus(app.id, app.user_id, "Suspended")}>
                                  Suspend
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {applications.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No applications yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Allocations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tree Allocations ({allocations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Buyer Order</TableHead>
                  <TableHead>Trees</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Plantation Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map(alloc => {
                  const partner = applications.find(a => a.user_id === alloc.partner_id);
                  return (
                    <TableRow key={alloc.id}>
                      <TableCell className="font-medium">{partner?.full_name || "—"}</TableCell>
                      <TableCell>
                        {alloc.order_id ? (
                          <Badge variant="outline" className="text-xs">
                            <LinkIcon className="h-3 w-3 mr-1" /> Linked
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">Unlinked</span>
                        )}
                      </TableCell>
                      <TableCell>{alloc.tree_count}</TableCell>
                      <TableCell>{alloc.species}</TableCell>
                      <TableCell>{format(new Date(alloc.plantation_date), "dd MMM yyyy")}</TableCell>
                      <TableCell><Badge variant="outline">{alloc.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
                {allocations.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No allocations yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
