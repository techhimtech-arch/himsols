-- Create navigation_items table for dynamic navbar
CREATE TABLE public.navigation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  label_hi TEXT,
  path TEXT NOT NULL,
  icon TEXT DEFAULT 'Link',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_visible_mobile BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES public.navigation_items(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create footer_links table for dynamic footer
CREATE TABLE public.footer_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL, -- 'services', 'company', 'support', 'social'
  label TEXT NOT NULL,
  label_hi TEXT,
  url TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_external BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

-- Navigation items policies
CREATE POLICY "Anyone can view active navigation items"
  ON public.navigation_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage navigation items"
  ON public.navigation_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Footer links policies
CREATE POLICY "Anyone can view active footer links"
  ON public.footer_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage footer links"
  ON public.footer_links FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_navigation_items_updated_at
  BEFORE UPDATE ON public.navigation_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_footer_links_updated_at
  BEFORE UPDATE ON public.footer_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default navigation items
INSERT INTO public.navigation_items (label, label_hi, path, icon, sort_order) VALUES
  ('Home', 'होम', '/', 'Home', 1),
  ('Plant Trees', 'पेड़ लगाएं', '/tree-plantation', 'TreePine', 2),
  ('Campaigns', 'अभियान', '/campaigns', 'Heart', 3),
  ('Marketplace', 'मार्केटप्लेस', '/marketplace', 'ShoppingBag', 4),
  ('Plants', 'पौधे', '/plants', 'Leaf', 5),
  ('Services', 'सेवाएं', '/services', 'Wrench', 6),
  ('Gift Cards', 'गिफ्ट कार्ड्स', '/gift-cards', 'Gift', 7),
  ('Blog', 'ब्लॉग', '/blog', 'FileText', 8),
  ('Corporate', 'कॉर्पोरेट', '/corporate', 'Building2', 9),
  ('Contact', 'संपर्क', '/contact', 'Phone', 10);

-- Insert default footer links
INSERT INTO public.footer_links (section, label, label_hi, url, icon, sort_order, is_external) VALUES
  -- Services section
  ('services', 'Tree Plantation', 'पेड़ लगाना', '/tree-plantation', 'TreePine', 1, false),
  ('services', 'Waste Management', 'कचरा प्रबंधन', '/waste-management', 'Recycle', 2, false),
  ('services', 'Plant Nursery', 'पौध नर्सरी', '/plants', 'Leaf', 3, false),
  ('services', 'Marketplace', 'मार्केटप्लेस', '/marketplace', 'ShoppingBag', 4, false),
  -- Company section
  ('company', 'About Us', 'हमारे बारे में', '/services', 'Info', 1, false),
  ('company', 'Blog', 'ब्लॉग', '/blog', 'FileText', 2, false),
  ('company', 'Gallery', 'गैलरी', '/gallery', 'Image', 3, false),
  ('company', 'Corporate', 'कॉर्पोरेट', '/corporate', 'Building2', 4, false),
  -- Support section
  ('support', 'Contact Us', 'संपर्क करें', '/contact', 'Phone', 1, false),
  ('support', 'Gift Cards', 'गिफ्ट कार्ड', '/gift-cards', 'Gift', 2, false),
  ('support', 'Track Request', 'अनुरोध ट्रैक करें', '/track', 'Search', 3, false);