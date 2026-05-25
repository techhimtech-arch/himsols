
CREATE TABLE public.bulk_plantation_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name text NOT NULL,
  org_type text NOT NULL DEFAULT 'Panchayat',
  contact_person text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  state text,
  district text,
  village text,
  pin_code text,
  tree_quantity integer NOT NULL CHECK (tree_quantity >= 100),
  preferred_month text,
  land_type text,
  notes text,
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new',
  quoted_price_per_tree numeric,
  quoted_transport_charge numeric,
  quoted_total numeric,
  quote_sent_at timestamptz,
  payment_mode text,
  payment_reference text,
  paid_at timestamptz,
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bulk_plantation_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a bulk plantation inquiry"
  ON public.bulk_plantation_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all bulk plantation inquiries"
  ON public.bulk_plantation_inquiries FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bulk plantation inquiries"
  ON public.bulk_plantation_inquiries FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete bulk plantation inquiries"
  ON public.bulk_plantation_inquiries FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_bulk_plantation_inquiries_updated_at
  BEFORE UPDATE ON public.bulk_plantation_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
