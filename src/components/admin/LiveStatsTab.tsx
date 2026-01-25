import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, Loader2, TrendingUp, TreePine, MapPin, Users, Recycle, Building2, Leaf, Award } from "lucide-react";

interface LiveStat {
  id: string;
  icon: string;
  value: number;
  suffix: string;
  label: string;
  sublabel: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
}

const ICON_OPTIONS = [
  { value: "TreePine", label: "Tree", icon: TreePine },
  { value: "MapPin", label: "Location", icon: MapPin },
  { value: "Users", label: "Users", icon: Users },
  { value: "Recycle", label: "Recycle", icon: Recycle },
  { value: "Building2", label: "Building", icon: Building2 },
  { value: "Leaf", label: "Leaf", icon: Leaf },
  { value: "Award", label: "Award", icon: Award },
  { value: "TrendingUp", label: "Trending", icon: TrendingUp },
];

const COLOR_OPTIONS = [
  { value: "primary", label: "Primary (Green)" },
  { value: "secondary", label: "Secondary (Brown)" },
];

export const LiveStatsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<LiveStat | null>(null);
  const [formData, setFormData] = useState({
    icon: "TreePine",
    value: 0,
    suffix: "",
    label: "",
    sublabel: "",
    color: "primary",
    sort_order: 0,
    is_active: true,
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-live-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_stats")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as LiveStat[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("live_stats")
          .update({
            icon: data.icon,
            value: data.value,
            suffix: data.suffix,
            label: data.label,
            sublabel: data.sublabel || null,
            color: data.color,
            sort_order: data.sort_order,
            is_active: data.is_active,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("live_stats").insert({
          icon: data.icon,
          value: data.value,
          suffix: data.suffix,
          label: data.label,
          sublabel: data.sublabel || null,
          color: data.color,
          sort_order: data.sort_order,
          is_active: data.is_active,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-live-stats"] });
      queryClient.invalidateQueries({ queryKey: ["live-stats"] });
      setIsDialogOpen(false);
      setEditingStat(null);
      resetForm();
      toast({ title: "Success", description: "Stat saved successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("live_stats").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-live-stats"] });
      queryClient.invalidateQueries({ queryKey: ["live-stats"] });
      toast({ title: "Success", description: "Stat deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      icon: "TreePine",
      value: 0,
      suffix: "",
      label: "",
      sublabel: "",
      color: "primary",
      sort_order: 0,
      is_active: true,
    });
  };

  const handleEdit = (stat: LiveStat) => {
    setEditingStat(stat);
    setFormData({
      icon: stat.icon,
      value: stat.value,
      suffix: stat.suffix || "",
      label: stat.label,
      sublabel: stat.sublabel || "",
      color: stat.color,
      sort_order: stat.sort_order,
      is_active: stat.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({ ...formData, id: editingStat?.id });
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName);
    return iconOption?.icon || TreePine;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Live Stats</h3>
          <p className="text-sm text-muted-foreground">
            Manage the stats shown in "Real Work, Real Numbers" section on homepage
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingStat(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Stat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStat ? "Edit Stat" : "Add New Stat"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="h-4 w-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Value (Number)</Label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Suffix (+, T, K, etc.)</Label>
                  <Input
                    value={formData.suffix}
                    onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                    placeholder="e.g., +, T, K"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Label (Main Text)</Label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Trees Planted"
                />
              </div>
              <div className="space-y-2">
                <Label>Sublabel (Small Text)</Label>
                <Input
                  value={formData.sublabel}
                  onChange={(e) => setFormData({ ...formData, sublabel: e.target.value })}
                  placeholder="e.g., This Year"
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
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full">
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stats?.map((stat) => {
          const IconComponent = getIconComponent(stat.icon);
          return (
            <Card key={stat.id} className={!stat.is_active ? "opacity-50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                      <IconComponent className={`h-5 w-5 ${stat.color === 'primary' ? 'text-primary' : 'text-secondary'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        {stat.value}{stat.suffix}
                      </CardTitle>
                      <p className="text-sm font-medium">{stat.label}</p>
                      <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(stat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(stat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
