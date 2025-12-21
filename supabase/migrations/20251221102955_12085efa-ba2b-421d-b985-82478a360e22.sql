-- Create site_settings table for admin-controllable settings
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings (for displaying on frontend)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
('contact_phone', '+91 98765 43210'),
('contact_email', 'info@himsols.com'),
('whatsapp_number', '919876543210'),
('whatsapp_enabled', 'true'),
('facebook_url', ''),
('instagram_url', ''),
('twitter_url', '');