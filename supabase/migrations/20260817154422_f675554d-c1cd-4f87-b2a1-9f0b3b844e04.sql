
ALTER TABLE public.csr_partners
  ADD COLUMN IF NOT EXISTS estimated_trees integer,
  ADD COLUMN IF NOT EXISTS estimated_budget numeric,
  ADD COLUMN IF NOT EXISTS proposal_sent_at timestamp with time zone;

CREATE OR REPLACE FUNCTION public.get_public_batches(p_limit integer DEFAULT 12)
RETURNS TABLE(batch_id text, species text, tree_count integer, plantation_date date, status text, district text, photo_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.batch_id, a.species, a.tree_count, a.plantation_date, a.status,
         lp.district,
         (SELECT count(*) FROM public.plantation_photos p WHERE p.order_id = a.order_id)
  FROM public.tree_allocations a
  LEFT JOIN public.land_partner_applications lp ON lp.id = a.application_id
  WHERE a.batch_id IS NOT NULL
    AND a.status IN ('planted', 'verified', 'completed')
  ORDER BY a.plantation_date DESC
  LIMIT COALESCE(p_limit, 12)
$$;

CREATE OR REPLACE FUNCTION public.get_public_batch(p_batch_id text)
RETURNS TABLE(batch_id text, species text, tree_count integer, plantation_date date, status text, district text, village text, trees_alive integer, review_date date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.batch_id, a.species, a.tree_count, a.plantation_date, a.status,
         lp.district, lp.village, a.trees_alive, a.review_date
  FROM public.tree_allocations a
  LEFT JOIN public.land_partner_applications lp ON lp.id = a.application_id
  WHERE a.batch_id = p_batch_id
    AND a.status IN ('planted', 'verified', 'completed')
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_public_batch_photos(p_batch_id text)
RETURNS TABLE(photo_url text, caption text, latitude numeric, longitude numeric, created_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.photo_url, p.caption, p.latitude, p.longitude, p.created_at
  FROM public.plantation_photos p
  JOIN public.tree_allocations a ON a.order_id = p.order_id
  WHERE a.batch_id = p_batch_id
    AND a.status IN ('planted', 'verified', 'completed')
  ORDER BY p.created_at DESC
$$;

REVOKE ALL ON FUNCTION public.get_public_batches(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_batch(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_batch_photos(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_public_batches(integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_batch(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_batch_photos(text) TO anon, authenticated, service_role;
