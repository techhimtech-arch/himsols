import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Menu, Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ICONS = [
  "Home", "TreePine", "Heart", "ShoppingBag", "Leaf", "Wrench", "Gift", "FileText", 
  "Building2", "Phone", "Mail", "MapPin", "Users", "Settings", "Globe", "Store",
  "Recycle", "Image", "Search", "Info", "Calendar", "Award"
];

interface NavItem {
  id: string;
  label: string;
  label_hi: string | null;
  path: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  is_visible_mobile: boolean;
}

export const NavigationTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    label_hi: "",
    path: "",
    icon: "Link",
    sort_order: 0,
    is_visible_mobile: true,
  });

  const { data: navItems = [], isLoading } = useQuery({
    queryKey: ["admin-navigation-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as NavItem[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: { id?: string; label: string; label_hi: string | null; path: string; icon: string; sort_order: number; is_visible_mobile: boolean }) => {
      if (item.id) {
        const { error } = await supabase.from("navigation_items").update(item).eq("id", item.id);
        if (error) throw error;
      } else {
        const { label, label_hi, path, icon, sort_order, is_visible_mobile } = item;
        const { error } = await supabase.from("navigation_items").insert([{ label, label_hi, path, icon, sort_order, is_visible_mobile }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-navigation-items"] });
      queryClient.invalidateQueries({ queryKey: ["navigation-items"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({ title: "Navigation item saved" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("navigation_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-navigation-items"] });
      queryClient.invalidateQueries({ queryKey: ["navigation-items"] });
      toast({ title: "Navigation item deleted" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("navigation_items").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-navigation-items"] });
      queryClient.invalidateQueries({ queryKey: ["navigation-items"] });
    },
  });

  const resetForm = () => {
    setFormData({ label: "", label_hi: "", path: "", icon: "Link", sort_order: 0, is_visible_mobile: true });
  };

  const openEditDialog = (item: NavItem) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      label_hi: item.label_hi || "",
      path: item.path,
      icon: item.icon,
      sort_order: item.sort_order,
      is_visible_mobile: item.is_visible_mobile,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      id: editingItem?.id,
      ...formData,
      label_hi: formData.label_hi || null,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Menu className="h-5 w-5" />
          Navigation Management
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingItem(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Nav Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Navigation Item" : "Add Navigation Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label (English) *</Label>
                  <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="Home" />
                </div>
                <div className="space-y-2">
                  <Label>Label (Hindi)</Label>
                  <Input value={formData.label_hi} onChange={(e) => setFormData({ ...formData, label_hi: e.target.value })} placeholder="होम" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Path *</Label>
                <Input value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} placeholder="/tree-plantation" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select value={formData.icon} onValueChange={(val) => setFormData({ ...formData, icon: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Show on Mobile</Label>
                <Switch checked={formData.is_visible_mobile} onCheckedChange={(checked) => setFormData({ ...formData, is_visible_mobile: checked })} />
              </div>
              <Button onClick={handleSave} className="w-full" disabled={!formData.label || !formData.path}>
                {editingItem ? "Update" : "Add"} Navigation Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : navItems.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No navigation items</TableCell></TableRow>
              ) : (
                navItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        {item.sort_order}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.label}</div>
                      {item.label_hi && <div className="text-xs text-muted-foreground">{item.label_hi}</div>}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.path}</TableCell>
                    <TableCell>{item.icon}</TableCell>
                    <TableCell>
                      {item.is_visible_mobile ? (
                        <Smartphone className="h-4 w-4 text-green-500" />
                      ) : (
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={(checked) => toggleActive.mutate({ id: item.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
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
    </div>
  );
};
