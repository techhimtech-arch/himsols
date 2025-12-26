import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { compressImage, formatFileSize } from "@/lib/imageCompression";
import { Phone, Mail, MessageCircle, Facebook, Instagram, Twitter, Save, Loader2, Upload, Image as ImageIcon } from "lucide-react";

export const SettingsTab = () => {
  const { settings, isLoading, updateSetting } = useSiteSettings();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    contact_phone: "",
    contact_email: "",
    whatsapp_number: "",
    whatsapp_enabled: false,
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    logo_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        contact_phone: settings.contact_phone || "",
        contact_email: settings.contact_email || "",
        whatsapp_number: settings.whatsapp_number || "",
        whatsapp_enabled: settings.whatsapp_enabled === "true",
        facebook_url: settings.facebook_url || "",
        instagram_url: settings.instagram_url || "",
        twitter_url: settings.twitter_url || "",
        logo_url: settings.logo_url || "",
      });
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);

    try {
      // Compress the image
      const originalSize = file.size;
      const compressedBlob = await compressImage(file, 500, 500, 0.9);
      const compressedSize = compressedBlob.size;
      
      console.log(`Logo compressed: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)}`);

      // Upload to Supabase Storage
      const fileName = `logo-${Date.now()}.jpg`;
      const filePath = `branding/${fileName}`;

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

      setFormData({ ...formData, logo_url: urlData.publicUrl });

      toast({
        title: "Logo Uploaded",
        description: `Logo compressed (${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)}) and uploaded successfully.`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload logo.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: "contact_phone", value: formData.contact_phone }),
        updateSetting.mutateAsync({ key: "contact_email", value: formData.contact_email }),
        updateSetting.mutateAsync({ key: "whatsapp_number", value: formData.whatsapp_number }),
        updateSetting.mutateAsync({ key: "whatsapp_enabled", value: formData.whatsapp_enabled ? "true" : "false" }),
        updateSetting.mutateAsync({ key: "facebook_url", value: formData.facebook_url }),
        updateSetting.mutateAsync({ key: "instagram_url", value: formData.instagram_url }),
        updateSetting.mutateAsync({ key: "twitter_url", value: formData.twitter_url }),
        updateSetting.mutateAsync({ key: "logo_url", value: formData.logo_url }),
      ]);

      toast({
        title: "Success",
        description: "Settings saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Brand Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden bg-muted"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingLogo ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : formData.logo_url ? (
                <img 
                  src={formData.logo_url} 
                  alt="Logo Preview" 
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-center p-2">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div className="flex-1 space-y-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadingLogo ? "Uploading..." : "Upload Logo"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Upload your brand logo (PNG with transparent background recommended). Will appear in Navbar, Footer, and Login page.
              </p>
              <Input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="Or paste logo URL here"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="info@himsols.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            WhatsApp Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="whatsapp_enabled">Enable WhatsApp Button</Label>
              <p className="text-sm text-muted-foreground">Show floating WhatsApp button on the website</p>
            </div>
            <Switch
              id="whatsapp_enabled"
              checked={formData.whatsapp_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, whatsapp_enabled: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number (with country code, no +)</Label>
            <Input
              id="whatsapp_number"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="919876543210"
            />
            <p className="text-xs text-muted-foreground">Example: 919876543210 for +91 98765 43210</p>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facebook_url" className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook URL
            </Label>
            <Input
              id="facebook_url"
              value={formData.facebook_url}
              onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
              placeholder="https://facebook.com/himsols"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram_url" className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-500" />
              Instagram URL
            </Label>
            <Input
              id="instagram_url"
              value={formData.instagram_url}
              onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
              placeholder="https://instagram.com/himsols"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter_url" className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-sky-500" />
              Twitter/X URL
            </Label>
            <Input
              id="twitter_url"
              value={formData.twitter_url}
              onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
              placeholder="https://twitter.com/himsols"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </>
        )}
      </Button>
    </div>
  );
};
