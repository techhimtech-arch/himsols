import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Save, X, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types
interface CorporateStat {
  id: string;
  value: string;
  label: string;
  sort_order: number;
  is_active: boolean;
}

interface CorporateBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

interface CorporateSolution {
  id: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  sort_order: number;
  is_active: boolean;
}

interface CorporatePackage {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  is_highlighted: boolean;
  sort_order: number;
  is_active: boolean;
}

interface CorporateTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  sort_order: number;
  is_active: boolean;
}

interface CorporateClient {
  id: string;
  name: string;
  logo_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface CorporateSetting {
  id: string;
  key: string;
  value: string | null;
}

const ICONS = ["Globe", "Heart", "Award", "Users", "TrendingUp", "Shield", "Gift", "TreeDeciduous", "Calendar", "Sparkles", "Target", "Handshake"];

export const CorporateTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all data
  const { data: stats = [] } = useQuery({
    queryKey: ["corporate-stats-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corporate_stats")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as CorporateStat[];
    },
  });

  const { data: benefits = [] } = useQuery({
    queryKey: ["corporate-benefits-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corporate_benefits")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as CorporateBenefit[];
    },
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ["corporate-solutions-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corporate_solutions")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as CorporateSolution[];
    },
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["corporate-packages-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corporate_packages")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as CorporatePackage[];
    },
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ["corporate-testimonials-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corporate_testimonials")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as CorporateTestimonial[];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["corporate-clients-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corporate_clients")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as CorporateClient[];
    },
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["corporate-settings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corporate_settings")
        .select("*");
      if (error) throw error;
      return data as CorporateSetting[];
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Corporate Page Management</h2>
      
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <SettingsSection settings={settings} />
        </TabsContent>

        <TabsContent value="stats">
          <StatsSection stats={stats} />
        </TabsContent>

        <TabsContent value="benefits">
          <BenefitsSection benefits={benefits} />
        </TabsContent>

        <TabsContent value="solutions">
          <SolutionsSection solutions={solutions} />
        </TabsContent>

        <TabsContent value="packages">
          <PackagesSection packages={packages} />
        </TabsContent>

        <TabsContent value="testimonials">
          <TestimonialsSection testimonials={testimonials} />
        </TabsContent>

        <TabsContent value="clients">
          <ClientsSection clients={clients} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Settings Section
