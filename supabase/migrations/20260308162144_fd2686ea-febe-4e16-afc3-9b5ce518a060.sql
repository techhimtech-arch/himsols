-- Add land_partner to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'land_partner';

-- Add state column to farmer_registrations
ALTER TABLE public.farmer_registrations 
ADD COLUMN IF NOT EXISTS state text DEFAULT 'Himachal Pradesh';

-- Seed the Climate Impact Pack tree product (needed by purchase-climate-pack edge function)
INSERT INTO public.trees (name, scientific_name, description, category, price, stock_quantity, is_active, is_featured, image_url, growth_rate, max_height)
VALUES (
  'Climate Impact Pack',
  'Mixed Native Species',
  '10 native trees planted on verified farmer land with geo-tag proof, survival tracking, and CO₂ offset certificate.',
  'Pack',
  2999,
  9999,
  true,
  true,
  null,
  'Varies',
  'Varies'
)
ON CONFLICT DO NOTHING;