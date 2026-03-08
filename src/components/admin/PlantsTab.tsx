import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MobileCard, MobileCardRow } from "./MobileCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { compressImage } from "@/lib/imageCompression";
import { BulkPlantUpload } from "./BulkPlantUpload";

interface Plant {
  id: string; name: string; name_hi: string | null; scientific_name: string | null;
  description: string; description_hi: string | null; category: string; category_hi: string | null;
  price: number; stock_quantity: number; care_level: string | null; light_requirement: string | null;
  water_requirement: string | null; is_active: boolean | null; is_featured: boolean | null;
  sort_order: number | null; created_at: string | null; updated_at: string | null;
}

interface PlantImage {
  id: string; plant_id: string; image_url: string; is_primary: boolean | null;
  sort_order: number | null; caption: string | null;
}

const CATEGORIES = ["Indoor", "Outdoor", "Ornamental", "Flowering", "Succulents", "Hanging"];
const CARE_LEVELS = ["Easy", "Medium", "Expert"];
const LIGHT_REQUIREMENTS = ["Low", "Medium", "Bright Indirect", "Direct Sunlight"];
const WATER_REQUIREMENTS = ["Low", "Moderate", "High"];

export const PlantsTab = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [plantImages, setPlantImages] = useState<PlantImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    name: "", name_hi: "", scientific_name: "", description: "", description_hi: "",
    category: "Indoor", category_hi: "", price: "", stock_quantity: "",
    care_level: "Easy", light_requirement: "Medium", water_requirement: "Moderate",
    is_active: true, is_featured: false,
  });

  const { data: plants = [], isLoading } = useQuery({
    queryKey: ["admin-plants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plants").select("*").order("name");
      if (error) throw error;
      return data as Plant[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-plants"] });

  const resetForm = () => {
    setFormData({ name: "", name_hi: "", scientific_name: "", description: "", description_hi: "", category: "Indoor", category_hi: "", price: "", stock_quantity: "", care_level: "Easy", light_requirement: "Medium", water_requirement: "Moderate", is_active: true, is_featured: false });
    setEditingPlant(null);
    setPlantImages([]);
  };

  const loadPlantImages = async (plantId: string) => {
    const { data } = await supabase.from("plant_images").select("*").eq("plant_id", plantId).order("sort_order");
    if (data) setPlantImages(data);
  };

  const handleEdit = async (plant: Plant) => {
    setEditingPlant(plant);
    setFormData({
      name: plant.name, name_hi: plant.name_hi || "", scientific_name: plant.scientific_name || "",
      description: plant.description, description_hi: plant.description_hi || "", category: plant.category,
      category_hi: plant.category_hi || "", price: plant.price.toString(), stock_quantity: plant.stock_quantity.toString(),
      care_level: plant.care_level || "Easy", light_requirement: plant.light_requirement || "Medium",
      water_requirement: plant.water_requirement || "Moderate", is_active: plant.is_active ?? true, is_featured: plant.is_featured ?? false,
    });
    await loadPlantImages(plant.id);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (files: FileList) => {
    if (!editingPlant) { toast({ title: "Error", description: "Save plant first", variant: "destructive" }); return; }
    setUploadingImages(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBlob = await compressImage(file);
        const fileName = `plants/plant-${Date.now()}-${i}.jpg`;
        const { error: uploadError } = await supabase.storage.from("tree-photos").upload(fileName, compressedBlob, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("tree-photos").getPublicUrl(fileName);
        const isPrimary = plantImages.length === 0 && i === 0;
        const { data: newImage, error: insertError } = await supabase.from("plant_images").insert({ plant_id: editingPlant.id, image_url: publicUrl, is_primary: isPrimary, sort_order: plantImages.length + i }).select().single();
        if (insertError) throw insertError;
        setPlantImages(prev => [...prev, newImage]);
      }
      toast({ title: "Success", description: "Images uploaded" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setUploadingImages(false); }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!editingPlant) return;
    try {
      await supabase.from("plant_images").update({ is_primary: false }).eq("plant_id", editingPlant.id);
      await supabase.from("plant_images").update({ is_primary: true }).eq("id", imageId);
      setPlantImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })));
      toast({ title: "Success", description: "Primary image updated" });
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      const urlParts = imageUrl.split("/tree-photos/");
      if (urlParts.length > 1) await supabase.storage.from("tree-photos").remove([urlParts[1]]);
      await supabase.from("plant_images").delete().eq("id", imageId);
      setPlantImages(prev => prev.filter(img => img.id !== imageId));
      toast({ title: "Success", description: "Image deleted" });
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleSubmit = async () => {
    try {
      const plantData = {
        name: formData.name, name_hi: formData.name_hi || null, scientific_name: formData.scientific_name || null,
        description: formData.description, description_hi: formData.description_hi || null, category: formData.category,
        category_hi: formData.category_hi || null, price: parseFloat(formData.price), stock_quantity: parseInt(formData.stock_quantity),
        care_level: formData.care_level, light_requirement: formData.light_requirement, water_requirement: formData.water_requirement,
        is_active: formData.is_active, is_featured: formData.is_featured,
      };
      if (editingPlant) {
        const { error } = await supabase.from("plants").update(plantData).eq("id", editingPlant.id);
        if (error) throw error;
        toast({ title: "Success", description: "Plant updated" });
      } else {
        const { data, error } = await supabase.from("plants").insert(plantData).select().single();
        if (error) throw error;
        setEditingPlant(data);
        setPlantImages([]);
        toast({ title: "Success", description: "Plant created! Now add images." });
        invalidate();
        return;
      }
      invalidate();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (plantId: string) => {
    if (!confirm("Delete this plant and all its images?")) return;
    try {
      const { error } = await supabase.from("plants").delete().eq("id", plantId);
      if (error) throw error;
      toast({ title: "Success", description: "Plant deleted" });
      invalidate();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleToggleActive = async (plant: Plant) => {
    try {
      const { error } = await supabase.from("plants").update({ is_active: !plant.is_active }).eq("id", plant.id);
      if (error) throw error;
      toast({ title: "Success", description: `Plant ${!plant.is_active ? 'activated' : 'deactivated'}` });
      invalidate();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleBulkUpload = async (plantsData: any[]) => {
    const { error } = await supabase.from("plants").insert(plantsData);
    if (error) throw error;
    toast({ title: "Success", description: `${plantsData.length} plants uploaded` });
    invalidate();
  };

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>;
  }

  const renderForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Name (English) *</Label><Input value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="Money Plant" /></div>
        <div><Label>Name (Hindi)</Label><Input value={formData.name_hi} onChange={(e) => setFormData(f => ({ ...f, name_hi: e.target.value }))} placeholder="मनी प्लांट" /></div>
      </div>
      <div><Label>Scientific Name</Label><Input value={formData.scientific_name} onChange={(e) => setFormData(f => ({ ...f, scientific_name: e.target.value }))} /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Description (English) *</Label><Textarea value={formData.description} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} /></div>
        <div><Label>Description (Hindi)</Label><Textarea value={formData.description_hi} onChange={(e) => setFormData(f => ({ ...f, description_hi: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><Label>Category *</Label><Select value={formData.category} onValueChange={(v) => setFormData(f => ({ ...f, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Care Level</Label><Select value={formData.care_level} onValueChange={(v) => setFormData(f => ({ ...f, care_level: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CARE_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Light</Label><Select value={formData.light_requirement} onValueChange={(v) => setFormData(f => ({ ...f, light_requirement: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LIGHT_REQUIREMENTS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Water</Label><Select value={formData.water_requirement} onValueChange={(v) => setFormData(f => ({ ...f, water_requirement: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{WATER_REQUIREMENTS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Price (₹) *</Label><Input type="number" value={formData.price} onChange={(e) => setFormData(f => ({ ...f, price: e.target.value }))} /></div>
        <div><Label>Stock *</Label><Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData(f => ({ ...f, stock_quantity: e.target.value }))} /></div>
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(c) => setFormData(f => ({ ...f, is_active: c }))} /><Label>Active</Label></div>
        <div className="flex items-center gap-2"><Switch checked={formData.is_featured} onCheckedChange={(c) => setFormData(f => ({ ...f, is_featured: c }))} /><Label>Featured</Label></div>
      </div>
      {editingPlant && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Plant Images ({plantImages.length})</Label>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files)} disabled={uploadingImages} />
              <Button variant="outline" size="sm" disabled={uploadingImages} asChild><span><Upload className="w-4 h-4 mr-2" />{uploadingImages ? "Uploading..." : "Add Images"}</span></Button>
            </label>
          </div>
          {plantImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {plantImages.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.image_url} alt="" className="w-full h-20 object-cover rounded border" />
                  {img.is_primary && <Badge className="absolute top-1 left-1 text-[10px] px-1 py-0"><Star className="w-2 h-2 mr-0.5" />Primary</Badge>}
                  <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!img.is_primary && <Button size="sm" variant="secondary" className="h-5 text-[10px] px-1" onClick={() => handleSetPrimary(img.id)}>★</Button>}
                    <Button size="sm" variant="destructive" className="h-5 text-[10px] px-1" onClick={() => handleDeleteImage(img.id, img.image_url)}>✕</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <Button onClick={handleSubmit} className="w-full">{editingPlant ? "Update Plant" : "Create Plant"}</Button>
    </div>
  );

  return (
    <Card>
      <div className="flex items-center justify-between p-4 md:p-6 pb-0">
        <h3 className="text-lg font-semibold">Plants ({plants.length})</h3>
        <div className="flex gap-2">
          <BulkPlantUpload onBulkUpload={handleBulkUpload} />
          <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Plant</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingPlant ? "Edit Plant" : "Add New Plant"}</DialogTitle></DialogHeader>
              {renderForm()}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <CardContent>
        {isMobile ? (
          <div className="space-y-3">
            {plants.map((plant) => (
              <MobileCard key={plant.id}>
                <div className="flex justify-between items-start mb-1">
                  <div><span className="font-semibold text-sm">{plant.name}</span>{plant.name_hi && <span className="text-xs text-muted-foreground ml-1">({plant.name_hi})</span>}</div>
                  <Badge variant={plant.is_active ? "default" : "secondary"}>{plant.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <MobileCardRow label="Category" value={plant.category} />
                <MobileCardRow label="Price" value={`₹${plant.price}`} />
                <MobileCardRow label="Stock" value={plant.stock_quantity} />
                <MobileCardRow label="Care" value={plant.care_level || "-"} />
                <div className="pt-2 border-t border-border flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(plant)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggleActive(plant)}>{plant.is_active ? "Disable" : "Enable"}</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(plant.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </MobileCard>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Care</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {plants.map((plant) => (
                  <TableRow key={plant.id}>
                    <TableCell><div className="font-medium">{plant.name}</div>{plant.name_hi && <div className="text-xs text-muted-foreground">{plant.name_hi}</div>}</TableCell>
                    <TableCell>{plant.category}</TableCell>
                    <TableCell>₹{plant.price}</TableCell>
                    <TableCell>{plant.stock_quantity}</TableCell>
                    <TableCell>{plant.care_level || "-"}</TableCell>
                    <TableCell><Badge variant={plant.is_active ? "default" : "secondary"}>{plant.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(plant)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleActive(plant)}>{plant.is_active ? "Disable" : "Enable"}</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(plant.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
