
DO $$ BEGIN
  CREATE TYPE public.school_partnership_status AS ENUM ('new','contacted','scheduled','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.school_partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name text NOT NULL,
  institution_type text NOT NULL DEFAULT 'school',
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text,
  state text,
  student_count integer,
  program_interest text[] NOT NULL DEFAULT '{}',
  preferred_date date,
  message text,
  status public.school_partnership_status NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a school partnership application"
  ON public.school_partnerships FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all school partnerships"
  ON public.school_partnerships FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update school partnerships"
  ON public.school_partnerships FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete school partnerships"
  ON public.school_partnerships FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_school_partnerships_updated_at
  BEFORE UPDATE ON public.school_partnerships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_school_partnerships_status ON public.school_partnerships(status);
CREATE INDEX IF NOT EXISTS idx_school_partnerships_created_at ON public.school_partnerships(created_at DESC);
