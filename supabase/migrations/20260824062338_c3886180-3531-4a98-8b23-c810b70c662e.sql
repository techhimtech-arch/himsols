CREATE TABLE IF NOT EXISTS public.plantation_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code text NOT NULL UNIQUE,
  title text,
  species text NOT NULL DEFAULT 'Mixed native',
  tree_count integer NOT NULL DEFAULT 0,
  plantation_date date NOT NULL DEFAULT CURRENT_DATE,
  village text,
  district text,
  latitude numeric,
  longitude numeric,
  trees_alive integer,
  review_date date,
  notes text,
  status text NOT NULL DEFAULT 'planted',
  is_public boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.plantation_batches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plantation_batches TO authenticated;
GRANT ALL ON public.plantation_batches TO service_role;

ALTER TABLE public.plantation_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public batches"
  ON public.plantation_batches FOR SELECT
  USING (is_public = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert batches"
  ON public.plantation_batches FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update batches"
  ON public.plantation_batches FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete batches"
  ON public.plantation_batches FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER plantation_batches_updated_at
  BEFORE UPDATE ON public.plantation_batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP FUNCTION IF EXISTS public.get_public_batch(text);

CREATE FUNCTION public.get_public_batch(p_batch_id text)
 RETURNS TABLE(batch_id text, species text, tree_count integer, plantation_date date, status text, district text, village text, trees_alive integer, review_date date)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT a.batch_id, a.species, a.tree_count, a.plantation_date, a.status,
         lp.district, lp.village, a.trees_alive, a.review_date
  FROM public.tree_allocations a
  LEFT JOIN public.land_partner_applications lp ON lp.id = a.application_id
  WHERE a.batch_id = p_batch_id
    AND a.status IN ('planted', 'verified', 'completed')
  UNION ALL
  SELECT b.batch_code, b.species, b.tree_count, b.plantation_date, b.status,
         b.district, b.village, b.trees_alive, b.review_date
  FROM public.plantation_batches b
  WHERE b.batch_code = p_batch_id
    AND b.is_public = true
    AND NOT EXISTS (
      SELECT 1 FROM public.tree_allocations a2
      WHERE a2.batch_id = p_batch_id
        AND a2.status IN ('planted', 'verified', 'completed')
    )
  LIMIT 1
$function$;

DROP FUNCTION IF EXISTS public.get_public_batches(integer);

CREATE FUNCTION public.get_public_batches(p_limit integer DEFAULT 12)
 RETURNS TABLE(batch_id text, species text, tree_count integer, plantation_date date, status text, district text, photo_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT * FROM (
    SELECT a.batch_id, a.species, a.tree_count, a.plantation_date, a.status,
           lp.district,
           (SELECT count(*) FROM public.plantation_photos p
             WHERE (a.order_id IS NOT NULL AND p.order_id = a.order_id)
                OR p.batch_id = a.batch_id) AS photo_count
    FROM public.tree_allocations a
    LEFT JOIN public.land_partner_applications lp ON lp.id = a.application_id
    WHERE a.batch_id IS NOT NULL
      AND a.status IN ('planted', 'verified', 'completed')
    UNION ALL
    SELECT b.batch_code, b.species, b.tree_count, b.plantation_date, b.status,
           b.district,
           (SELECT count(*) FROM public.plantation_photos p WHERE p.batch_id = b.batch_code)
    FROM public.plantation_batches b
    WHERE b.is_public = true
  ) x
  ORDER BY x.plantation_date DESC
  LIMIT COALESCE(p_limit, 12)
$function$;

GRANT EXECUTE ON FUNCTION public.get_public_batch(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_batches(integer) TO anon, authenticated;