import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUSES = ["new", "verified", "contacted"];

const FarmerRegistrationsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [viewFarmer, setViewFarmer] = useState<any>(null);

  const { data: farmers = [], isLoading } = useQuery({
    queryKey: ["farmer-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("farmer_registrations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("farmer_registrations").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-registrations"] });
      toast({ title: "Status Updated" });
    },
  });

  const exportCSV = () => {
    const headers = ["Name", "Mobile", "Village", "District", "Land Size", "Land Type", "Tree Types", "Irrigation", "Status", "Date"];
    const rows = farmers.map((f: any) => [
      f.full_name, f.mobile, f.village, f.district, f.land_size_acres || "",
      f.land_type || "", (f.interested_tree_types || []).join("; "),
      f.irrigation_available ? "Yes" : "No", f.status, new Date(f.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map((c: any) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "farmer-registrations.csv"; a.click();
  };

  const filtered = farmers.filter((f: any) =>
    f.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.village?.toLowerCase().includes(search.toLowerCase()) ||
    f.district?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => s === "verified" ? "default" : s === "contacted" ? "secondary" : "outline";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search farmers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Farmer Registrations ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Land</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((f: any) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.full_name}</TableCell>
                      <TableCell>{f.mobile}</TableCell>
                      <TableCell>{f.village}</TableCell>
                      <TableCell>{f.district}</TableCell>
                      <TableCell>{f.land_size_acres ? `${f.land_size_acres} acres` : "-"}</TableCell>
                      <TableCell>
                        <Select value={f.status} onValueChange={v => updateStatus.mutate({ id: f.id, status: v })}>
                          <SelectTrigger className="w-28 h-8">
                            <Badge variant={statusColor(f.status)}>{f.status}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setViewFarmer(f)}><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!viewFarmer} onOpenChange={() => setViewFarmer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewFarmer?.full_name}</DialogTitle>
          </DialogHeader>
          {viewFarmer && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Mobile:</span> {viewFarmer.mobile}</div>
                <div><span className="text-muted-foreground">Village:</span> {viewFarmer.village}</div>
                <div><span className="text-muted-foreground">District:</span> {viewFarmer.district}</div>
                <div><span className="text-muted-foreground">Land Size:</span> {viewFarmer.land_size_acres || "-"} acres</div>
                <div><span className="text-muted-foreground">Land Type:</span> {viewFarmer.land_type || "-"}</div>
                <div><span className="text-muted-foreground">Irrigation:</span> {viewFarmer.irrigation_available ? "Yes" : "No"}</div>
              </div>
              <div><span className="text-muted-foreground">Tree Types:</span> {(viewFarmer.interested_tree_types || []).join(", ") || "-"}</div>
              <div><span className="text-muted-foreground">Registered:</span> {new Date(viewFarmer.created_at).toLocaleString()}</div>
              {viewFarmer.land_photo_url && (
                <div>
                  <span className="text-muted-foreground block mb-1">Land Photo:</span>
                  <img src={viewFarmer.land_photo_url} alt="Land" className="w-full max-h-48 object-cover rounded-lg" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerRegistrationsTab;
