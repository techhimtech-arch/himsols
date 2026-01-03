-- Create partner_types table for dynamic partner section
CREATE TABLE public.partner_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon TEXT NOT NULL DEFAULT 'Building2',
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_types ENABLE ROW LEVEL SECURITY;

-- Admins can manage partner types
CREATE POLICY "Admins can manage partner types"
ON public.partner_types
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active partner types
CREATE POLICY "Anyone can view active partner types"
ON public.partner_types
FOR SELECT
USING (is_active = true);

-- Insert default partner types
INSERT INTO public.partner_types (icon, label, sort_order) VALUES
('Building2', '5 Panchayats', 0),
('School', '3 Schools', 1),
('Users2', '2 NGOs', 2),
('Leaf', '4 Nurseries', 3);