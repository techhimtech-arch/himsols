import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Image, Upload, Images, X, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { compressImage, formatFileSize } from "@/lib/imageCompression";
import { readExifGps, getDeviceLocation, GOOGLE_MAPS_LINK } from "@/lib/exifGps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Crosshair, ExternalLink } from "lucide-react";

interface PlantationPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  batch_id?: string | null;
  taken_at?: string | null;
  gps_source?: string | null;
  gps_accuracy_m?: number | null;
}

interface BulkUploadFile {
  file: File;
  preview: string;
  caption: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  latitude: number | null;
  longitude: number | null;
  takenAt: string | null;
}

interface BatchOption {
  batch_id: string;
  species: string;
  plantation_date: string;
}

const NO_BATCH = "__none__";

export const ActivityPhotosTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<PlantationPhoto[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PlantationPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    caption: "",
    latitude: "",
    longitude: "",
    batchId: NO_BATCH,
    takenAt: "",
  });
  const [gpsSource, setGpsSource] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  // Bulk upload state
  const [bulkFiles, setBulkFiles] = useState<BulkUploadFile[]>([]);
  const [bulkBatchId, setBulkBatchId] = useState<string>(NO_BATCH);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  useEffect(() => {
    loadPhotos();
    loadBatches();
  }, []);

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
        description: "Failed to load photos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async () => {
    const [allocRes, ownRes] = await Promise.all([
      supabase
        .from("tree_allocations")
        .select("batch_id, species, plantation_date")
        .not("batch_id", "is", null)
        .order("plantation_date", { ascending: false })
        .limit(200),
      supabase
        .from("plantation_batches")
        .select("batch_code, species, plantation_date")
        .order("plantation_date", { ascending: false })
        .limit(200),
    ]);

    if (allocRes.error) console.error("Error loading allocation batches:", allocRes.error);
    if (ownRes.error) console.error("Error loading plantation batches:", ownRes.error);

    const rows: BatchOption[] = [
      ...(ownRes.data || []).map((r: any) => ({
        batch_id: r.batch_code,
        species: r.species,
        plantation_date: r.plantation_date,
      })),
      ...(allocRes.data || []).map((r: any) => ({
        batch_id: r.batch_id,
        species: r.species,
        plantation_date: r.plantation_date,
      })),
    ];

    const seen = new Set<string>();
    const unique: BatchOption[] = [];
    rows.forEach((row) => {
      if (row.batch_id && !seen.has(row.batch_id)) {
        seen.add(row.batch_id);
        unique.push(row);
      }
    });
    setBatches(unique);
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalSize = file.size;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCompressionInfo(`Original: ${formatFileSize(originalSize)} → Will be compressed on upload`);

    // Read GPS + capture time straight from the camera's EXIF data.
    const exif = await readExifGps(file);
    if (exif.latitude !== null && exif.longitude !== null) {
      setFormData((prev) => ({
        ...prev,
        latitude: exif.latitude!.toFixed(6),
        longitude: exif.longitude!.toFixed(6),
        takenAt: exif.takenAt || prev.takenAt,
      }));
      setGpsSource("exif");
      setGpsAccuracy(null);
      toast({
        title: "GPS found in photo",
        description: `${exif.latitude.toFixed(5)}, ${exif.longitude.toFixed(5)} — read from camera metadata.`,
      });
    } else {
      setGpsSource(null);
      setGpsAccuracy(null);
      setFormData((prev) => ({ ...prev, takenAt: exif.takenAt || prev.takenAt }));
      toast({
        title: "No GPS in this photo",
        description:
          "WhatsApp/screenshot images lose metadata. Use the original camera file, or tag with your current location while standing at the site.",
        variant: "destructive",
      });
    }
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const loc = await getDeviceLocation();
      setFormData((prev) => ({
        ...prev,
        latitude: loc.latitude.toFixed(6),
        longitude: loc.longitude.toFixed(6),
      }));
      setGpsSource("device");
      setGpsAccuracy(Math.round(loc.accuracy));
      toast({
        title: "Location tagged",
        description: `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)} (±${Math.round(loc.accuracy)}m)`,
      });
    } catch (err: any) {
      toast({
        title: "Location failed",
        description: err.message || "Could not read your location.",
        variant: "destructive",
      });
    } finally {
      setLocating(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    // Compress the image before uploading
    const originalSize = file.size;
    const compressedBlob = await compressImage(file, 1200, 1200, 0.8);
    const compressedSize = compressedBlob.size;
    
    console.log(`Image compressed: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${Math.round((1 - compressedSize / originalSize) * 100)}% reduction)`);
    setCompressionInfo(`Compressed: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)}`);

    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    const filePath = `activity/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("tree-photos")
      .upload(filePath, compressedBlob, {
        contentType: 'image/jpeg'
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("tree-photos")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // Bulk upload handlers — EXIF GPS is read per file before compression
  const handleBulkFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: BulkUploadFile[] = await Promise.all(
      files.map(async (file) => {
        const exif = await readExifGps(file);
        return {
          file,
          preview: URL.createObjectURL(file),
          caption: "",
          status: 'pending' as const,
          progress: 0,
          latitude: exif.latitude,
          longitude: exif.longitude,
          takenAt: exif.takenAt,
        };
      }),
    );
    setBulkFiles(prev => [...prev, ...newFiles]);
  };

  const updateBulkFileCaption = (index: number, caption: string) => {
    setBulkFiles(prev => prev.map((f, i) => i === index ? { ...f, caption } : f));
  };

  const removeBulkFile = (index: number) => {
    setBulkFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleBulkUpload = async () => {
    if (!user || bulkFiles.length === 0) return;
    
    setBulkUploading(true);
    setBulkProgress(0);
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < bulkFiles.length; i++) {
      const bulkFile = bulkFiles[i];
      
      // Update status to uploading
      setBulkFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' as const, progress: 50 } : f
      ));

      try {
        const photoUrl = await uploadImageForBulk(bulkFile.file);
        
        const { error } = await supabase
          .from("plantation_photos")
          .insert({
            photo_url: photoUrl,
            caption: bulkFile.caption || null,
            uploaded_by: user.id,
            batch_id: bulkBatchId === NO_BATCH ? null : bulkBatchId,
            latitude: bulkFile.latitude,
            longitude: bulkFile.longitude,
            taken_at: bulkFile.takenAt,
            gps_source: bulkFile.latitude !== null ? "exif" : null,
          });

        if (error) throw error;

        // Update status to done
        setBulkFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'done' as const, progress: 100 } : f
        ));
        successCount++;
      } catch (error) {
        console.error("Error uploading file:", error);
        setBulkFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error' as const, progress: 0 } : f
        ));
        errorCount++;
      }

      setBulkProgress(Math.round(((i + 1) / bulkFiles.length) * 100));
    }

    setBulkUploading(false);
    
    toast({
      title: "Bulk Upload Complete",
      description: `${successCount} photos uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
      variant: errorCount > 0 ? "destructive" : "default"
    });

    if (successCount > 0) {
      loadPhotos();
    }
  };

  const uploadImageForBulk = async (file: File): Promise<string> => {
    const compressedBlob = await compressImage(file, 1200, 1200, 0.8);
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    const filePath = `activity/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("tree-photos")
      .upload(filePath, compressedBlob, { contentType: 'image/jpeg' });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("tree-photos")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const resetBulkUpload = () => {
    bulkFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setBulkFiles([]);
    setBulkProgress(0);
    setBulkDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUploading(true);
    try {
      let photoUrl = editingPhoto?.photo_url || "";

      if (selectedFile) {
        photoUrl = await uploadImage(selectedFile);
      }

      if (!photoUrl) {
        toast({
          title: "Error",
          description: "Please select an image to upload.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      const photoData = {
        photo_url: photoUrl,
        caption: formData.caption || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        uploaded_by: user.id,
        batch_id: formData.batchId === NO_BATCH ? null : formData.batchId,
        taken_at: formData.takenAt || null,
        gps_source: formData.latitude ? gpsSource || "manual" : null,
        gps_accuracy_m: gpsAccuracy,
      };

      if (editingPhoto) {
        const { error } = await supabase
          .from("plantation_photos")
          .update(photoData)
          .eq("id", editingPhoto.id);

        if (error) throw error;
        toast({ title: "Success", description: "Photo updated successfully." });
      } else {
        const { error } = await supabase
          .from("plantation_photos")
          .insert(photoData);

        if (error) throw error;
        toast({ title: "Success", description: "Photo added successfully." });
      }

      resetForm();
      loadPhotos();
    } catch (error: any) {
      console.error("Error saving photo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save photo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (photo: PlantationPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      caption: photo.caption || "",
      latitude: photo.latitude?.toString() || "",
      longitude: photo.longitude?.toString() || "",
      batchId: photo.batch_id || NO_BATCH,
      takenAt: photo.taken_at || "",
    });
    setGpsSource(photo.gps_source || null);
    setGpsAccuracy(photo.gps_accuracy_m ?? null);
    setPreviewUrl(photo.photo_url);
    setDialogOpen(true);
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const { error } = await supabase
        .from("plantation_photos")
        .delete()
        .eq("id", photoId);

      if (error) throw error;

      toast({ title: "Success", description: "Photo deleted successfully." });
      loadPhotos();
    } catch (error: any) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete photo.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ caption: "", latitude: "", longitude: "", batchId: NO_BATCH, takenAt: "" });
    setGpsSource(null);
    setGpsAccuracy(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCompressionInfo(null);
    setEditingPhoto(null);
    setDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Activity Photos
        </CardTitle>
        <div className="flex gap-2">
          {/* Bulk Upload Dialog */}
          <Dialog open={bulkDialogOpen} onOpenChange={(open) => {
            setBulkDialogOpen(open);
            if (!open) resetBulkUpload();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Images className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Upload Photos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Batch link for the whole set */}
                <div className="space-y-2">
                  <Label>Link all photos to batch</Label>
                  <Select
                    value={bulkBatchId}
                    onValueChange={setBulkBatchId}
                    disabled={bulkUploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No batch — gallery only" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_BATCH}>No batch — gallery only</SelectItem>
                      {batches.map((b) => (
                        <SelectItem key={b.batch_id} value={b.batch_id}>
                          {b.batch_id} · {b.species} ·{" "}
                          {new Date(b.plantation_date).toLocaleDateString("en-IN")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File selector */}
                <div className="space-y-2">
                  <Label>Select Multiple Images</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBulkFileSelect}
                    disabled={bulkUploading}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    GPS and capture time are read from each photo's camera metadata before
                    compression. Upload original files for real geo-tagged proof.
                  </p>
                </div>

                {/* Selected files preview */}
                {bulkFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{bulkFiles.length} image(s) selected</Label>
                      {!bulkUploading && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            bulkFiles.forEach(f => URL.revokeObjectURL(f.preview));
                            setBulkFiles([]);
                          }}
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                      {bulkFiles.map((bulkFile, index) => (
                        <div 
                          key={index} 
                          className={`relative border rounded-lg p-2 space-y-2 ${
                            bulkFile.status === 'done' ? 'border-green-500 bg-green-500/10' :
                            bulkFile.status === 'error' ? 'border-destructive bg-destructive/10' :
                            bulkFile.status === 'uploading' ? 'border-primary bg-primary/10' :
                            'border-border'
                          }`}
                        >
                          <img
                            src={bulkFile.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <Input
                            placeholder="Caption (optional)"
                            value={bulkFile.caption}
                            onChange={(e) => updateBulkFileCaption(index, e.target.value)}
                            disabled={bulkUploading}
                            className="text-xs h-8"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {bulkFile.latitude !== null ? (
                                <Badge variant="secondary" className="text-[10px]">
                                  <MapPin className="h-3 w-3 mr-1" />GPS
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[10px]">No GPS</Badge>
                              )}
                            </span>
                            {bulkFile.status === 'done' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {bulkFile.status === 'uploading' && (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            )}
                            {bulkFile.status === 'pending' && !bulkUploading && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => removeBulkFile(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Upload progress */}
                    {bulkUploading && (
                      <div className="space-y-2">
                        <Progress value={bulkProgress} className="h-2" />
                        <p className="text-sm text-center text-muted-foreground">
                          Uploading... {bulkProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={resetBulkUpload}
                    disabled={bulkUploading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkUpload}
                    disabled={bulkFiles.length === 0 || bulkUploading || bulkFiles.every(f => f.status === 'done')}
                  >
                    {bulkUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {bulkFiles.filter(f => f.status === 'pending').length} Photos
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Single photo dialog */}
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPhoto ? "Edit Photo" : "Add Activity Photo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo">Photo</Label>
                <div className="flex flex-col gap-2">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex items-center gap-2">
                  <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {compressionInfo && (
                    <p className="text-xs text-muted-foreground">{compressionInfo}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="e.g., Plantation drive at XYZ Panchayat"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Link to plantation batch (recommended)</Label>
                <Select
                  value={formData.batchId}
                  onValueChange={(v) => setFormData({ ...formData, batchId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No batch — gallery only" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_BATCH}>No batch — gallery only</SelectItem>
                    {batches.map((b) => (
                      <SelectItem key={b.batch_id} value={b.batch_id}>
                        {b.batch_id} · {b.species} ·{" "}
                        {new Date(b.plantation_date).toLocaleDateString("en-IN")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Linked photos appear on the public proof page /batch/&lt;code&gt;.
                </p>
              </div>

              {/* GPS proof block */}
              <div className="space-y-3 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    GPS proof
                  </Label>
                  {gpsSource === "exif" && <Badge variant="secondary">From camera EXIF</Badge>}
                  {gpsSource === "device" && (
                    <Badge variant="secondary">
                      Device location{gpsAccuracy ? ` ±${gpsAccuracy}m` : ""}
                    </Badge>
                  )}
                  {gpsSource === "manual" && <Badge variant="outline">Entered manually</Badge>}
                  {!gpsSource && !formData.latitude && (
                    <Badge variant="destructive">No GPS yet</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => {
                        setFormData({ ...formData, latitude: e.target.value });
                        setGpsSource("manual");
                        setGpsAccuracy(null);
                      }}
                      placeholder="31.1048"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => {
                        setFormData({ ...formData, longitude: e.target.value });
                        setGpsSource("manual");
                        setGpsAccuracy(null);
                      }}
                      placeholder="77.1734"
                    />
                  </div>
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
                  {formData.latitude && formData.longitude && (
                    <a
                      href={GOOGLE_MAPS_LINK(
                        parseFloat(formData.latitude),
                        parseFloat(formData.longitude),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary underline"
                    >
                      Verify on map <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="takenAt" className="text-xs">
                    Photo taken at (auto-filled from camera when available)
                  </Label>
                  <Input
                    id="takenAt"
                    type="datetime-local"
                    value={formData.takenAt ? formData.takenAt.slice(0, 16) : ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        takenAt: e.target.value ? new Date(e.target.value).toISOString() : "",
                      })
                    }
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Best proof: upload the <strong>original camera file</strong> (not a WhatsApp
                  forward) — GPS and time are read automatically. If metadata is missing, stand at
                  the site and tag your current location.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingPhoto ? "Updating..." : "Uploading..."}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {editingPhoto ? "Update" : "Upload"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No activity photos yet. Add your first photo!
          </p>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {photos.map((photo) => (
                <div key={photo.id} className="border rounded-lg p-4 space-y-3">
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || "Activity photo"}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <p className="text-sm font-medium">{photo.caption || "No caption"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(photo.created_at)}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(photo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(photo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Photo</TableHead>
                    <TableHead>Caption</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>GPS proof</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {photos.map((photo) => (
                    <TableRow key={photo.id}>
                      <TableCell>
                        <img
                          src={photo.photo_url}
                          alt={photo.caption || "Activity photo"}
                          className="w-20 h-14 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {photo.caption || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {photo.batch_id || "-"}
                      </TableCell>
                      <TableCell>
                        {photo.latitude && photo.longitude ? (
                          <div className="space-y-1">
                            <a
                              href={GOOGLE_MAPS_LINK(photo.latitude, photo.longitude)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary underline inline-flex items-center gap-1"
                            >
                              {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <div>
                              <Badge
                                variant={photo.gps_source === "exif" ? "secondary" : "outline"}
                                className="text-[10px]"
                              >
                                {photo.gps_source === "exif"
                                  ? "camera EXIF"
                                  : photo.gps_source === "device"
                                    ? "device"
                                    : "manual"}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">No GPS</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(photo.taken_at || photo.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(photo)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(photo.id)}>
                            <Trash2 className="h-4 w-4" />
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
