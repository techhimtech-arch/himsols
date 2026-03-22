import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, IndianRupee } from "lucide-react";

interface ScrapType {
  id: string;
  name: string;
  name_hi: string | null;
  category: string | null;
  rate_per_kg: number;
  unit: string;
  is_active: boolean;
  sort_order: number;
}

export const ScrapTypesTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ScrapType | null>(null);
  const [form, setForm] = useState({ name: "", name_hi: "", category: "", rate_per_kg: "", unit: "kg", sort_order: "0" });

  const { data: types = [], isLoading } = useQuery({
    queryKey: ["admin-scrap-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrap_types")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ScrapType[];
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", name_hi: "", category: "", rate_per_kg: "", unit: "kg", sort_order: "0" });
    setDialogOpen(true);
  };

  const openEdit = (t: ScrapType) => {
    setEditing(t);
    setForm({
      name: t.name,
      name_hi: t.name_hi || "",
      category: t.category || "",
      rate_per_kg: String(t.rate_per_kg),
      unit: t.unit,
      sort_order: String(t.sort_order),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.rate_per_kg) {
      toast({ title: "Error", description: "Name and rate are required", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name,
      name_hi: form.name_hi || null,
      category: form.category || null,
      rate_per_kg: Number(form.rate_per_kg),
      unit: form.unit,
      sort_order: Number(form.sort_order),
    };
    try {
      if (editing) {
        const { error } = await supabase.from("scrap_types").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Scrap type updated." });
      } else {
        const { error } = await supabase.from("scrap_types").insert(payload);
        if (error) throw error;
        toast({ title: "Added", description: "Scrap type added." });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-scrap-types"] });
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("scrap_types").update({ is_active: !current }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-scrap-types"] });
    }
  };

  if (isLoading) return <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg md:text-xl">Scrap Types & Rates</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Type</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Scrap Type</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Name (EN) *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Name (HI)</Label><Input value={form.name_hi} onChange={e => setForm(p => ({ ...p, name_hi: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Metal, Paper..." /></div>
                <div><Label>Rate (₹/kg) *</Label><Input type="number" value={form.rate_per_kg} onChange={e => setForm(p => ({ ...p, rate_per_kg: e.target.value }))} /></div>
                <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} /></div>
              </div>
              <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} /></div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"}</Button>
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
                <TableHead>Hindi</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rate (₹/kg)</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.name_hi || "-"}</TableCell>
                  <TableCell>{t.category || "-"}</TableCell>
                  <TableCell><span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{t.rate_per_kg}</span></TableCell>
                  <TableCell>{t.unit}</TableCell>
                  <TableCell><Switch checked={t.is_active} onCheckedChange={() => toggleActive(t.id, t.is_active)} /></TableCell>
                  <TableCell><Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
