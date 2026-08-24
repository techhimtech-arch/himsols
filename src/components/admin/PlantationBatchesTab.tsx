import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getDeviceLocation, GOOGLE_MAPS_LINK } from "@/lib/exifGps";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Crosshair,
  ExternalLink,
  MapPin,
  Trees,
} from "lucide-react";

interface PlantationBatch {
  id: string;
  batch_code: string;
  title: string | null;
  species: string;
  tree_count: number;
  plantation_date: string;
  village: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  trees_alive: number | null;
  review_date: string | null;
  notes: string | null;
  status: string;
  is_public: boolean;
}

const STATUSES = ["planted", "verified", "completed"];

const emptyForm = {
  batch_code: "",
  title: "",
  species: "Mixed native",
  tree_count: "",
  plantation_date: new Date().toISOString().slice(0, 10),
  village: "",
  district: "",
  latitude: "",
  longitude: "",
  trees_alive: "",
  review_date: "",
  notes: "",
  status: "planted",
  is_public: true,
};

const suggestCode = () => {
  const d = new Date();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `HS-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${rand}`;
};

export const PlantationBatchesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [batches, setBatches] = useState<PlantationBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlantationBatch | null>(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [{ data, error }, photosRes] = await Promise.all([
      supabase
        .from("plantation_batches")
        .select("*")
        .order("plantation_date", { ascending: false }),
      supabase.from("plantation_photos").select("batch_id").not("batch_id", "is", null),
    ]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setBatches((data || []) as PlantationBatch[]);
    }

    const counts: Record<string, number> = {};
    (photosRes.data || []).forEach((row: any) => {
      if (row.batch_id) counts[row.batch_id] = (counts[row.batch_id] || 0) + 1;
    });
    setPhotoCounts(counts);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, batch_code: suggestCode() });
    setDialogOpen(true);
  };

  const openEdit = (b: PlantationBatch) => {
    setEditing(b);
    setForm({
      batch_code: b.batch_code,
      title: b.title || "",
      species: b.species,
      tree_count: String(b.tree_count),
      plantation_date: b.plantation_date,
      village: b.village || "",
      district: b.district || "",
      latitude: b.latitude?.toString() || "",
      longitude: b.longitude?.toString() || "",
      trees_alive: b.trees_alive?.toString() || "",
      review_date: b.review_date || "",
      notes: b.notes || "",
      status: b.status,
      is_public: b.is_public,
    });
    setDialogOpen(true);
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const loc = await getDeviceLocation();
      setForm((prev) => ({
        ...prev,
        latitude: loc.latitude.toFixed(6),
        longitude: loc.longitude.toFixed(6),
      }));
      toast({
        title: "Location captured",
        description: `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)} (±${Math.round(loc.accuracy)}m)`,
      });
    } catch (err: any) {
      toast({ title: "Location failed", description: err.message, variant: "destructive" });
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.batch_code.trim()) {
      toast({ title: "Batch code required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      batch_code: form.batch_code.trim().toUpperCase(),
      title: form.title || null,
      species: form.species || "Mixed native",
      tree_count: form.tree_count ? parseInt(form.tree_count) : 0,
      plantation_date: form.plantation_date,
      village: form.village || null,
      district: form.district || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      trees_alive: form.trees_alive ? parseInt(form.trees_alive) : null,
      review_date: form.review_date || null,
      notes: form.notes || null,
      status: form.status,
      is_public: form.is_public,
      created_by: user.id,
    };

    const { error } = editing
      ? await supabase.from("plantation_batches").update(payload).eq("id", editing.id)
      : await supabase.from("plantation_batches").insert(payload);

    setSaving(false);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: editing ? "Batch updated" : "Batch created",
      description: `Public proof page: /batch/${payload.batch_code}`,
    });
    setDialogOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (b: PlantationBatch) => {
    if (!confirm(`Delete batch ${b.batch_code}? Photos stay but lose their link.`)) return;
    const { error } = await supabase.from("plantation_batches").delete().eq("id", b.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Batch deleted" });
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Trees className="h-5 w-5" />
            Plantation Batches
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Record plantations you did yourself, then attach geo-tagged photos to the batch code
            under Photos. Each public batch gets a shareable proof page at /batch/&lt;code&gt;.
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit batch" : "New plantation batch"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Batch code</Label>
                  <Input
                    value={form.batch_code}
                    onChange={(e) => setForm({ ...form, batch_code: e.target.value })}
                    placeholder="HS-202608-A1B"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Plantation date</Label>
                  <Input
                    type="date"
                    value={form.plantation_date}
                    onChange={(e) => setForm({ ...form, plantation_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Title (optional)</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Monsoon drive — Kotkhai farmer land"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Species</Label>
                  <Input
                    value={form.species}
                    onChange={(e) => setForm({ ...form, species: e.target.value })}
                    placeholder="Deodar, Oak, Mixed native"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Trees planted</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.tree_count}
                    onChange={(e) => setForm({ ...form, tree_count: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Village</Label>
                  <Input
                    value={form.village}
                    onChange={(e) => setForm({ ...form, village: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>District</Label>
                  <Input
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-border p-3">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  Site coordinates
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    placeholder="Latitude"
                  />
                  <Input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    placeholder="Longitude"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={useCurrentLocation}
                    disabled={locating}
                  >
                    {locating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Crosshair className="h-4 w-4 mr-2" />
                    )}
                    Use my current location
                  </Button>
                  {form.latitude && form.longitude && (
                    <a
                      href={GOOGLE_MAPS_LINK(
                        parseFloat(form.latitude),
                        parseFloat(form.longitude),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline inline-flex items-center gap-1"
                    >
                      Verify on map <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Trees alive (survival check)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.trees_alive}
                    onChange={(e) => setForm({ ...form, trees_alive: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Review date</Label>
                  <Input
                    type="date"
                    value={form.review_date}
                    onChange={(e) => setForm({ ...form, review_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <Switch
                    checked={form.is_public}
                    onCheckedChange={(v) => setForm({ ...form, is_public: v })}
                  />
                  <Label className="text-sm">Show publicly</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Internal notes</Label>
                <Textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editing ? "Update batch" : "Create batch"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No batches yet. Create one for a plantation you already did, then upload its
            geo-tagged photos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Trees</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <p className="font-mono text-xs font-semibold">{b.batch_code}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.title || b.species} ·{" "}
                        {new Date(b.plantation_date).toLocaleDateString("en-IN")}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {b.tree_count}
                      {b.trees_alive != null && (
                        <span className="text-muted-foreground"> · {b.trees_alive} alive</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {b.village || b.district || "—"}
                      {b.latitude && b.longitude && (
                        <a
                          href={GOOGLE_MAPS_LINK(b.latitude, b.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-primary underline"
                        >
                          {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={photoCounts[b.batch_code] ? "secondary" : "destructive"}>
                        {photoCounts[b.batch_code] || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-[10px]">{b.status}</Badge>
                        {!b.is_public && (
                          <Badge variant="destructive" className="text-[10px]">hidden</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <a href={`/batch/${b.batch_code}`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button size="sm" variant="outline" onClick={() => openEdit(b)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(b)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
