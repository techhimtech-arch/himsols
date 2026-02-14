import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ABOUT_SECTION_KEYS = ["about_hero", "about_mission", "about_values", "about_cta"];
const ABOUT_ITEM_KEYS = ["about_values", "about_milestones"];

export const AboutPageTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["about-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .in("section_key", ABOUT_SECTION_KEYS)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["about-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_items")
        .select("*")
        .in("section_key", ABOUT_ITEM_KEYS)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const updateSection = useMutation({
    mutationFn: async (section: any) => {
      const { id, ...rest } = section;
      const { error } = await supabase
        .from("homepage_sections")
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-sections"] });
      toast({ title: "Section updated!" });
    },
  });

  const updateItem = useMutation({
    mutationFn: async (item: any) => {
      const { id, ...rest } = item;
      const { error } = await supabase
        .from("homepage_items")
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-items"] });
      toast({ title: "Item updated!" });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homepage_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-items"] });
      toast({ title: "Item deleted" });
    },
  });

  const addItem = useMutation({
    mutationFn: async (sectionKey: string) => {
      const { error } = await supabase.from("homepage_items").insert({
        section_key: sectionKey,
        title_en: "New Item",
        title_hi: "",
        description_en: "",
        description_hi: "",
        icon: "TreePine",
        sort_order: (items.filter(i => i.section_key === sectionKey).length + 1),
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-items"] });
      toast({ title: "Item added!" });
    },
  });

  if (sectionsLoading || itemsLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">About Us Page Content</h2>

      {/* Sections */}
      {sections.map((section) => (
        <SectionEditor key={section.id} section={section} onSave={(s) => updateSection.mutate(s)} saving={updateSection.isPending} />
      ))}

      {/* Values Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Values (about_values)</CardTitle>
          <Button size="sm" onClick={() => addItem.mutate("about_values")}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          <ItemsTable items={items.filter(i => i.section_key === "about_values")} onSave={(i) => updateItem.mutate(i)} onDelete={(id) => deleteItem.mutate(id)} />
        </CardContent>
      </Card>

      {/* Milestones Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Milestones (about_milestones)</CardTitle>
          <Button size="sm" onClick={() => addItem.mutate("about_milestones")}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          <ItemsTable items={items.filter(i => i.section_key === "about_milestones")} onSave={(i) => updateItem.mutate(i)} onDelete={(id) => deleteItem.mutate(id)} />
        </CardContent>
      </Card>
    </div>
  );
};

const SectionEditor = ({ section, onSave, saving }: { section: any; onSave: (s: any) => void; saving: boolean }) => {
  const [data, setData] = useState(section);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{section.section_key}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Title (EN)</Label>
            <Input value={data.title_en || ""} onChange={(e) => setData({ ...data, title_en: e.target.value })} />
          </div>
          <div>
            <Label>Title (HI)</Label>
            <Input value={data.title_hi || ""} onChange={(e) => setData({ ...data, title_hi: e.target.value })} />
          </div>
          <div>
            <Label>Subtitle (EN)</Label>
            <Textarea value={data.subtitle_en || ""} onChange={(e) => setData({ ...data, subtitle_en: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>Subtitle (HI)</Label>
            <Textarea value={data.subtitle_hi || ""} onChange={(e) => setData({ ...data, subtitle_hi: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>Content (EN)</Label>
            <Textarea value={data.content_en || ""} onChange={(e) => setData({ ...data, content_en: e.target.value })} rows={3} />
          </div>
          <div>
            <Label>Content (HI)</Label>
            <Textarea value={data.content_hi || ""} onChange={(e) => setData({ ...data, content_hi: e.target.value })} rows={3} />
          </div>
          <div>
            <Label>CTA Text (EN)</Label>
            <Input value={data.cta_text_en || ""} onChange={(e) => setData({ ...data, cta_text_en: e.target.value })} />
          </div>
          <div>
            <Label>CTA Link</Label>
            <Input value={data.cta_link || ""} onChange={(e) => setData({ ...data, cta_link: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={data.is_active} onCheckedChange={(v) => setData({ ...data, is_active: v })} />
            <Label>Active</Label>
          </div>
          <Button size="sm" onClick={() => onSave(data)} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ItemsTable = ({ items, onSave, onDelete }: { items: any[]; onSave: (i: any) => void; onDelete: (id: string) => void }) => {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  const startEdit = (item: any) => {
    setEditing(item.id);
    setEditData({ ...item });
  };

  const saveEdit = () => {
    if (editData) onSave(editData);
    setEditing(null);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Icon</TableHead>
            <TableHead>Title EN</TableHead>
            <TableHead>Title HI</TableHead>
            <TableHead>Desc EN</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              {editing === item.id ? (
                <>
                  <TableCell><Input value={editData.icon || ""} onChange={(e) => setEditData({ ...editData, icon: e.target.value })} className="w-20" /></TableCell>
                  <TableCell><Input value={editData.title_en || ""} onChange={(e) => setEditData({ ...editData, title_en: e.target.value })} /></TableCell>
                  <TableCell><Input value={editData.title_hi || ""} onChange={(e) => setEditData({ ...editData, title_hi: e.target.value })} /></TableCell>
                  <TableCell><Input value={editData.description_en || ""} onChange={(e) => setEditData({ ...editData, description_en: e.target.value })} /></TableCell>
                  <TableCell><Input type="number" value={editData.sort_order || 0} onChange={(e) => setEditData({ ...editData, sort_order: parseInt(e.target.value) })} className="w-16" /></TableCell>
                  <TableCell><Switch checked={editData.is_active} onCheckedChange={(v) => setEditData({ ...editData, is_active: v })} /></TableCell>
                  <TableCell><Button size="sm" onClick={saveEdit}><Save className="h-3 w-3" /></Button></TableCell>
                </>
              ) : (
                <>
                  <TableCell className="text-xs">{item.icon}</TableCell>
                  <TableCell className="text-sm">{item.title_en}</TableCell>
                  <TableCell className="text-sm">{item.title_hi}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{item.description_en}</TableCell>
                  <TableCell>{item.sort_order}</TableCell>
                  <TableCell>{item.is_active ? "✅" : "❌"}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
