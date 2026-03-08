import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BulkTreeUpload } from "./BulkTreeUpload";
import { MobileCard, MobileCardRow } from "./MobileCard";
import { compressImage, formatFileSize } from "@/lib/imageCompression";

interface Tree {
  id: string;
  name: string;
  name_hi: string | null;
  scientific_name: string | null;
  description: string;
  description_hi: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category: string;
  category_hi: string | null;
  growth_rate: string | null;
  max_height: string | null;
  is_active: boolean;
  is_featured: boolean;
}

const CATEGORIES = [
  { en: "Fruit Trees", hi: "फल के पेड़" },
  { en: "Timber Trees", hi: "इमारती पेड़" },
  { en: "Ornamental Trees", hi: "सजावटी पेड़" },
  { en: "Medicinal Trees", hi: "औषधीय पेड़" },
  { en: "Native Species", hi: "देशी प्रजातियां" },
  { en: "Evergreen", hi: "सदाबहार" },
  { en: "Deciduous", hi: "पर्णपाती" },
];

const GROWTH_RATES = ["Slow", "Medium", "Fast", "Very Fast"];

export const TreesTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTree, setEditingTree] = useState<Tree | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", name_hi: "", scientific_name: "", description: "", description_hi: "",
    price: "", image_url: "", stock_quantity: "", category: "", category_hi: "",
    growth_rate: "", max_height: "", is_active: true, is_featured: false,
  });

  const { data: trees = [], isLoading } = useQuery({
    queryKey: ["admin-trees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trees").select("*").order("name");
      if (error) throw error;
      return data as Tree[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-trees"] });
    queryClient.invalidateQueries({ queryKey: ["admin-trees-lookup"] });
  };

  const resetForm = () => {
    setFormData({ name: "", name_hi: "", scientific_name: "", description: "", description_hi: "", price: "", image_url: "", stock_quantity: "", category: "", category_hi: "", growth_rate: "", max_height: "", is_active: true, is_featured: false });
    setEditingTree(null);
    setImagePreview(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid File", description: "Please upload an image.", variant: "destructive" }); return; }
    if (file.size > 10 * 1024 * 1024) { toast({ title: "File Too Large", description: "Max 10MB.", variant: "destructive" }); return; }
    setUploading(true);
    try {
      const originalSize = file.size;
      const compressedBlob = await compressImage(file, 1200, 1200, 0.8);
      const fileName = `trees/tree-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from("tree-photos").upload(fileName, compressedBlob, { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("tree-photos").getPublicUrl(fileName);
      setFormData(f => ({ ...f, image_url: urlData.publicUrl }));
      setImagePreview(urlData.publicUrl);
      toast({ title: "Image Uploaded", description: `Compressed (${formatFileSize(originalSize)} → ${formatFileSize(compressedBlob.size)})` });
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const treeData = {
      name: formData.name, name_hi: formData.name_hi || null, scientific_name: formData.scientific_name || null,
      description: formData.description, description_hi: formData.description_hi || null, price: parseFloat(formData.price),
      image_url: formData.image_url || null, stock_quantity: parseInt(formData.stock_quantity), category: formData.category,
      category_hi: formData.category_hi || null, growth_rate: formData.growth_rate || null, max_height: formData.max_height || null,
      is_active: formData.is_active, is_featured: formData.is_featured,
    };
    try {
      if (editingTree) {
        const { error } = await supabase.from("trees").update(treeData).eq("id", editingTree.id);
        if (error) throw error;
        toast({ title: "Success", description: "Tree updated." });
      } else {
        const { error } = await supabase.from("trees").insert(treeData);
        if (error) throw error;
        toast({ title: "Success", description: "Tree added." });
      }
      invalidate();
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (tree: Tree) => {
    setEditingTree(tree);
    setFormData({
      name: tree.name, name_hi: tree.name_hi || "", scientific_name: tree.scientific_name || "",
      description: tree.description, description_hi: tree.description_hi || "", price: tree.price.toString(),
      image_url: tree.image_url || "", stock_quantity: tree.stock_quantity.toString(), category: tree.category,
      category_hi: tree.category_hi || "", growth_rate: tree.growth_rate || "", max_height: tree.max_height || "",
      is_active: tree.is_active, is_featured: tree.is_featured || false,
    });
    setImagePreview(tree.image_url);
    setIsAddDialogOpen(true);
  };

  const deleteTree = async (treeId: string) => {
    if (!confirm("Delete this tree?")) return;
    try {
      const { error } = await supabase.from("trees").delete().eq("id", treeId);
      if (error) throw error;
      toast({ title: "Success", description: "Tree deleted." });
      invalidate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleTreeStatus = async (tree: Tree) => {
    try {
      const { error } = await supabase.from("trees").update({ is_active: !tree.is_active }).eq("id", tree.id);
      if (error) throw error;
      invalidate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const bulkUploadTrees = async (treesData: any[]) => {
    const { error } = await supabase.from("trees").insert(treesData);
    if (error) throw error;
    toast({ title: "Success", description: `${treesData.length} trees added.` });
    invalidate();
  };

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-lg md:text-xl">Tree Management</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <BulkTreeUpload onBulkUpload={bulkUploadTrees} />
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="sm" className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Tree</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTree ? "Edit Tree" : "Add New Tree"}</DialogTitle>
                <DialogDescription>{editingTree ? "Update tree information" : "Add a new tree to the catalog"}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tree Image</Label>
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                      {uploading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : imagePreview || formData.image_url ? <img src={imagePreview || formData.image_url} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center p-2"><ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" /><span className="text-xs text-muted-foreground">Click to upload</span></div>}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div className="flex-1 space-y-2">
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}><Upload className="mr-2 h-4 w-4" />{uploading ? "Uploading..." : "Upload Image"}</Button>
                      <p className="text-xs text-muted-foreground">Or paste URL below. Max 10MB.</p>
                      <Input type="url" value={formData.image_url} onChange={(e) => { setFormData(f => ({ ...f, image_url: e.target.value })); setImagePreview(e.target.value); }} placeholder="https://..." />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Name (English) *</Label><Input value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} required placeholder="Deodar Cedar" /></div>
                  <div className="space-y-2"><Label>नाम (हिंदी)</Label><Input value={formData.name_hi} onChange={(e) => setFormData(f => ({ ...f, name_hi: e.target.value }))} placeholder="देवदार" /></div>
                </div>
                <div className="space-y-2"><Label>Scientific Name</Label><Input value={formData.scientific_name} onChange={(e) => setFormData(f => ({ ...f, scientific_name: e.target.value }))} placeholder="Cedrus deodara" /></div>
                <div className="space-y-2"><Label>Description (English) *</Label><Textarea value={formData.description} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} required rows={3} /></div>
                <div className="space-y-2"><Label>विवरण (हिंदी)</Label><Textarea value={formData.description_hi} onChange={(e) => setFormData(f => ({ ...f, description_hi: e.target.value }))} rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Price (₹) *</Label><Input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData(f => ({ ...f, price: e.target.value }))} required /></div>
                  <div className="space-y-2"><Label>Stock *</Label><Input type="number" min="0" value={formData.stock_quantity} onChange={(e) => setFormData(f => ({ ...f, stock_quantity: e.target.value }))} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => { const cat = CATEGORIES.find(c => c.en === v); setFormData(f => ({ ...f, category: v, category_hi: cat?.hi || "" })); }}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.en} value={c.en}>{c.en} ({c.hi})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Growth Rate</Label>
                    <Select value={formData.growth_rate} onValueChange={(v) => setFormData(f => ({ ...f, growth_rate: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{GROWTH_RATES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Max Height</Label><Input value={formData.max_height} onChange={(e) => setFormData(f => ({ ...f, max_height: e.target.value }))} placeholder="15-20m" /></div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2"><input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData(f => ({ ...f, is_active: e.target.checked }))} className="rounded border-border" /><Label htmlFor="is_active">Active</Label></div>
                  <div className="flex items-center gap-2"><input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={(e) => setFormData(f => ({ ...f, is_featured: e.target.checked }))} className="rounded border-border" /><Label htmlFor="is_featured">Featured</Label></div>
                </div>
                <Button type="submit" className="w-full">{editingTree ? "Update Tree" : "Add Tree"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          {trees.map((tree) => (
            <MobileCard key={tree.id}>
              <div className="flex items-start gap-3 mb-2">
                {tree.image_url && <img src={tree.image_url} alt={tree.name} className="w-16 h-16 rounded-lg object-cover" />}
                <div className="flex-1">
                  <div className="flex justify-between items-start"><span className="font-semibold text-sm">{tree.name}</span><span className={`text-xs px-2 py-0.5 rounded-full ${tree.is_active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{tree.is_active ? 'Active' : 'Inactive'}</span></div>
                  {tree.name_hi && <p className="text-xs text-muted-foreground">{tree.name_hi}</p>}
                </div>
              </div>
              <MobileCardRow label="Price" value={`₹${tree.price}`} />
              <MobileCardRow label="Stock" value={tree.stock_quantity} />
              <MobileCardRow label="Category" value={tree.category} />
              <div className="pt-2 border-t border-border flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(tree)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                <Button variant="outline" size="sm" onClick={() => toggleTreeStatus(tree)}>{tree.is_active ? 'Disable' : 'Enable'}</Button>
                <Button variant="destructive" size="sm" onClick={() => deleteTree(tree.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </MobileCard>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trees.map((tree) => (
                <TableRow key={tree.id}>
                  <TableCell>{tree.image_url ? <img src={tree.image_url} alt={tree.name} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 bg-muted rounded flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}</TableCell>
                  <TableCell><div className="font-medium">{tree.name}</div>{tree.name_hi && <div className="text-xs text-muted-foreground">{tree.name_hi}</div>}{tree.scientific_name && <div className="text-xs text-muted-foreground italic">{tree.scientific_name}</div>}</TableCell>
                  <TableCell>{tree.category}</TableCell>
                  <TableCell>₹{tree.price}</TableCell>
                  <TableCell>{tree.stock_quantity}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${tree.is_active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{tree.is_active ? 'Active' : 'Inactive'}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(tree)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleTreeStatus(tree)}>{tree.is_active ? 'Disable' : 'Enable'}</Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteTree(tree.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
