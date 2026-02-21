import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Check, X } from "lucide-react";
import { MobileCard, MobileCardRow, StatusBadge } from "./MobileCard";

const STATUSES = ["registered", "approved", "active", "inactive"];

export const VillagesTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: villages = [], isLoading } = useQuery({
    queryKey: ["admin-villages"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("villages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const updateData: any = { status };
    if (status === "approved") updateData.approved_at = new Date().toISOString();
    
    const { error } = await (supabase as any).from("villages").update(updateData).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Updated", description: "Village status updated." });
    queryClient.invalidateQueries({ queryKey: ["admin-villages"] });
  };

  const deleteVillage = async (id: string) => {
    if (!confirm("Delete this village?")) return;
    const { error } = await (supabase as any).from("villages").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    queryClient.invalidateQueries({ queryKey: ["admin-villages"] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <MapPin className="h-5 w-5 text-primary" />
          Village Management ({villages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : villages.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No villages registered yet</p>
        ) : (
          <>
            {/* Mobile */}
            <div className="block md:hidden space-y-4">
              {villages.map((v: any) => (
                <MobileCard key={v.id}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{v.name}</span>
                    <StatusBadge status={v.status} />
                  </div>
                  <MobileCardRow label="District" value={`${v.district}, ${v.state}`} />
                  <MobileCardRow label="Contact" value={`${v.contact_person} • ${v.phone}`} />
                  <MobileCardRow label="Trees Requested" value={v.trees_requested || 0} />
                  <MobileCardRow label="Registered" value={new Date(v.created_at).toLocaleDateString()} />
                  <div className="pt-3 border-t border-border flex gap-2">
                    <Select value={v.status} onValueChange={s => updateStatus(v.id, s)}>
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="destructive" onClick={() => deleteVillage(v.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </MobileCard>
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Village</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Trees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {villages.map((v: any) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell>{v.district}, {v.state}</TableCell>
                      <TableCell>{v.contact_person}</TableCell>
                      <TableCell>{v.phone}</TableCell>
                      <TableCell>{v.trees_requested || 0}</TableCell>
                      <TableCell>
                        <Select value={v.status} onValueChange={s => updateStatus(v.id, s)}>
                          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{new Date(v.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => deleteVillage(v.id)}>Delete</Button>
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
