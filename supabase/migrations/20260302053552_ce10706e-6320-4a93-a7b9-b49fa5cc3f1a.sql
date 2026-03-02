
-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'land_partner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'verified_land_partner';

-- Create land_partner_applications table
CREATE TABLE public.land_partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT NOT NULL,
  land_size NUMERIC NOT NULL,
  land_unit TEXT NOT NULL DEFAULT 'acre',
  irrigation_type TEXT NOT NULL DEFAULT 'Rainfed',
  ownership_type TEXT NOT NULL DEFAULT 'Own',
  land_photos TEXT[] NOT NULL DEFAULT '{}',
  consent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'PendingVerification',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.land_partner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application"
  ON public.land_partner_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application"
  ON public.land_partner_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending application"
  ON public.land_partner_applications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'PendingVerification');

CREATE POLICY "Admins can view all applications"
  ON public.land_partner_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all applications"
  ON public.land_partner_applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create tree_allocations table
CREATE TABLE public.tree_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.land_partner_applications(id) ON DELETE CASCADE,
  tree_count INTEGER NOT NULL,
  species TEXT NOT NULL,
  plantation_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'allocated',
  notes TEXT,
  allocated_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tree_count_min CHECK (tree_count >= 10),
  CONSTRAINT tree_count_multiple CHECK (tree_count % 10 = 0)
);

ALTER TABLE public.tree_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own allocations"
  ON public.tree_allocations FOR SELECT
  USING (auth.uid() = partner_id);

CREATE POLICY "Admins can view all allocations"
  ON public.tree_allocations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert allocations"
  ON public.tree_allocations FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update allocations"
  ON public.tree_allocations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create allocation_logs table for audit
CREATE TABLE public.allocation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_id UUID REFERENCES public.tree_allocations(id),
  action TEXT NOT NULL,
  performed_by UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.allocation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage allocation logs"
  ON public.allocation_logs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert allocation logs"
  ON public.allocation_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for land photos
INSERT INTO storage.buckets (id, name, public) VALUES ('land-photos', 'land-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view land photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'land-photos');

CREATE POLICY "Authenticated users can upload land photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'land-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own land photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'land-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at
CREATE TRIGGER update_land_partner_applications_updated_at
  BEFORE UPDATE ON public.land_partner_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tree_allocations_updated_at
  BEFORE UPDATE ON public.tree_allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
