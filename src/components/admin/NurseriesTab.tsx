import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Flower2, Plus, X } from "lucide-react";
import { MobileCard, MobileCardRow } from "./MobileCard";

export const NurseriesTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", district: "", state: "Himachal Pradesh", contact_person: "", phone: "", specialization: "" });

  const { data: nurseries = [], isLoading } = useQuery({
    queryKey: ["admin-nurseries"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("nurseries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addNursery = async () => {
    const { error } = await (supabase as any).from("nurseries").insert({
      name: form.name.trim(),
      location: form.location.trim(),
      district: form.district.trim() || null,
      state: form.state,
      contact_person: form.contact_person.trim(),
      phone: form.phone.trim(),
      specialization: form.specialization.trim() || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Added", description: "Nursery added." });
    setOpen(false);
    setForm({ name: "", location: "", district: "", state: "Himachal Pradesh", contact_person: "", phone: "", specialization: "" });
    queryClient.invalidateQueries({ queryKey: ["admin-nurseries"] });
  };

  const toggleVerified = async (id: string, val: boolean) => {
    await (supabase as any).from("nurseries").update({ is_verified: val }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-nurseries"] });
  };

  const toggleActive = async (id: string, val: boolean) => {
    await (supabase as any).from("nurseries").update({ is_active: val }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-nurseries"] });
  };

  const deleteNursery = async (id: string) => {
    if (!confirm("Delete this nursery?")) return;
    await (supabase as any).from("nurseries").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-nurseries"] });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Flower2 className="h-5 w-5 text-primary" />
          Nurseries ({nurseries.length})
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Nursery</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Nursery</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Location *</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>District</Label><Input value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} /></div>
                <div><Label>State</Label><Input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} /></div>
              </div>
              <div><Label>Contact Person *</Label><Input value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} /></div>
              <div><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div><Label>Specialization</Label><Input value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} placeholder="e.g. Fruit Trees, Ornamental" /></div>
              <Button className="w-full" onClick={addNursery} disabled={!form.name || !form.location || !form.contact_person || !form.phone}>Add Nursery</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : nurseries.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No nurseries added yet</p>
        ) : (
          <>
            <div className="block md:hidden space-y-4">
              {nurseries.map((n: any) => (
                <MobileCard key={n.id}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{n.name}</span>
                    <div className="flex gap-2 items-center">
                      {n.is_verified && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Verified</span>}
                      {!n.is_active && <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                  </div>
                  <MobileCardRow label="Location" value={`${n.location}${n.district ? `, ${n.district}` : ""}`} />
                  <MobileCardRow label="Contact" value={`${n.contact_person} • ${n.phone}`} />
                  {n.specialization && <MobileCardRow label="Specialization" value={n.specialization} />}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1 text-xs"><Switch checked={n.is_verified} onCheckedChange={v => toggleVerified(n.id, v)} />Verified</label>
                      <label className="flex items-center gap-1 text-xs"><Switch checked={n.is_active} onCheckedChange={v => toggleActive(n.id, v)} />Active</label>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => deleteNursery(n.id)}><X className="h-4 w-4" /></Button>
                  </div>
                </MobileCard>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nurseries.map((n: any) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.name}</TableCell>
                      <TableCell>{n.location}{n.district ? `, ${n.district}` : ""}</TableCell>
                      <TableCell>{n.contact_person}<br /><span className="text-xs text-muted-foreground">{n.phone}</span></TableCell>
                      <TableCell>{n.specialization || "-"}</TableCell>
                      <TableCell><Switch checked={n.is_verified} onCheckedChange={v => toggleVerified(n.id, v)} /></TableCell>
                      <TableCell><Switch checked={n.is_active} onCheckedChange={v => toggleActive(n.id, v)} /></TableCell>
                      <TableCell><Button size="sm" variant="destructive" onClick={() => deleteNursery(n.id)}>Delete</Button></TableCell>
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
