import { useState } from "react";
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
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MobileCard, MobileCardRow } from "./MobileCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { compressImage } from "@/lib/imageCompression";

interface Plant {
  id: string;
  name: string;
  name_hi: string | null;
  scientific_name: string | null;
  description: string;
  description_hi: string | null;
  category: string;
  category_hi: string | null;
  price: number;
  stock_quantity: number;
  care_level: string | null;
  light_requirement: string | null;
  water_requirement: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface PlantImage {
  id: string;
  plant_id: string;
  image_url: string;
  is_primary: boolean | null;
  sort_order: number | null;
  caption: string | null;
}

interface PlantsTabProps {
  plants: Plant[];
  setPlants: React.Dispatch<React.SetStateAction<Plant[]>>;
}

const CATEGORIES = ["Indoor", "Outdoor", "Ornamental", "Flowering", "Succulents", "Hanging"];
const CARE_LEVELS = ["Easy", "Medium", "Expert"];
const LIGHT_REQUIREMENTS = ["Low", "Medium", "Bright Indirect", "Direct Sunlight"];
const WATER_REQUIREMENTS = ["Low", "Moderate", "High"];

export const PlantsTab = ({ plants, setPlants }: PlantsTabProps) => {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [plantImages, setPlantImages] = useState<PlantImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    name_hi: "",
    scientific_name: "",
    description: "",
    description_hi: "",
    category: "Indoor",
    category_hi: "",
    price: "",
    stock_quantity: "",
    care_level: "Easy",
    light_requirement: "Medium",
    water_requirement: "Moderate",
    is_active: true,
    is_featured: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      name_hi: "",
      scientific_name: "",
      description: "",
      description_hi: "",
      category: "Indoor",
      category_hi: "",
      price: "",
      stock_quantity: "",
      care_level: "Easy",
      light_requirement: "Medium",
      water_requirement: "Moderate",
      is_active: true,
      is_featured: false,
    });
    setEditingPlant(null);
    setPlantImages([]);
  };

  const loadPlantImages = async (plantId: string) => {
    const { data } = await supabase
      .from("plant_images")
      .select("*")
      .eq("plant_id", plantId)
      .order("sort_order");
    
    if (data) setPlantImages(data);
  };

  const handleEdit = async (plant: Plant) => {
    setEditingPlant(plant);
    setFormData({
      name: plant.name,
      name_hi: plant.name_hi || "",
      scientific_name: plant.scientific_name || "",
      description: plant.description,
      description_hi: plant.description_hi || "",
      category: plant.category,
      category_hi: plant.category_hi || "",
      price: plant.price.toString(),
      stock_quantity: plant.stock_quantity.toString(),
      care_level: plant.care_level || "Easy",
      light_requirement: plant.light_requirement || "Medium",
      water_requirement: plant.water_requirement || "Moderate",
      is_active: plant.is_active ?? true,
      is_featured: plant.is_featured ?? false,
    });
    await loadPlantImages(plant.id);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (files: FileList) => {
    if (!editingPlant) {
      toast({ title: "Error", description: "Save plant first before uploading images", variant: "destructive" });
      return;
    }

    setUploadingImages(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBlob = await compressImage(file);
        const fileName = `plants/plant-${Date.now()}-${i}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("tree-photos")
          .upload(fileName, compressedBlob, { contentType: "image/jpeg" });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("tree-photos")
          .getPublicUrl(fileName);

        const isPrimary = plantImages.length === 0 && i === 0;
        
        const { data: newImage, error: insertError } = await supabase
          .from("plant_images")
          .insert({
            plant_id: editingPlant.id,
            image_url: publicUrl,
            is_primary: isPrimary,
            sort_order: plantImages.length + i,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        setPlantImages(prev => [...prev, newImage]);
      }

      toast({ title: "Success", description: "Images uploaded successfully" });
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!editingPlant) return;

    try {
      // First, unset all as primary
      await supabase
        .from("plant_images")
        .update({ is_primary: false })
        .eq("plant_id", editingPlant.id);

      // Set this one as primary
      await supabase
        .from("plant_images")
        .update({ is_primary: true })
        .eq("id", imageId);

      setPlantImages(prev => prev.map(img => ({
        ...img,
        is_primary: img.id === imageId,
      })));

      toast({ title: "Success", description: "Primary image updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/tree-photos/");
      if (urlParts.length > 1) {
        await supabase.storage.from("tree-photos").remove([urlParts[1]]);
      }

      await supabase.from("plant_images").delete().eq("id", imageId);
      setPlantImages(prev => prev.filter(img => img.id !== imageId));
      
      toast({ title: "Success", description: "Image deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    try {
      const plantData = {
        name: formData.name,
        name_hi: formData.name_hi || null,
        scientific_name: formData.scientific_name || null,
        description: formData.description,
        description_hi: formData.description_hi || null,
        category: formData.category,
        category_hi: formData.category_hi || null,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        care_level: formData.care_level,
        light_requirement: formData.light_requirement,
        water_requirement: formData.water_requirement,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      };

      if (editingPlant) {
        const { error } = await supabase
          .from("plants")
          .update(plantData)
          .eq("id", editingPlant.id);

        if (error) throw error;

        setPlants(prev => prev.map(p => 
          p.id === editingPlant.id ? { ...p, ...plantData } : p
        ));

        toast({ title: "Success", description: "Plant updated successfully" });
      } else {
        const { data, error } = await supabase
          .from("plants")
          .insert(plantData)
          .select()
          .single();

        if (error) throw error;

        setPlants(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        
        // Reopen dialog with new plant to add images
        setEditingPlant(data);
        setPlantImages([]);
        
        toast({ 
          title: "Success", 
          description: "Plant created! Now you can add images." 
        });
        return; // Don't close dialog
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving plant:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (plantId: string) => {
    if (!confirm("Are you sure? This will also delete all plant images.")) return;

    try {
      const { error } = await supabase.from("plants").delete().eq("id", plantId);
      if (error) throw error;

      setPlants(prev => prev.filter(p => p.id !== plantId));
      toast({ title: "Success", description: "Plant deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (plant: Plant) => {
    try {
      const { error } = await supabase
        .from("plants")
        .update({ is_active: !plant.is_active })
        .eq("id", plant.id);

      if (error) throw error;

      setPlants(prev => prev.map(p => 
        p.id === plant.id ? { ...p, is_active: !p.is_active } : p
      ));

      toast({ title: "Success", description: `Plant ${!plant.is_active ? 'activated' : 'deactivated'}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const renderForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Name (English) *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Money Plant"
          />
        </div>
        <div>
          <Label>Name (Hindi)</Label>
          <Input
            value={formData.name_hi}
            onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
            placeholder="मनी प्लांट"
          />
        </div>
      </div>

      <div>
        <Label>Scientific Name</Label>
        <Input
          value={formData.scientific_name}
          onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
          placeholder="Epipremnum aureum"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Description (English) *</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="A popular indoor plant..."
          />
        </div>
        <div>
          <Label>Description (Hindi)</Label>
          <Textarea
            value={formData.description_hi}
            onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
            placeholder="एक लोकप्रिय इनडोर प्लांट..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label>Category *</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Care Level</Label>
          <Select value={formData.care_level} onValueChange={(v) => setFormData({ ...formData, care_level: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CARE_LEVELS.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Light</Label>
          <Select value={formData.light_requirement} onValueChange={(v) => setFormData({ ...formData, light_requirement: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LIGHT_REQUIREMENTS.map(req => (
                <SelectItem key={req} value={req}>{req}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Water</Label>
          <Select value={formData.water_requirement} onValueChange={(v) => setFormData({ ...formData, water_requirement: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {WATER_REQUIREMENTS.map(req => (
                <SelectItem key={req} value={req}>{req}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price (₹) *</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="299"
          />
        </div>
        <div>
          <Label>Stock Quantity *</Label>
          <Input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            placeholder="50"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>Active</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_featured}
            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
          />
          <Label>Featured</Label>
        </div>
      </div>

      {/* Multi-Image Upload Section */}
      {editingPlant && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Plant Images ({plantImages.length})
            </Label>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                disabled={uploadingImages}
              />
              <Button variant="outline" size="sm" disabled={uploadingImages} asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingImages ? "Uploading..." : "Add Images"}
                </span>
              </Button>
            </label>
          </div>

          {plantImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {plantImages.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                  <img
                    src={img.image_url}
                    alt="Plant"
                    className="w-full aspect-square object-cover"
                  />
                  {img.is_primary && (
                    <Badge className="absolute top-1 left-1 text-xs bg-primary">Primary</Badge>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.is_primary && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => handleSetPrimary(img.id)}
                        title="Set as primary"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => handleDeleteImage(img.id, img.image_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No images yet. Click "Add Images" to upload.</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSubmit} className="flex-1">
          {editingPlant ? "Update Plant" : "Create Plant"}
        </Button>
        <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ornamental Plants ({plants.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Plant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPlant ? "Edit Plant" : "Add New Plant"}</DialogTitle>
            </DialogHeader>
            {renderForm()}
          </DialogContent>
        </Dialog>
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {plants.map((plant) => (
            <MobileCard key={plant.id}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-sm">{plant.name}</span>
                  {plant.scientific_name && (
                    <p className="text-xs text-muted-foreground italic">{plant.scientific_name}</p>
                  )}
                </div>
                <Badge variant={plant.is_active ? "default" : "secondary"}>
                  {plant.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <MobileCardRow label="Category" value={<Badge variant="outline">{plant.category}</Badge>} />
              <MobileCardRow label="Care Level" value={plant.care_level || "-"} />
              <MobileCardRow label="Price" value={`₹${plant.price}`} />
              <MobileCardRow label="Stock" value={plant.stock_quantity} />
              <div className="pt-3 border-t border-border flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(plant)}>
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleToggleActive(plant)}>
                  {plant.is_active ? "Deactivate" : "Activate"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(plant.id)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </MobileCard>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Care Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plants.map((plant) => (
                  <TableRow key={plant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plant.name}</div>
                        {plant.scientific_name && (
                          <div className="text-xs text-muted-foreground italic">{plant.scientific_name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{plant.category}</Badge>
                    </TableCell>
                    <TableCell>{plant.care_level}</TableCell>
                    <TableCell>₹{plant.price}</TableCell>
                    <TableCell>{plant.stock_quantity}</TableCell>
                    <TableCell>
                      <Switch
                        checked={plant.is_active ?? false}
                        onCheckedChange={() => handleToggleActive(plant)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(plant)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(plant.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {plants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No plants yet. Click "Add Plant" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
