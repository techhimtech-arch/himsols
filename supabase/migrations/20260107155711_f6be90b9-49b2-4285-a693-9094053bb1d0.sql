-- Create function for updating timestamps if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for external Himsols apps/links
CREATE TABLE public.external_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'ExternalLink',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_apps ENABLE ROW LEVEL SECURITY;

-- Anyone can view active apps
CREATE POLICY "Anyone can view active external apps"
ON public.external_apps
FOR SELECT
USING (is_active = true);

-- Only admins can manage
CREATE POLICY "Admins can manage external apps"
ON public.external_apps
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_external_apps_updated_at
BEFORE UPDATE ON public.external_apps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();