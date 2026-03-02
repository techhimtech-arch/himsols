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
  const [filterState, setFilterState] = useState<string>("all");
  const [filterDistrict, setFilterDistrict] = useState<string>("all");

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

  const uniqueStates = [...new Set(villages.map((v: any) => v.state).filter(Boolean))];
  const uniqueDistricts = [...new Set(
    villages
      .filter((v: any) => filterState === "all" || v.state === filterState)
      .map((v: any) => v.district)
      .filter(Boolean)
  )];

  const filteredVillages = villages.filter((v: any) => {
    if (filterState !== "all" && v.state !== filterState) return false;
    if (filterDistrict !== "all" && v.district !== filterDistrict) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <MapPin className="h-5 w-5 text-primary" />
          Village Management ({filteredVillages.length})
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <Select value={filterState} onValueChange={(v) => { setFilterState(v); setFilterDistrict("all"); }}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All States" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {uniqueStates.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {filterState !== "all" && (
            <Select value={filterDistrict} onValueChange={setFilterDistrict}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All Districts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {uniqueDistricts.map((d: string) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : filteredVillages.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No villages registered yet</p>
        ) : (
          <>
            {/* Mobile */}
            <div className="block md:hidden space-y-4">
              {filteredVillages.map((v: any) => (
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
                  {filteredVillages.map((v: any) => (
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
