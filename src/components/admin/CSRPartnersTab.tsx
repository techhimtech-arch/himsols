import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Building2, X, Save, MessageCircle } from "lucide-react";
import { MobileCard, MobileCardRow, StatusBadge } from "./MobileCard";

const STATUSES = ["inquiry", "contacted", "proposal_sent", "won", "lost"];

const whatsappLink = (p: any) => {
  const phone = (p.phone || "").replace(/\D/g, "");
  const text = encodeURIComponent(
    `Hello ${p.contact_person}, this is Himsols (Himachal plantation partner) about your CSR plantation enquiry for ${p.company_name}. ` +
      `Sharing our proposal and plantation plan — happy to set up a quick call.`,
  );
  return `https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${text}`;
};

export const CSRPartnersTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["admin-csr-partners"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("csr_partners")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = async (id: string, patch: Record<string, any>, message = "Updated") => {
    const { error } = await (supabase as any).from("csr_partners").update(patch).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: message });
    queryClient.invalidateQueries({ queryKey: ["admin-csr-partners"] });
  };

  const updateStatus = (id: string, status: string) =>
    update(id, status === "proposal_sent" ? { status, proposal_sent_at: new Date().toISOString() } : { status });

  const saveNotes = (id: string) => update(id, { notes: notesDraft[id] ?? "" }, "Notes saved");

  const deletePartner = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    const { error } = await (supabase as any).from("csr_partners").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    queryClient.invalidateQueries({ queryKey: ["admin-csr-partners"] });
  };

  const counts = STATUSES.map((s) => ({ s, n: partners.filter((p: any) => p.status === s).length }));

  const NotesEditor = ({ p }: { p: any }) => (
    <div className="space-y-2">
      <Textarea
        rows={2}
        placeholder="Follow-up notes..."
        value={notesDraft[p.id] ?? p.notes ?? ""}
        onChange={(e) => setNotesDraft({ ...notesDraft, [p.id]: e.target.value })}
      />
      <Button size="sm" variant="outline" className="gap-1" onClick={() => saveNotes(p.id)}>
        <Save className="h-3.5 w-3.5" />
        Save notes
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Building2 className="h-5 w-5 text-primary" />
          CSR Leads ({partners.length})
        </CardTitle>
        <div className="flex flex-wrap gap-2 pt-2">
          {counts.map(({ s, n }) => (
            <span key={s} className="text-xs px-2 py-1 rounded-full border border-border text-muted-foreground">
              {s.replace("_", " ")}: <span className="font-semibold text-foreground">{n}</span>
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : partners.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No CSR leads yet</p>
        ) : (
          <>
            <div className="block md:hidden space-y-4">
              {partners.map((p: any) => (
                <MobileCard key={p.id}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{p.company_name}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <MobileCardRow label="Contact" value={`${p.contact_person} • ${p.phone}`} />
                  <MobileCardRow label="Email" value={<span className="text-xs break-all">{p.email}</span>} />
                  <MobileCardRow label="Interest" value={p.interest_area || "-"} />
                  <MobileCardRow
                    label="Estimate"
                    value={
                      p.estimated_trees
                        ? `${p.estimated_trees} trees • ₹${Number(p.estimated_budget || 0).toLocaleString("en-IN")}`
                        : p.budget_range || "-"
                    }
                  />
                  {p.message && (
                    <MobileCardRow label="Message" value={<span className="text-xs">{p.message.substring(0, 120)}</span>} />
                  )}
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex gap-2">
                      <Select value={p.status} onValueChange={(s) => updateStatus(p.id, s)}>
                        <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <a href={whatsappLink(p)} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline"><MessageCircle className="h-4 w-4" /></Button>
                      </a>
                      <Button size="sm" variant="destructive" onClick={() => deletePartner(p.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <NotesEditor p={p} />
                  </div>
                </MobileCard>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Estimate</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.company_name}
                        <br />
                        <span className="text-xs text-muted-foreground">{p.company_type}</span>
                      </TableCell>
                      <TableCell>
                        {p.contact_person}
                        <br />
                        <span className="text-xs text-muted-foreground">{p.phone}</span>
                        <br />
                        <span className="text-xs text-muted-foreground break-all">{p.email}</span>
                      </TableCell>
                      <TableCell className="text-sm">{p.interest_area || "-"}</TableCell>
                      <TableCell className="text-sm">
                        {p.estimated_trees
                          ? `${p.estimated_trees} trees · ₹${Number(p.estimated_budget || 0).toLocaleString("en-IN")}`
                          : p.budget_range || "-"}
                      </TableCell>
                      <TableCell>
                        <Select value={p.status} onValueChange={(s) => updateStatus(p.id, s)}>
                          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="min-w-[220px]"><NotesEditor p={p} /></TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <a href={whatsappLink(p)} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="w-full gap-1">
                              <MessageCircle className="h-3.5 w-3.5" />
                              WhatsApp
                            </Button>
                          </a>
                          <Button size="sm" variant="destructive" onClick={() => deletePartner(p.id)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
