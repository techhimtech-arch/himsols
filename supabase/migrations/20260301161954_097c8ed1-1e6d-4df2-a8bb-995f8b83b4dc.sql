
-- Create a simple visitor counter table
CREATE TABLE public.site_visitors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL,
  visited_at timestamp with time zone NOT NULL DEFAULT now(),
  page_path text DEFAULT '/'
);

-- Enable RLS
ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (to record visits)
CREATE POLICY "Anyone can record visits"
ON public.site_visitors
FOR INSERT
WITH CHECK (true);

-- Anyone can count visitors (SELECT)
CREATE POLICY "Anyone can read visitor count"
ON public.site_visitors
FOR SELECT
USING (true);

-- Create a unique visitor count function
CREATE OR REPLACE FUNCTION public.get_visitor_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COUNT(DISTINCT visitor_id) FROM public.site_visitors;
$$;

-- Function to record a visit (upsert-like, one per visitor per day)
CREATE OR REPLACE FUNCTION public.record_visit(p_visitor_id text, p_page_path text DEFAULT '/')
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.site_visitors (visitor_id, page_path)
  SELECT p_visitor_id, p_page_path
  WHERE NOT EXISTS (
    SELECT 1 FROM public.site_visitors
    WHERE visitor_id = p_visitor_id
    AND visited_at > now() - interval '1 day'
  );
$$;
