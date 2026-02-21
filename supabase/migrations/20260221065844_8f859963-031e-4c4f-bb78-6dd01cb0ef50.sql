
-- 1. Villages table
CREATE TABLE public.villages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Himachal Pradesh',
  block TEXT,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  population INTEGER,
  current_tree_count INTEGER DEFAULT 0,
  trees_requested INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'registered',
  notes TEXT,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register a village" ON public.villages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all villages" ON public.villages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update villages" ON public.villages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete villages" ON public.villages FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_villages_updated_at BEFORE UPDATE ON public.villages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. CSR Partners table
CREATE TABLE public.csr_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL DEFAULT 'CSR',
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  interest_area TEXT,
  budget_range TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'inquiry',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.csr_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit CSR inquiry" ON public.csr_partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all CSR partners" ON public.csr_partners FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update CSR partners" ON public.csr_partners FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete CSR partners" ON public.csr_partners FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_csr_partners_updated_at BEFORE UPDATE ON public.csr_partners FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Nurseries table
CREATE TABLE public.nurseries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  district TEXT,
  state TEXT DEFAULT 'Himachal Pradesh',
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  specialization TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nurseries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active nurseries" ON public.nurseries FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage nurseries" ON public.nurseries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_nurseries_updated_at BEFORE UPDATE ON public.nurseries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Survival Updates table
CREATE TABLE public.survival_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  request_id UUID REFERENCES public.tree_plantation_requests(id),
  photo_url TEXT,
  health_status TEXT NOT NULL DEFAULT 'healthy',
  height_cm INTEGER,
  notes TEXT,
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.survival_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage survival updates" ON public.survival_updates FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their order updates" ON public.survival_updates FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  OR request_id IN (SELECT id FROM public.tree_plantation_requests WHERE user_id = auth.uid())
);

CREATE TRIGGER update_survival_updates_updated_at BEFORE UPDATE ON public.survival_updates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
