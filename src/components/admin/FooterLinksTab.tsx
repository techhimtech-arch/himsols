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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link2, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
  { value: "services", label: "Services" },
  { value: "company", label: "Company" },
  { value: "support", label: "Support" },
  { value: "social", label: "Social Media" },
];

const ICONS = [
  "TreePine", "Recycle", "Leaf", "ShoppingBag", "Info", "FileText", "Image", "Building2",
  "Phone", "Gift", "Search", "Facebook", "Instagram", "Twitter", "Youtube", "Linkedin", "Mail"
];

interface FooterLink {
  id: string;
  section: string;
  label: string;
  label_hi: string | null;
  url: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  is_external: boolean;
}

export const FooterLinksTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FooterLink | null>(null);
  const [activeSection, setActiveSection] = useState("services");
  const [formData, setFormData] = useState({
    section: "services",
    label: "",
    label_hi: "",
    url: "",
    icon: "",
    sort_order: 0,
    is_external: false,
  });

  const { data: footerLinks = [], isLoading } = useQuery({
    queryKey: ["admin-footer-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("footer_links")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as FooterLink[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: { id?: string; section: string; label: string; label_hi: string | null; url: string; icon: string | null; sort_order: number; is_external: boolean }) => {
      if (item.id) {
        const { error } = await supabase.from("footer_links").update(item).eq("id", item.id);
        if (error) throw error;
      } else {
        const { section, label, label_hi, url, icon, sort_order, is_external } = item;
        const { error } = await supabase.from("footer_links").insert([{ section, label, label_hi, url, icon, sort_order, is_external }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["footer-links"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({ title: "Footer link saved" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("footer_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["footer-links"] });
      toast({ title: "Footer link deleted" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("footer_links").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["footer-links"] });
    },
  });

  const resetForm = () => {
    setFormData({ section: "services", label: "", label_hi: "", url: "", icon: "", sort_order: 0, is_external: false });
  };

  const openEditDialog = (item: FooterLink) => {
    setEditingItem(item);
    setFormData({
      section: item.section,
      label: item.label,
      label_hi: item.label_hi || "",
      url: item.url,
      icon: item.icon || "",
      sort_order: item.sort_order,
      is_external: item.is_external,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      id: editingItem?.id,
      ...formData,
      label_hi: formData.label_hi || null,
      icon: formData.icon || null,
    });
  };

  const getLinksForSection = (section: string) => footerLinks.filter(link => link.section === section);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Footer Links Management
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingItem(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Footer Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Footer Link" : "Add Footer Link"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Section *</Label>
                <Select value={formData.section} onValueChange={(val) => setFormData({ ...formData, section: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((sec) => (
                      <SelectItem key={sec.value} value={sec.value}>{sec.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label (English) *</Label>
                  <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="Tree Plantation" />
                </div>
                <div className="space-y-2">
                  <Label>Label (Hindi)</Label>
                  <Input value={formData.label_hi} onChange={(e) => setFormData({ ...formData, label_hi: e.target.value })} placeholder="पेड़ लगाना" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL *</Label>
                <Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="/tree-plantation or https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select value={formData.icon} onValueChange={(val) => setFormData({ ...formData, icon: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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
                <Label>External Link (opens in new tab)</Label>
                <Switch checked={formData.is_external} onCheckedChange={(checked) => setFormData({ ...formData, is_external: checked })} />
              </div>
              <Button onClick={handleSave} className="w-full" disabled={!formData.label || !formData.url}>
                {editingItem ? "Update" : "Add"} Footer Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <CardHeader className="pb-0">
            <TabsList className="grid grid-cols-4">
              {SECTIONS.map((sec) => (
                <TabsTrigger key={sec.value} value={sec.value}>
                  {sec.label} ({getLinksForSection(sec.value).length})
                </TabsTrigger>
              ))}
            </TabsList>
          </CardHeader>
          <CardContent className="p-0">
            {SECTIONS.map((sec) => (
              <TabsContent key={sec.value} value={sec.value} className="mt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getLinksForSection(sec.value).length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No links in this section</TableCell></TableRow>
                    ) : (
                      getLinksForSection(sec.value).map((link) => (
                        <TableRow key={link.id}>
                          <TableCell>{link.sort_order}</TableCell>
                          <TableCell>
                            <div className="font-medium">{link.label}</div>
                            {link.label_hi && <div className="text-xs text-muted-foreground">{link.label_hi}</div>}
                          </TableCell>
                          <TableCell className="font-mono text-sm max-w-xs truncate">{link.url}</TableCell>
                          <TableCell>
                            {link.is_external ? (
                              <Badge variant="outline" className="gap-1">
                                <ExternalLink className="h-3 w-3" /> External
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Internal</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={link.is_active}
                              onCheckedChange={(checked) => toggleActive.mutate({ id: link.id, is_active: checked })}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => openEditDialog(link)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(link.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};