const SettingsSection = ({ settings }: { settings: CorporateSetting[] }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  const getSettingValue = (key: string) => {
    if (localSettings[key] !== undefined) return localSettings[key];
    const setting = settings.find(s => s.key === key);
    return setting?.value || "";
  };

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("corporate_settings")
        .update({ value })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-settings-admin"] });
      toast({ title: "Setting updated" });
    },
  });

  const settingFields = [
    { key: "hero_title", label: "Hero Title" },
    { key: "hero_subtitle", label: "Hero Subtitle", multiline: true },
    { key: "why_section_title", label: "Why Section Title" },
    { key: "why_section_subtitle", label: "Why Section Subtitle", multiline: true },
    { key: "solutions_title", label: "Solutions Section Title" },
    { key: "solutions_subtitle", label: "Solutions Section Subtitle", multiline: true },
    { key: "packages_title", label: "Packages Section Title" },
    { key: "packages_subtitle", label: "Packages Section Subtitle", multiline: true },
    { key: "testimonials_title", label: "Testimonials Section Title" },
    { key: "testimonials_subtitle", label: "Testimonials Section Subtitle", multiline: true },
    { key: "form_title", label: "Form Section Title" },
    { key: "form_subtitle", label: "Form Section Subtitle", multiline: true },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Content Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {settingFields.map(field => (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <div className="flex gap-2">
              {field.multiline ? (
                <Textarea
                  value={getSettingValue(field.key)}
                  onChange={(e) => setLocalSettings({ ...localSettings, [field.key]: e.target.value })}
                  className="flex-1"
                />
              ) : (
                <Input
                  value={getSettingValue(field.key)}
                  onChange={(e) => setLocalSettings({ ...localSettings, [field.key]: e.target.value })}
                  className="flex-1"
                />
              )}
              <Button
                size="sm"
                onClick={() => updateSetting.mutate({ key: field.key, value: getSettingValue(field.key) })}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Stats Section
const StatsSection = ({ stats }: { stats: CorporateStat[] }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingStat, setEditingStat] = useState<CorporateStat | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const saveStat = useMutation({
    mutationFn: async (stat: Partial<CorporateStat>) => {
      if (stat.id) {
        const { error } = await supabase.from("corporate_stats").update(stat).eq("id", stat.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("corporate_stats").insert([{ value: stat.value!, label: stat.label!, sort_order: stat.sort_order }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-stats-admin"] });
      setEditingStat(null);
      setIsAddingNew(false);
      toast({ title: "Stat saved" });
    },
  });

  const deleteStat = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("corporate_stats").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-stats-admin"] });
      toast({ title: "Stat deleted" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stats</CardTitle>
        <Button size="sm" onClick={() => setIsAddingNew(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Stat
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.map(stat => (
            <div key={stat.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <span className="font-bold text-lg">{stat.value}</span>
                <span className="text-muted-foreground ml-2">{stat.label}</span>
              </div>
              <Switch
                checked={stat.is_active}
                onCheckedChange={(checked) => saveStat.mutate({ id: stat.id, is_active: checked })}
              />
              <Button size="sm" variant="ghost" onClick={() => setEditingStat(stat)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteStat.mutate(stat.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <StatDialog
          stat={editingStat}
          isOpen={!!editingStat || isAddingNew}
          onClose={() => { setEditingStat(null); setIsAddingNew(false); }}
          onSave={(stat) => saveStat.mutate(stat)}
        />
      </CardContent>
    </Card>
  );
};

const StatDialog = ({ stat, isOpen, onClose, onSave }: { stat: CorporateStat | null; isOpen: boolean; onClose: () => void; onSave: (stat: Partial<CorporateStat>) => void }) => {
  const [value, setValue] = useState(stat?.value || "");
  const [label, setLabel] = useState(stat?.label || "");
  const [sortOrder, setSortOrder] = useState(stat?.sort_order || 0);

  useState(() => {
    if (stat) {
      setValue(stat.value);
      setLabel(stat.label);
      setSortOrder(stat.sort_order);
    } else {
      setValue("");
      setLabel("");
      setSortOrder(0);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{stat ? "Edit Stat" : "Add Stat"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Value (e.g., "50+")</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div>
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
          <Button onClick={() => onSave({ id: stat?.id, value, label, sort_order: sortOrder })} className="w-full">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Benefits Section
const BenefitsSection = ({ benefits }: { benefits: CorporateBenefit[] }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CorporateBenefit | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const save = useMutation({
    mutationFn: async (item: Partial<CorporateBenefit>) => {
      if (item.id) {
        const { error } = await supabase.from("corporate_benefits").update(item).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("corporate_benefits").insert([{ icon: item.icon!, title: item.title!, description: item.description!, sort_order: item.sort_order }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-benefits-admin"] });
      setEditing(null);
      setIsAdding(false);
      toast({ title: "Benefit saved" });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("corporate_benefits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-benefits-admin"] });
      toast({ title: "Benefit deleted" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Benefits</CardTitle>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Benefit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {benefits.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.description.substring(0, 60)}...</div>
              </div>
              <Switch
                checked={item.is_active}
                onCheckedChange={(checked) => save.mutate({ id: item.id, is_active: checked })}
              />
              <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <BenefitDialog
          item={editing}
          isOpen={!!editing || isAdding}
          onClose={() => { setEditing(null); setIsAdding(false); }}
          onSave={(item) => save.mutate(item)}
        />
      </CardContent>
    </Card>
  );
};

const BenefitDialog = ({ item, isOpen, onClose, onSave }: { item: CorporateBenefit | null; isOpen: boolean; onClose: () => void; onSave: (item: Partial<CorporateBenefit>) => void }) => {
  const [icon, setIcon] = useState(item?.icon || "Globe");
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [sortOrder, setSortOrder] = useState(item?.sort_order || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Benefit" : "Add Benefit"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Icon</Label>
            <select className="w-full border rounded-md p-2" value={icon} onChange={(e) => setIcon(e.target.value)}>
              {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
          <Button onClick={() => onSave({ id: item?.id, icon, title, description, sort_order: sortOrder })} className="w-full">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Solutions Section
const SolutionsSection = ({ solutions }: { solutions: CorporateSolution[] }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CorporateSolution | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const save = useMutation({
    mutationFn: async (item: Partial<CorporateSolution>) => {
      if (item.id) {
        const { error } = await supabase.from("corporate_solutions").update(item).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("corporate_solutions").insert([{ icon: item.icon!, title: item.title!, description: item.description!, features: item.features, sort_order: item.sort_order }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-solutions-admin"] });
      setEditing(null);
      setIsAdding(false);
      toast({ title: "Solution saved" });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("corporate_solutions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-solutions-admin"] });
      toast({ title: "Solution deleted" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Solutions</CardTitle>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Solution
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {solutions.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.features.length} features</div>
              </div>
              <Switch
                checked={item.is_active}
                onCheckedChange={(checked) => save.mutate({ id: item.id, is_active: checked })}
              />
              <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <SolutionDialog
          item={editing}
          isOpen={!!editing || isAdding}
          onClose={() => { setEditing(null); setIsAdding(false); }}
          onSave={(item) => save.mutate(item)}
        />
      </CardContent>
    </Card>
  );
};

const SolutionDialog = ({ item, isOpen, onClose, onSave }: { item: CorporateSolution | null; isOpen: boolean; onClose: () => void; onSave: (item: Partial<CorporateSolution>) => void }) => {
  const [icon, setIcon] = useState(item?.icon || "Gift");
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [features, setFeatures] = useState(item?.features?.join("\n") || "");
  const [sortOrder, setSortOrder] = useState(item?.sort_order || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Solution" : "Add Solution"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Icon</Label>
            <select className="w-full border rounded-md p-2" value={icon} onChange={(e) => setIcon(e.target.value)}>
              {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Features (one per line)</Label>
            <Textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={4} />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
          <Button onClick={() => onSave({ id: item?.id, icon, title, description, features: features.split("\n").filter(f => f.trim()), sort_order: sortOrder })} className="w-full">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Packages Section
const PackagesSection = ({ packages }: { packages: CorporatePackage[] }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CorporatePackage | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const save = useMutation({
    mutationFn: async (item: Partial<CorporatePackage>) => {
      if (item.id) {
        const { error } = await supabase.from("corporate_packages").update(item).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("corporate_packages").insert([{ name: item.name!, price: item.price!, period: item.period!, description: item.description!, features: item.features, is_highlighted: item.is_highlighted, sort_order: item.sort_order }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-packages-admin"] });
      setEditing(null);
      setIsAdding(false);
      toast({ title: "Package saved" });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("corporate_packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-packages-admin"] });
      toast({ title: "Package deleted" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Packages</CardTitle>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Package
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {packages.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{item.name} - {item.price}</div>
                <div className="text-sm text-muted-foreground">{item.is_highlighted ? "⭐ Highlighted" : ""}</div>
              </div>
              <Switch
                checked={item.is_active}
                onCheckedChange={(checked) => save.mutate({ id: item.id, is_active: checked })}
              />
              <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <PackageDialog
          item={editing}
          isOpen={!!editing || isAdding}
          onClose={() => { setEditing(null); setIsAdding(false); }}
          onSave={(item) => save.mutate(item)}
        />
      </CardContent>
    </Card>
  );
};

const PackageDialog = ({ item, isOpen, onClose, onSave }: { item: CorporatePackage | null; isOpen: boolean; onClose: () => void; onSave: (item: Partial<CorporatePackage>) => void }) => {
  const [name, setName] = useState(item?.name || "");
  const [price, setPrice] = useState(item?.price || "");
  const [period, setPeriod] = useState(item?.period || "");
  const [description, setDescription] = useState(item?.description || "");
  const [features, setFeatures] = useState(item?.features?.join("\n") || "");
  const [isHighlighted, setIsHighlighted] = useState(item?.is_highlighted || false);
  const [sortOrder, setSortOrder] = useState(item?.sort_order || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Package" : "Add Package"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Price</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="₹25,000" />
            </div>
            <div>
              <Label>Period</Label>
              <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="onwards" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Features (one per line)</Label>
            <Textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={4} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isHighlighted} onCheckedChange={setIsHighlighted} />
            <Label>Highlighted (Most Popular)</Label>
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
          <Button onClick={() => onSave({ id: item?.id, name, price, period, description, features: features.split("\n").filter(f => f.trim()), is_highlighted: isHighlighted, sort_order: sortOrder })} className="w-full">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Testimonials Section
const TestimonialsSection = ({ testimonials }: { testimonials: CorporateTestimonial[] }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CorporateTestimonial | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const save = useMutation({
    mutationFn: async (item: Partial<CorporateTestimonial>) => {
      if (item.id) {
        const { error } = await supabase.from("corporate_testimonials").update(item).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("corporate_testimonials").insert([{ quote: item.quote!, name: item.name!, role: item.role!, company: item.company!, sort_order: item.sort_order }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-testimonials-admin"] });
      setEditing(null);
      setIsAdding(false);
      toast({ title: "Testimonial saved" });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("corporate_testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-testimonials-admin"] });
      toast({ title: "Testimonial deleted" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Testimonials</CardTitle>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Testimonial
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {testimonials.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{item.name} - {item.company}</div>
                <div className="text-sm text-muted-foreground">"{item.quote.substring(0, 50)}..."</div>
              </div>
              <Switch
                checked={item.is_active}
                onCheckedChange={(checked) => save.mutate({ id: item.id, is_active: checked })}
              />
              <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <TestimonialDialog
          item={editing}
          isOpen={!!editing || isAdding}
          onClose={() => { setEditing(null); setIsAdding(false); }}
          onSave={(item) => save.mutate(item)}
        />
      </CardContent>
    </Card>
  );
};

const TestimonialDialog = ({ item, isOpen, onClose, onSave }: { item: CorporateTestimonial | null; isOpen: boolean; onClose: () => void; onSave: (item: Partial<CorporateTestimonial>) => void }) => {
  const [quote, setQuote] = useState(item?.quote || "");
  const [name, setName] = useState(item?.name || "");
  const [role, setRole] = useState(item?.role || "");
  const [company, setCompany] = useState(item?.company || "");
  const [sortOrder, setSortOrder] = useState(item?.sort_order || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Quote</Label>
            <Textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={3} />
          </div>
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div>
            <Label>Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
          <Button onClick={() => onSave({ id: item?.id, quote, name, role, company, sort_order: sortOrder })} className="w-full">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Clients Section
const ClientsSection = ({ clients }: { clients: CorporateClient[] }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CorporateClient | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const save = useMutation({
    mutationFn: async (item: Partial<CorporateClient>) => {
      if (item.id) {
        const { error } = await supabase.from("corporate_clients").update(item).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("corporate_clients").insert([{ name: item.name!, logo_url: item.logo_url, sort_order: item.sort_order }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-clients-admin"] });
      setEditing(null);
      setIsAdding(false);
      toast({ title: "Client saved" });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("corporate_clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-clients-admin"] });
      toast({ title: "Client deleted" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Client Logos</CardTitle>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Client
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clients.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
              </div>
              <Switch
                checked={item.is_active}
                onCheckedChange={(checked) => save.mutate({ id: item.id, is_active: checked })}
              />
              <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <ClientDialog
          item={editing}
          isOpen={!!editing || isAdding}
          onClose={() => { setEditing(null); setIsAdding(false); }}
          onSave={(item) => save.mutate(item)}
        />
      </CardContent>
    </Card>
  );
};

const ClientDialog = ({ item, isOpen, onClose, onSave }: { item: CorporateClient | null; isOpen: boolean; onClose: () => void; onSave: (item: Partial<CorporateClient>) => void }) => {
  const [name, setName] = useState(item?.name || "");
  const [logoUrl, setLogoUrl] = useState(item?.logo_url || "");
  const [sortOrder, setSortOrder] = useState(item?.sort_order || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Client" : "Add Client"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Company Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Logo URL (optional)</Label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
          <Button onClick={() => onSave({ id: item?.id, name, logo_url: logoUrl || null, sort_order: sortOrder })} className="w-full">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CorporateTab;
