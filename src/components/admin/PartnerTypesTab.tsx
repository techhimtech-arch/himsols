import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";

interface PartnerType {
  id: string;
  icon: string;
  label: string;
  sort_order: number;
  is_active: boolean;
}

// Common icons for partner types
const availableIcons = [
  "Building2", "School", "Users2", "Leaf", "Heart", "Home", "Building", 
  "GraduationCap", "TreePine", "Sprout", "HandHeart", "Users", "Globe",
  "Store", "Factory", "Landmark", "Church", "Hospital", "LibraryBig"
];

export const PartnerTypesTab = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerType | null>(null);
  const [formData, setFormData] = useState({ icon: "Building2", label: "" });

  const { data: partnerTypes = [], isLoading } = useQuery({
    queryKey: ["partner-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_types")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as PartnerType[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { icon: string; label: string; id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("partner_types")
          .update({ icon: data.icon, label: data.label })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const maxOrder = partnerTypes.length > 0 
          ? Math.max(...partnerTypes.map(p => p.sort_order)) + 1 
          : 0;
        const { error } = await supabase
          .from("partner_types")
          .insert({ icon: data.icon, label: data.label, sort_order: maxOrder });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-types"] });
      toast.success(editingPartner ? "Partner type updated" : "Partner type added");
      closeDialog();
    },
    onError: (error) => {
      toast.error("Failed to save partner type");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partner_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-types"] });
      toast.success("Partner type deleted");
    },
    onError: () => toast.error("Failed to delete partner type"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("partner_types")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-types"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPartner(null);
    setFormData({ icon: "Building2", label: "" });
  };

  const openEditDialog = (partner: PartnerType) => {
    setEditingPartner(partner);
    setFormData({ icon: partner.icon, label: partner.label });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      toast.error("Label is required");
      return;
    }
    saveMutation.mutate({ ...formData, id: editingPartner?.id });
  };

  const renderIcon = (iconName: string, className?: string) => {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Partner Types</h3>
          <p className="text-sm text-muted-foreground">
            Manage partner types shown in the "Trusted by communities" section
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ icon: "Building2", label: "" })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Partner Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPartner ? "Edit Partner Type" : "Add Partner Type"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {renderIcon(formData.icon, "h-4 w-4")}
                        <span>{formData.icon}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableIcons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          {renderIcon(icon, "h-4 w-4")}
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., 5 Panchayats"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {partnerTypes.map((partner) => (
          <Card key={partner.id} className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {renderIcon(partner.icon, "h-5 w-5 text-primary")}
                    </div>
                    <span className="font-medium">{partner.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${partner.id}`} className="text-sm text-muted-foreground">
                      Active
                    </Label>
                    <Switch
                      id={`active-${partner.id}`}
                      checked={partner.is_active}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({ id: partner.id, is_active: checked })
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(partner)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(partner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {partnerTypes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No partner types yet. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
};
