import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TreePine, Search, Mail, Phone, Calendar, Eye, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type Status = "new" | "quoted" | "confirmed" | "paid" | "in_progress" | "completed" | "cancelled";

interface Inquiry {
  id: string;
  org_name: string;
  org_type: string;
  contact_person: string;
  phone: string;
  email: string;
  state: string | null;
  district: string | null;
  village: string | null;
  pin_code: string | null;
  tree_quantity: number;
  preferred_month: string | null;
  land_type: string | null;
  notes: string | null;
  status: Status;
  quoted_price_per_tree: number | null;
  quoted_transport_charge: number | null;
  quoted_total: number | null;
  payment_mode: string | null;
  payment_reference: string | null;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_COLOR: Record<Status, string> = {
  new: "bg-blue-500",
  quoted: "bg-amber-500",
  confirmed: "bg-purple-500",
  paid: "bg-emerald-600",
  in_progress: "bg-cyan-600",
  completed: "bg-green-600",
  cancelled: "bg-gray-500",
};

export const BulkPlantationInquiriesTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [edit, setEdit] = useState({
    quoted_price_per_tree: "",
    quoted_transport_charge: "",
    quoted_total: "",
    payment_mode: "",
    payment_reference: "",
    admin_notes: "",
  });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-bulk-plantation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bulk_plantation_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Inquiry[];
    },
  });

  const filtered = rows.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.org_name.toLowerCase().includes(q) ||
      r.contact_person.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("bulk_plantation_inquiries").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Status updated" });
    qc.invalidateQueries({ queryKey: ["admin-bulk-plantation"] });
  };

  const openEdit = (r: Inquiry) => {
    setSelected(r);
    setEdit({
      quoted_price_per_tree: r.quoted_price_per_tree?.toString() ?? "",
      quoted_transport_charge: r.quoted_transport_charge?.toString() ?? "",
      quoted_total: r.quoted_total?.toString() ?? "",
      payment_mode: r.payment_mode ?? "",
      payment_reference: r.payment_reference ?? "",
      admin_notes: r.admin_notes ?? "",
    });
  };

  const saveEdits = async () => {
    if (!selected) return;
    const updates: Record<string, unknown> = {
      admin_notes: edit.admin_notes || null,
      payment_mode: edit.payment_mode || null,
      payment_reference: edit.payment_reference || null,
    };
    const ppt = parseFloat(edit.quoted_price_per_tree);
    const tr = parseFloat(edit.quoted_transport_charge);
    const tot = parseFloat(edit.quoted_total);
    updates.quoted_price_per_tree = Number.isFinite(ppt) ? ppt : null;
    updates.quoted_transport_charge = Number.isFinite(tr) ? tr : null;
    updates.quoted_total = Number.isFinite(tot)
      ? tot
      : Number.isFinite(ppt)
      ? ppt * selected.tree_quantity + (Number.isFinite(tr) ? tr : 0)
      : null;

    if (selected.status === "new" && updates.quoted_price_per_tree) {
      updates.status = "quoted";
      updates.quote_sent_at = new Date().toISOString();
    }
    if (edit.payment_reference && selected.status !== "paid") {
      updates.status = "paid";
      updates.paid_at = new Date().toISOString();
    }

    const { error } = await supabase.from("bulk_plantation_inquiries").update(updates).eq("id", selected.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved" });
    qc.invalidateQueries({ queryKey: ["admin-bulk-plantation"] });
    setSelected(null);
  };

  const shareQuoteOnWhatsApp = (r: Inquiry) => {
    const phone = r.phone?.replace(/\D/g, "");
    const ppt = r.quoted_price_per_tree;
    const tr = r.quoted_transport_charge;
    const tot = r.quoted_total;
    const lines = [
      `Namaste ${r.contact_person},`,
      ``,
      `Thank you for your bulk plantation inquiry for ${r.org_name} (${r.tree_quantity} trees).`,
      ``,
      `Here is your quote from Himsols:`,
      ppt ? `• Per tree (subsidised): Rs ${ppt}` : `• Per tree: (to be confirmed)`,
      tr != null ? `• Transport (one-time): Rs ${tr}` : `• Transport: as per site distance`,
      tot ? `• Estimated total: Rs ${tot}` : ``,
      ``,
      `Includes: native species, delivery, planting guidance, geo-tagged photos, 6-month survival report and impact certificate.`,
      ``,
      `Reply on this chat to confirm and we will share the payment link.`,
      ``,
      `— Himsols Team`,
      `https://himsols.com/bulk-plantation`,
    ].filter(Boolean).join("\n");
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(lines)}`
      : `https://wa.me/?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TreePine className="h-5 w-5" />
          Bulk Plantation Inquiries ({rows.length})
        </h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Quotes for Panchayats, CSR, schools and NGOs (100+ trees). Edit a row to add the quoted price and transport, then share on WhatsApp.
      </p>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organisation, contact, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: Status | "all") => setStatusFilter(v)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No inquiries yet. Share <span className="font-medium">himsols.com/bulk-plantation</span> with Panchayats and CSR teams.
                </TableCell></TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(r.created_at), "dd MMM yyyy")}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.org_name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{r.org_type} · {r.village || r.district || "—"}{r.state ? `, ${r.state}` : ""}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{r.contact_person}</div>
                      <div className="flex flex-col gap-0.5 text-xs">
                        <a href={`mailto:${r.email}`} className="flex items-center gap-1 text-primary hover:underline"><Mail className="h-3 w-3" />{r.email}</a>
                        <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-muted-foreground hover:underline"><Phone className="h-3 w-3" />{r.phone}</a>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{r.tree_quantity}</TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v: Status) => updateStatus(r.id, v)}>
                        <SelectTrigger className="w-[140px] h-8">
                          <Badge className={STATUS_COLOR[r.status]}>{r.status.replace("_", " ")}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="quoted">Quoted</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="in_progress">In progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title="View / Quote">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-green-700 hover:bg-green-100/60" onClick={() => shareQuoteOnWhatsApp(r)} title="Share quote on WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Inquiry — {selected?.org_name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Type</p><p className="font-medium">{selected.org_type}</p></div>
                <div><p className="text-muted-foreground">Quantity</p><p className="font-medium">{selected.tree_quantity} trees</p></div>
                <div><p className="text-muted-foreground">Contact</p><p className="font-medium">{selected.contact_person}</p></div>
                <div><p className="text-muted-foreground">Preferred month</p><p className="font-medium">{selected.preferred_month || "—"}</p></div>
                <div><p className="text-muted-foreground">Email</p><a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></div>
                <div><p className="text-muted-foreground">Phone</p><a href={`tel:${selected.phone}`} className="text-primary hover:underline">{selected.phone}</a></div>
                <div className="col-span-2"><p className="text-muted-foreground">Location</p><p className="font-medium">{[selected.village, selected.district, selected.state, selected.pin_code].filter(Boolean).join(", ") || "—"}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Land type</p><p className="font-medium">{selected.land_type || "—"}</p></div>
              </div>

              {selected.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes from inquiry</p>
                  <div className="bg-muted p-3 rounded-lg whitespace-pre-wrap text-sm">{selected.notes}</div>
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold">Quote</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Per tree (₹)</Label>
                    <Input type="number" step="0.01" value={edit.quoted_price_per_tree} onChange={(e) => setEdit({ ...edit, quoted_price_per_tree: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Transport (₹)</Label>
                    <Input type="number" step="0.01" value={edit.quoted_transport_charge} onChange={(e) => setEdit({ ...edit, quoted_transport_charge: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Total (₹) <span className="text-muted-foreground">(auto if blank)</span></Label>
                    <Input type="number" step="0.01" value={edit.quoted_total} onChange={(e) => setEdit({ ...edit, quoted_total: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold">Payment</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Payment mode</Label>
                    <Input value={edit.payment_mode} onChange={(e) => setEdit({ ...edit, payment_mode: e.target.value })} placeholder="Razorpay link / Bank / Cheque" />
                  </div>
                  <div>
                    <Label className="text-xs">Reference / Txn ID</Label>
                    <Input value={edit.payment_reference} onChange={(e) => setEdit({ ...edit, payment_reference: e.target.value })} />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs">Admin notes</Label>
                <Textarea value={edit.admin_notes} onChange={(e) => setEdit({ ...edit, admin_notes: e.target.value })} rows={3} maxLength={1000} placeholder="Internal notes..." />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={saveEdits} className="flex-1 min-w-[140px]">Save</Button>
                <Button variant="outline" onClick={() => shareQuoteOnWhatsApp(selected)} className="gap-2 text-green-700">
                  <MessageCircle className="h-4 w-4" /> Share quote on WhatsApp
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a href={`mailto:${selected.email}?subject=Himsols Bulk Plantation Quote — ${selected.org_name}`}>
                    <Mail className="h-4 w-4" /> Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
