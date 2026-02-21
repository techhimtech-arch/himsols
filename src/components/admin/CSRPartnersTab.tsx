import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Building2, X } from "lucide-react";
import { MobileCard, MobileCardRow, StatusBadge } from "./MobileCard";

const STATUSES = ["inquiry", "contacted", "onboarded", "active"];

export const CSRPartnersTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["admin-csr-partners"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("csr_partners").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any).from("csr_partners").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Updated" });
    queryClient.invalidateQueries({ queryKey: ["admin-csr-partners"] });
  };

  const deletePartner = async (id: string) => {
    if (!confirm("Delete this partner inquiry?")) return;
    const { error } = await (supabase as any).from("csr_partners").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    queryClient.invalidateQueries({ queryKey: ["admin-csr-partners"] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Building2 className="h-5 w-5 text-primary" />
          CSR Partners ({partners.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : partners.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No CSR partner inquiries yet</p>
        ) : (
          <>
            <div className="block md:hidden space-y-4">
              {partners.map((p: any) => (
                <MobileCard key={p.id}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{p.company_name}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <MobileCardRow label="Type" value={p.company_type} />
                  <MobileCardRow label="Contact" value={`${p.contact_person} • ${p.phone}`} />
                  <MobileCardRow label="Email" value={<span className="text-xs break-all">{p.email}</span>} />
                  <MobileCardRow label="Interest" value={p.interest_area || "-"} />
                  <MobileCardRow label="Budget" value={p.budget_range || "-"} />
                  {p.message && <MobileCardRow label="Message" value={<span className="text-xs">{p.message.substring(0, 80)}</span>} />}
                  <div className="pt-3 border-t border-border flex gap-2">
                    <Select value={p.status} onValueChange={s => updateStatus(p.id, s)}>
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="destructive" onClick={() => deletePartner(p.id)}><X className="h-4 w-4" /></Button>
                  </div>
                </MobileCard>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.company_name}</TableCell>
                      <TableCell>{p.company_type}</TableCell>
                      <TableCell>{p.contact_person}<br /><span className="text-xs text-muted-foreground">{p.phone}</span></TableCell>
                      <TableCell className="text-xs">{p.email}</TableCell>
                      <TableCell>{p.interest_area || "-"}</TableCell>
                      <TableCell>{p.budget_range || "-"}</TableCell>
                      <TableCell>
                        <Select value={p.status} onValueChange={s => updateStatus(p.id, s)}>
                          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => deletePartner(p.id)}>Delete</Button>
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
