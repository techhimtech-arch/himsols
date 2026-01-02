import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, TreePine, MapPin, Calendar, Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  location: string;
  icon: string;
  status: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const ICON_OPTIONS = [
  { value: "TreePine", label: "Tree", icon: TreePine },
  { value: "MapPin", label: "Location", icon: MapPin },
  { value: "Calendar", label: "Calendar", icon: Calendar },
  { value: "Activity", label: "Activity", icon: Activity },
];

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
];

const TYPE_OPTIONS = [
  { value: "plantation", label: "Plantation" },
  { value: "onboarding", label: "Onboarding" },
  { value: "event", label: "Event" },
  { value: "awareness", label: "Awareness" },
];

export const ActivitiesTab = () => {
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [formData, setFormData] = useState({
    type: "plantation",
    title: "",
    location: "",
    icon: "TreePine",
    status: "completed",
    sort_order: 0,
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error("Error loading activities:", error);
      toast({
        title: "Error",
        description: "Failed to load activities.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingActivity) {
        const { error } = await supabase
          .from("activities")
          .update(formData)
          .eq("id", editingActivity.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Activity updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("activities")
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Activity added successfully.",
        });
      }

      resetForm();
      loadActivities();
    } catch (error: any) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save activity.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (activity: ActivityItem) => {
    setEditingActivity(activity);
    setFormData({
      type: activity.type,
      title: activity.title,
      location: activity.location,
      icon: activity.icon,
      status: activity.status,
      sort_order: activity.sort_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    try {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity deleted successfully.",
      });

      loadActivities();
    } catch (error: any) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete activity.",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("activities")
        .update({ is_active: !currentState })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Activity ${!currentState ? "activated" : "deactivated"}.`,
      });

      loadActivities();
    } catch (error: any) {
      console.error("Error toggling activity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update activity.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingActivity(null);
    setFormData({
      type: "plantation",
      title: "",
      location: "",
      icon: "TreePine",
      status: "completed",
      sort_order: 0,
    });
    setDialogOpen(false);
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find(opt => opt.value === iconName);
    if (iconOption) {
      const IconComponent = iconOption.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg md:text-xl">Recent Activities</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-1" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingActivity ? "Edit Activity" : "Add New Activity"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., 100 Trees Planted"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Manali Block, Kullu"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingActivity ? "Update" : "Add"} Activity
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No activities found. Add your first activity!
          </p>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 border border-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIconComponent(activity.icon)}
                      <span className="font-medium">{activity.title}</span>
                    </div>
                    <Switch
                      checked={activity.is_active}
                      onCheckedChange={() => toggleActive(activity.id, activity.is_active)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.location}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'active' 
                        ? 'bg-secondary/10 text-secondary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {activity.status}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(activity)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(activity.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Icon</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{getIconComponent(activity.icon)}</TableCell>
                      <TableCell className="font-medium">{activity.title}</TableCell>
                      <TableCell>{activity.location}</TableCell>
                      <TableCell className="capitalize">{activity.type}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.status === 'active' 
                            ? 'bg-secondary/10 text-secondary' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {activity.status}
                        </span>
                      </TableCell>
                      <TableCell>{activity.sort_order}</TableCell>
                      <TableCell>
                        <Switch
                          checked={activity.is_active}
                          onCheckedChange={() => toggleActive(activity.id, activity.is_active)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(activity)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(activity.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
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
