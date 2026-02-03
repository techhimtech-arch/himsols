import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Gift } from "lucide-react";

interface GiftCardPageContent {
  id: string;
  section_key: string;
  title_en: string | null;
  title_hi: string | null;
  description_en: string | null;
  description_hi: string | null;
  icon: string | null;
  link_url: string | null;
  link_text_en: string | null;
  link_text_hi: string | null;
  is_active: boolean;
  sort_order: number;
}

const ICON_OPTIONS = ["TreePine", "Wallet", "ShoppingBag", "Heart", "Leaf", "Gift"];

export const GiftCardContentTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GiftCardPageContent | null>(null);

  const [formData, setFormData] = useState({
    section_key: "",
    title_en: "",
    title_hi: "",
    description_en: "",
    description_hi: "",
    icon: "Gift",
    link_url: "",
    link_text_en: "",
    link_text_hi: "",
    is_active: true,
    sort_order: 0,
  });

  const { data: content, isLoading } = useQuery({
    queryKey: ["admin-gift-card-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gift_card_page_content")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as GiftCardPageContent[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("gift_card_page_content").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gift-card-content"] });
      queryClient.invalidateQueries({ queryKey: ["gift-card-page-content"] });
      toast({ title: "Content added successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase.from("gift_card_page_content").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gift-card-content"] });
      queryClient.invalidateQueries({ queryKey: ["gift-card-page-content"] });
      toast({ title: "Content updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gift_card_page_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gift-card-content"] });
      queryClient.invalidateQueries({ queryKey: ["gift-card-page-content"] });
      toast({ title: "Content deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      section_key: "",
      title_en: "",
      title_hi: "",
      description_en: "",
      description_hi: "",
      icon: "Gift",
      link_url: "",
      link_text_en: "",
      link_text_hi: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: GiftCardPageContent) => {
    setEditingItem(item);
    setFormData({
      section_key: item.section_key,
      title_en: item.title_en || "",
      title_hi: item.title_hi || "",
      description_en: item.description_en || "",
      description_hi: item.description_hi || "",
      icon: item.icon || "Gift",
      link_url: item.link_url || "",
      link_text_en: item.link_text_en || "",
      link_text_hi: item.link_text_hi || "",
      is_active: item.is_active,
      sort_order: item.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleActive = (item: GiftCardPageContent) => {
    updateMutation.mutate({ id: item.id, data: { is_active: !item.is_active } });
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Gift Card Page Content
          </h2>
          <p className="text-muted-foreground">Manage the usage sections shown on Gift Cards page</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Content" : "Add New Content"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Key (unique identifier)</Label>
                  <Input
                    value={formData.section_key}
                    onChange={(e) => setFormData({ ...formData, section_key: e.target.value })}
                    placeholder="e.g., usage_marketplace"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="Title in English"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (Hindi)</Label>
                  <Input
                    value={formData.title_hi}
                    onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                    placeholder="Hindi में Title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder="Description in English"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Hindi)</Label>
                  <Textarea
                    value={formData.description_hi}
                    onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                    placeholder="Hindi में Description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Link URL (optional)</Label>
                <Input
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/campaigns or /marketplace"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link Text (English)</Label>
                  <Input
                    value={formData.link_text_en}
                    onChange={(e) => setFormData({ ...formData, link_text_en: e.target.value })}
                    placeholder="View Campaigns"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link Text (Hindi)</Label>
                  <Input
                    value={formData.link_text_hi}
                    onChange={(e) => setFormData({ ...formData, link_text_hi: e.target.value })}
                    placeholder="Campaigns देखें"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingItem ? "Update" : "Create"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {content?.map((item) => (
          <Card key={item.id} className={!item.is_active ? "opacity-50" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.title_en}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.section_key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description_en}</p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Icon: {item.icon}</span>
                {item.link_url && <span>Link: {item.link_url}</span>}
                <span>Order: {item.sort_order}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
