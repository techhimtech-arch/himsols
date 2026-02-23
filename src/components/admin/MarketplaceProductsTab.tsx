import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Package, Store, Upload, X, ImageIcon } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type MarketplaceCategory = Database["public"]["Enums"]["marketplace_category"];

interface MarketplaceProduct {
  id: string;
  name: string;
  name_hi: string | null;
  category: MarketplaceCategory;
  subcategory: string | null;
  seller_id: string | null;
  origin_location: string | null;
  description: string;
  description_hi: string | null;
  price: number;
  unit: string;
  stock_quantity: number;
  delivery_timeline: string | null;
  image_url: string | null;
  is_seasonal: boolean;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  seller?: { name: string } | null;
}

interface Seller {
  id: string;
  name: string;
}

const categoryLabels: Record<MarketplaceCategory, string> = {
  farmer_produce: "Farmer Produce",
  value_added: "Value Added",
  plants_gardening: "Plants & Garden",
  home_utility: "Home & Utility",
};

export const MarketplaceProductsTab = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    name_hi: "",
    category: "farmer_produce" as MarketplaceCategory,
    subcategory: "",
    seller_id: "",
    origin_location: "",
    description: "",
    description_hi: "",
    price: "",
    unit: "kg",
    stock_quantity: "",
    delivery_timeline: "3-5 days",
    image_url: "",
    is_seasonal: false,
    is_active: true,
    is_featured: false,
    sort_order: 0,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-marketplace-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select("*, seller:sellers(name)")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as MarketplaceProduct[];
    },
  });

  const { data: sellers } = useQuery({
    queryKey: ["admin-sellers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Seller[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        name: data.name,
        name_hi: data.name_hi || null,
        category: data.category,
        subcategory: data.subcategory || null,
        seller_id: data.seller_id || null,
        origin_location: data.origin_location || null,
        description: data.description,
        description_hi: data.description_hi || null,
        price: parseFloat(data.price),
        unit: data.unit,
        stock_quantity: parseInt(data.stock_quantity) || 0,
        delivery_timeline: data.delivery_timeline || null,
        image_url: data.image_url || null,
        is_seasonal: data.is_seasonal,
        is_active: data.is_active,
        is_featured: data.is_featured,
        sort_order: data.sort_order,
      };

      if (data.id) {
        const { error } = await supabase
          .from("marketplace_products")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("marketplace_products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-marketplace-products"] });
      toast.success(editingProduct ? "Product updated" : "Product added");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marketplace_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-marketplace-products"] });
      toast.success("Product deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      name_hi: "",
      category: "farmer_produce",
      subcategory: "",
      seller_id: "",
      origin_location: "",
      description: "",
      description_hi: "",
      price: "",
      unit: "kg",
      stock_quantity: "",
      delivery_timeline: "3-5 days",
      image_url: "",
      is_seasonal: false,
      is_active: true,
      is_featured: false,
      sort_order: 0,
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (product: MarketplaceProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_hi: product.name_hi || "",
      category: product.category,
      subcategory: product.subcategory || "",
      seller_id: product.seller_id || "",
      origin_location: product.origin_location || "",
      description: product.description,
      description_hi: product.description_hi || "",
      price: product.price.toString(),
      unit: product.unit,
      stock_quantity: product.stock_quantity.toString(),
      delivery_timeline: product.delivery_timeline || "3-5 days",
      image_url: product.image_url || "",
      is_seasonal: product.is_seasonal || false,
      is_active: product.is_active,
      is_featured: product.is_featured || false,
      sort_order: product.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file, 800, 800, 0.85);
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error } = await supabase.storage
          .from("marketplace-images")
          .upload(fileName, compressed, { contentType: "image/jpeg" });
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from("marketplace-images")
          .getPublicUrl(fileName);
        uploadedUrls.push(urlData.publicUrl);
      }
      // Use first image as main image_url
      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({ ...prev, image_url: uploadedUrls[0] }));
      }
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error: any) {
      toast.error(error.message || "Image upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingProduct?.id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Marketplace Products ({products?.length || 0})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (English) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_hi">Name (Hindi)</Label>
                  <Input
                    id="name_hi"
                    value={formData.name_hi}
                    onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: MarketplaceCategory) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g., Fruits, Vegetables"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seller</Label>
                  <Select
                    value={formData.seller_id || "none"}
                    onValueChange={(value) => setFormData({ ...formData, seller_id: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select seller" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No seller</SelectItem>
                      {sellers?.map((seller) => (
                        <SelectItem key={seller.id} value={seller.id}>
                          {seller.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin Location</Label>
                  <Input
                    id="origin"
                    value={formData.origin_location}
                    onChange={(e) => setFormData({ ...formData, origin_location: e.target.value })}
                    placeholder="e.g., Kinnaur, HP"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_hi">Description (Hindi)</Label>
                <Textarea
                  id="description_hi"
                  value={formData.description_hi}
                  onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="kg, piece, litre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery">Delivery Timeline</Label>
                  <Input
                    id="delivery"
                    value={formData.delivery_timeline}
                    onChange={(e) => setFormData({ ...formData, delivery_timeline: e.target.value })}
                    placeholder="e.g., 3-5 days"
                  />
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

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                {formData.image_url ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.image_url}
                      alt="Product"
                      className="w-32 h-32 rounded-lg object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Uploading & compressing...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload image</p>
                        <p className="text-xs text-muted-foreground">Auto-compressed for fast loading</p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_seasonal}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_seasonal: checked })}
                  />
                  <Label>Seasonal</Label>
                </div>
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
                  <Label className="text-primary font-medium">⭐ Featured on Homepage</Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.subcategory && (
                        <p className="text-xs text-muted-foreground">{product.subcategory}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{categoryLabels[product.category]}</Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {product.seller?.name || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  ₹{product.price}/{product.unit}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      product.stock_quantity < 1
                        ? "text-destructive"
                        : product.stock_quantity < 10
                        ? "text-amber-600"
                        : ""
                    }
                  >
                    {product.stock_quantity}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {product.is_active ? (
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {product.is_seasonal && (
                      <Badge className="bg-orange-100 text-orange-700">Seasonal</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No products added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
