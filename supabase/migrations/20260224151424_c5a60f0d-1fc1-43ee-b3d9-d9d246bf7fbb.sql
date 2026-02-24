
-- Carbon settings table for admin-configurable values
CREATE TABLE public.carbon_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.carbon_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage carbon settings" ON public.carbon_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view carbon settings" ON public.carbon_settings FOR SELECT USING (true);

-- Insert default carbon settings
INSERT INTO public.carbon_settings (key, value) VALUES
  ('tree_absorption_rate_kg', '20'),
  ('survival_rate_percent', '85'),
  ('target_trees', '100000'),
  ('current_trees', '15000'),
  ('active_sites', '12'),
  ('participating_farmers', '250'),
  ('plantation_data', '[{"month":"Jan","trees":500},{"month":"Feb","trees":800},{"month":"Mar","trees":1200},{"month":"Apr","trees":1800},{"month":"May","trees":2500},{"month":"Jun","trees":3200},{"month":"Jul","trees":4000},{"month":"Aug","trees":5500},{"month":"Sep","trees":7000},{"month":"Oct","trees":9500},{"month":"Nov","trees":12000},{"month":"Dec","trees":15000}]');

-- Farmer registrations table
CREATE TABLE public.farmer_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  mobile text NOT NULL,
  village text NOT NULL,
  district text NOT NULL,
  land_size_acres numeric,
  land_type text,
  interested_tree_types text[],
  irrigation_available boolean DEFAULT false,
  land_photo_url text,
  status text NOT NULL DEFAULT 'new',
  consent boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.farmer_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage farmer registrations" ON public.farmer_registrations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can register as farmer" ON public.farmer_registrations FOR INSERT WITH CHECK (true);

-- Create storage bucket for farmer land photos
INSERT INTO storage.buckets (id, name, public) VALUES ('farmer-photos', 'farmer-photos', true);

CREATE POLICY "Anyone can upload farmer photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'farmer-photos');
CREATE POLICY "Anyone can view farmer photos" ON storage.objects FOR SELECT USING (bucket_id = 'farmer-photos');
