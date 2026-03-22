
-- 1. Create scrap_types master table
CREATE TABLE public.scrap_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_hi text,
  category text,
  rate_per_kg numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.scrap_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active scrap types" ON public.scrap_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage scrap types" ON public.scrap_types
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Create scrap_request_items junction table
CREATE TABLE public.scrap_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.waste_management_requests(id) ON DELETE CASCADE,
  scrap_type_id uuid NOT NULL REFERENCES public.scrap_types(id),
  estimated_qty_kg numeric,
  actual_qty_kg numeric,
  rate_at_collection numeric,
  line_total numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.scrap_request_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own request items" ON public.scrap_request_items
  FOR SELECT USING (
    request_id IN (SELECT id FROM public.waste_management_requests WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own request items" ON public.scrap_request_items
  FOR INSERT WITH CHECK (
    request_id IN (SELECT id FROM public.waste_management_requests WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage scrap request items" ON public.scrap_request_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Seed default scrap types
INSERT INTO public.scrap_types (name, name_hi, category, rate_per_kg, unit, sort_order) VALUES
  ('Iron/Steel', 'लोहा/स्टील', 'Metal', 22, 'kg', 1),
  ('Copper', 'तांबा', 'Metal', 450, 'kg', 2),
  ('Aluminium', 'एल्युमीनियम', 'Metal', 110, 'kg', 3),
  ('Brass', 'पीतल', 'Metal', 350, 'kg', 4),
  ('Paper/Cardboard', 'कागज/गत्ता', 'Paper', 12, 'kg', 5),
  ('Plastic (Mixed)', 'प्लास्टिक (मिश्रित)', 'Plastic', 10, 'kg', 6),
  ('E-Waste', 'ई-कचरा', 'E-Waste', 15, 'kg', 7),
  ('Glass', 'कांच', 'Glass', 3, 'kg', 8),
  ('Batteries', 'बैटरी', 'Hazardous', 50, 'kg', 9),
  ('Textile/Fabric', 'कपड़ा', 'Textile', 8, 'kg', 10),
  ('Old Furniture', 'पुराना फर्नीचर', 'Other', 5, 'kg', 11);

-- 4. Trigger for updated_at on scrap_types
CREATE TRIGGER update_scrap_types_updated_at
  BEFORE UPDATE ON public.scrap_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
