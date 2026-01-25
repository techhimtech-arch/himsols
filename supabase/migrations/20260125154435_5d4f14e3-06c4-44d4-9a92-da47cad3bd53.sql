
-- Create table for homepage live stats
CREATE TABLE public.live_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon TEXT NOT NULL DEFAULT 'TreePine',
  value INTEGER NOT NULL DEFAULT 0,
  suffix TEXT DEFAULT '',
  label TEXT NOT NULL,
  sublabel TEXT,
  color TEXT NOT NULL DEFAULT 'primary',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active live stats" 
ON public.live_stats 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage live stats" 
ON public.live_stats 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default data
INSERT INTO public.live_stats (icon, value, suffix, label, sublabel, color, sort_order) VALUES
('TreePine', 450, '+', 'Trees Planted', 'This Year', 'primary', 1),
('MapPin', 5, '', 'Villages Onboarded', 'Active Regions', 'secondary', 2),
('Users', 120, '+', 'Community Members', 'And Growing', 'primary', 3),
('Recycle', 2, 'T', 'Scrap Recycled', 'Tonnes Saved', 'secondary', 4);
