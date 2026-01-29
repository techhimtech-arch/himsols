-- Create plants table (similar to trees but for ornamental/indoor plants)
CREATE TABLE public.plants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_hi TEXT,
  scientific_name TEXT,
  description TEXT NOT NULL,
  description_hi TEXT,
  category TEXT NOT NULL DEFAULT 'Indoor',
  category_hi TEXT,
  price NUMERIC NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  care_level TEXT DEFAULT 'Easy',
  light_requirement TEXT DEFAULT 'Medium',
  water_requirement TEXT DEFAULT 'Moderate',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plant_images table for multiple images per plant
CREATE TABLE public.plant_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_images ENABLE ROW LEVEL SECURITY;

-- Plants RLS policies
CREATE POLICY "Admins can manage plants"
ON public.plants
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active plants"
ON public.plants
FOR SELECT
USING (is_active = true);

-- Plant images RLS policies
CREATE POLICY "Admins can manage plant images"
ON public.plant_images
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view plant images"
ON public.plant_images
FOR SELECT
USING (true);

-- Updated at trigger
CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON public.plants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();