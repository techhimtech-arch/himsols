import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SEO, CollectionPageSchema } from "@/components/SEO";

interface PlantationPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

const Gallery = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PlantationPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    caption: "",
    latitude: "",
    longitude: "",
  });
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  useEffect(() => {
    loadPhotos();
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("plantation_photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      console.error("Error loading photos:", error);
      toast({
        title: "Error",
        description: "Failed to load gallery photos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserOrders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, tree_id, quantity, status, created_at")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (error) throw error;
      setUserOrders(data || []);
    } catch (error: any) {
      console.error("Error loading orders:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile || !selectedOrderId) {
      toast({
        title: "Error",
        description: "Please select a file and order.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError, data: storageData } = await supabase.storage
        .from("tree-photos")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("tree-photos")
        .getPublicUrl(fileName);

      // Insert photo record
      const photoData = {
        order_id: selectedOrderId,
        photo_url: urlData.publicUrl,
        caption: uploadData.caption || null,
        latitude: uploadData.latitude ? parseFloat(uploadData.latitude) : null,
        longitude: uploadData.longitude ? parseFloat(uploadData.longitude) : null,
        uploaded_by: user.id,
      };

      const { error: insertError } = await supabase.from("plantation_photos").insert(photoData);

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "Photo uploaded successfully.",
      });

      setSelectedFile(null);
      setUploadData({ caption: "", latitude: "", longitude: "" });
      setSelectedOrderId("");
      loadPhotos();
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <Camera className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-6">Plantation Gallery</h1>
          <p className="text-xl max-w-3xl mx-auto">
            A visual journey of our tree plantation efforts across Himachal Pradesh.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      {user && userOrders.length > 0 && (
        <section className="py-8 px-4 bg-muted">
          <div className="container mx-auto max-w-2xl">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Plantation Photo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Plantation Photo</DialogTitle>
                  <DialogDescription>
                    Share photos of your completed tree plantation.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="order">Select Order</Label>
                    <select
                      id="order"
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select an order...</option>
                      {userOrders.map((order) => (
                        <option key={order.id} value={order.id}>
                          Order {order.id.slice(0, 8)} - {order.quantity} tree(s)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo">Photo</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caption">Caption (Optional)</Label>
                    <Textarea
                      id="caption"
                      value={uploadData.caption}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, caption: e.target.value })
                      }
                      placeholder="Describe your plantation..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude (Optional)</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={uploadData.latitude}
                        onChange={(e) =>
                          setUploadData({ ...uploadData, latitude: e.target.value })
                        }
                        placeholder="e.g., 31.1048"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude (Optional)</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={uploadData.longitude}
                        onChange={(e) =>
                          setUploadData({ ...uploadData, longitude: e.target.value })
                        }
                        placeholder="e.g., 77.1734"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      )}

      {/* Gallery Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading gallery...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No photos yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden hover:shadow-hover transition-all duration-300">
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || "Plantation photo"}
                    className="w-full h-64 object-cover"
                  />
                  <CardContent className="p-4">
                    {photo.caption && (
                      <p className="text-foreground mb-2">{photo.caption}</p>
                    )}
                    {photo.latitude && photo.longitude && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(photo.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
