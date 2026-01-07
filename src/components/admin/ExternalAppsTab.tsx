import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, GripVertical } from "lucide-react";

interface ExternalApp {
  id: string;
  name: string;
  description: string | null;
  url: string;
  icon: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

export const ExternalAppsTab = () => {
  const [apps, setApps] = useState<ExternalApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ExternalApp | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    icon: "ExternalLink",
    image_url: "",
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    const { data, error } = await supabase
      .from("external_apps")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (error) {
      toast.error("Failed to load apps");
      return;
    }
    setApps(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      url: "",
      icon: "ExternalLink",
      image_url: "",
      is_active: true,
      display_order: apps.length
    });
    setEditingApp(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (app: ExternalApp) => {
    setEditingApp(app);
    setFormData({
      name: app.name,
      description: app.description || "",
      url: app.url,
      icon: app.icon || "ExternalLink",
      image_url: app.image_url || "",
      is_active: app.is_active,
      display_order: app.display_order
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.url) {
      toast.error("Name and URL are required");
      return;
    }

    if (editingApp) {
      const { error } = await supabase
        .from("external_apps")
        .update(formData)
        .eq("id", editingApp.id);
      
      if (error) {
        toast.error("Failed to update app");
        return;
      }
      toast.success("App updated!");
    } else {
      const { error } = await supabase
        .from("external_apps")
        .insert(formData);
      
      if (error) {
        toast.error("Failed to add app");
        return;
      }
      toast.success("App added!");
    }

    setDialogOpen(false);
    resetForm();
    loadApps();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this app?")) return;

    const { error } = await supabase
      .from("external_apps")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete app");
      return;
    }
    toast.success("App deleted!");
    loadApps();
  };

  const toggleActive = async (app: ExternalApp) => {
    const { error } = await supabase
      .from("external_apps")
      .update({ is_active: !app.is_active })
      .eq("id", app.id);
    
    if (error) {
      toast.error("Failed to update app");
      return;
    }
    loadApps();
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">External Himsols Apps</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add App
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingApp ? "Edit App" : "Add New App"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Himsols Carbon Tracker"
                />
              </div>
              <div>
                <Label>URL *</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://carbon.himsols.com"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Track your carbon footprint..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Image URL (optional)</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingApp ? "Update App" : "Add App"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {apps.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No external apps added yet. Click "Add App" to add your other Himsols apps.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {apps.map((app) => (
            <Card key={app.id} className={!app.is_active ? "opacity-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{app.name}</h4>
                        {!app.is_active && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {app.description || app.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={app.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => toggleActive(app)}>
                      <Switch checked={app.is_active} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(app)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
