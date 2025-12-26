import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
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
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
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
}

interface TreesTabProps {
  trees: Tree[];
  onAddTree: (treeData: any) => Promise<void>;
  onUpdateTree: (treeId: string, treeData: any) => Promise<void>;
  onDeleteTree: (treeId: string) => Promise<void>;
  onBulkUpload: (trees: any[]) => Promise<void>;
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

export const TreesTab = ({ trees, onAddTree, onUpdateTree, onDeleteTree, onBulkUpload }: TreesTabProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTree, setEditingTree] = useState<Tree | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    name_hi: "",
    scientific_name: "",
    description: "",
    description_hi: "",
    price: "",
    image_url: "",
    stock_quantity: "",
    category: "",
    category_hi: "",
    growth_rate: "",
    max_height: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      name_hi: "",
      scientific_name: "",
      description: "",
      description_hi: "",
      price: "",
      image_url: "",
      stock_quantity: "",
      category: "",
      category_hi: "",
      growth_rate: "",
      max_height: "",
      is_active: true,
    });
    setEditingTree(null);
    setImagePreview(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Compress the image before uploading
      const originalSize = file.size;
      const compressedBlob = await compressImage(file, 1200, 1200, 0.8);
      const compressedSize = compressedBlob.size;
      
      console.log(`Image compressed: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)}`);

      // Create unique filename
      const fileName = `tree-${Date.now()}.jpg`;
      const filePath = `trees/${fileName}`;

      // Upload compressed image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("tree-photos")
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("tree-photos")
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: urlData.publicUrl });
      setImagePreview(urlData.publicUrl);

      toast({
        title: "Image Uploaded",
        description: `Tree image compressed (${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)}) and uploaded successfully.`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const treeData = {
      name: formData.name,
      name_hi: formData.name_hi || null,
      scientific_name: formData.scientific_name || null,
      description: formData.description,
      description_hi: formData.description_hi || null,
      price: parseFloat(formData.price),
      image_url: formData.image_url || null,
      stock_quantity: parseInt(formData.stock_quantity),
      category: formData.category,
      category_hi: formData.category_hi || null,
      growth_rate: formData.growth_rate || null,
      max_height: formData.max_height || null,
      is_active: formData.is_active,
    };

    if (editingTree) {
      await onUpdateTree(editingTree.id, treeData);
    } else {
      await onAddTree(treeData);
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (tree: Tree) => {
    setEditingTree(tree);
    setFormData({
      name: tree.name,
      name_hi: tree.name_hi || "",
      scientific_name: tree.scientific_name || "",
      description: tree.description,
      description_hi: tree.description_hi || "",
      price: tree.price.toString(),
      image_url: tree.image_url || "",
      stock_quantity: tree.stock_quantity.toString(),
      category: tree.category,
      category_hi: tree.category_hi || "",
      growth_rate: tree.growth_rate || "",
      max_height: tree.max_height || "",
      is_active: tree.is_active,
    });
    setImagePreview(tree.image_url);
    setIsAddDialogOpen(true);
  };

  const toggleTreeStatus = async (tree: Tree) => {
    await onUpdateTree(tree.id, { is_active: !tree.is_active });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-lg md:text-xl">Tree Management</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <BulkTreeUpload onBulkUpload={onBulkUpload} />
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Tree
              </Button>
            </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTree ? "Edit Tree" : "Add New Tree"}</DialogTitle>
              <DialogDescription>
                {editingTree ? "Update tree information" : "Add a new tree to the catalog"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Tree Image</Label>
                <div className="flex items-start gap-4">
                  <div 
                    className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : imagePreview || formData.image_url ? (
                      <img 
                        src={imagePreview || formData.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Click to upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex-1 space-y-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload Image"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Or paste image URL below. Max 5MB, JPG/PNG recommended.
                    </p>
                    <Input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://example.com/tree.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* English Name & Hindi Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (English) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Deodar Cedar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_hi">नाम (हिंदी)</Label>
                  <Input
                    id="name_hi"
                    value={formData.name_hi}
                    onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                    placeholder="जैसे, देवदार"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scientific_name">Scientific Name</Label>
                <Input
                  id="scientific_name"
                  value={formData.scientific_name}
                  onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  placeholder="e.g., Cedrus deodara"
                />
              </div>

              {/* English Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (English) *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describe the tree's characteristics and benefits..."
                />
              </div>

              {/* Hindi Description */}
              <div className="space-y-2">
                <Label htmlFor="description_hi">विवरण (हिंदी)</Label>
                <Textarea
                  id="description_hi"
                  value={formData.description_hi}
                  onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                  rows={3}
                  placeholder="पेड़ की विशेषताओं और लाभों का वर्णन करें..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="250"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      const selectedCat = CATEGORIES.find(c => c.en === value);
                      setFormData({ 
                        ...formData, 
                        category: value,
                        category_hi: selectedCat?.hi || ""
                      });
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.en} value={cat.en}>
                          {cat.en} ({cat.hi})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="growth_rate">Growth Rate</Label>
                  <Select
                    value={formData.growth_rate}
                    onValueChange={(value) => setFormData({ ...formData, growth_rate: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select growth rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {GROWTH_RATES.map((rate) => (
                        <SelectItem key={rate} value={rate}>
                          {rate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_height">Max Height</Label>
                <Input
                  id="max_height"
                  value={formData.max_height}
                  onChange={(e) => setFormData({ ...formData, max_height: e.target.value })}
                  placeholder="e.g., 15-20m"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="is_active">Active (visible in shop)</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingTree ? "Update Tree" : "Add Tree"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          {trees.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No trees added yet. Click "Add Tree" to get started.</p>
          ) : (
            trees.map((tree) => (
              <MobileCard key={tree.id}>
                <div className="flex gap-3">
                  {tree.image_url ? (
                    <img 
                      src={tree.image_url} 
                      alt={tree.name}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm truncate">{tree.name}</h4>
                        {tree.scientific_name && (
                          <p className="text-xs text-muted-foreground italic truncate">{tree.scientific_name}</p>
                        )}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        tree.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {tree.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <MobileCardRow label="Category" value={tree.category} />
                <MobileCardRow label="Price" value={`₹${tree.price}`} />
                <MobileCardRow 
                  label="Stock" 
                  value={
                    <span className={tree.stock_quantity < 10 ? "text-destructive font-semibold" : ""}>
                      {tree.stock_quantity}
                    </span>
                  } 
                />
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tree)}
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTreeStatus(tree)}
                    className="flex-1"
                  >
                    {tree.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteTree(tree.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </MobileCard>
            ))
          )}
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
              {trees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No trees added yet. Click "Add Tree" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                trees.map((tree) => (
                  <TableRow key={tree.id}>
                    <TableCell>
                      {tree.image_url ? (
                        <img 
                          src={tree.image_url} 
                          alt={tree.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        {tree.name}
                        {tree.scientific_name && (
                          <p className="text-xs text-muted-foreground italic">{tree.scientific_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{tree.category}</TableCell>
                    <TableCell>₹{tree.price}</TableCell>
                    <TableCell>
                      <span className={tree.stock_quantity < 10 ? "text-destructive font-semibold" : ""}>
                        {tree.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTreeStatus(tree)}
                        className={`text-xs ${
                          tree.is_active
                            ? "text-primary hover:text-primary"
                            : "text-muted-foreground hover:text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`inline-block px-2 py-1 rounded-full ${
                            tree.is_active
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {tree.is_active ? "Active" : "Inactive"}
                        </span>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(tree)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => onDeleteTree(tree.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
