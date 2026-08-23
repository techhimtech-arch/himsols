ALTER TABLE public.plantation_photos
  ADD COLUMN IF NOT EXISTS batch_id text,
  ADD COLUMN IF NOT EXISTS taken_at timestamptz,
  ADD COLUMN IF NOT EXISTS gps_source text,
  ADD COLUMN IF NOT EXISTS gps_accuracy_m numeric;

CREATE INDEX IF NOT EXISTS plantation_photos_batch_id_idx ON public.plantation_photos (batch_id);

DROP FUNCTION IF EXISTS public.get_public_batch_photos(text);

CREATE FUNCTION public.get_public_batch_photos(p_batch_id text)
 RETURNS TABLE(photo_url text, caption text, latitude numeric, longitude numeric, created_at timestamp with time zone, taken_at timestamp with time zone, gps_source text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT DISTINCT p.photo_url, p.caption, p.latitude, p.longitude, p.created_at, p.taken_at, p.gps_source
  FROM public.plantation_photos p
  LEFT JOIN public.tree_allocations a
    ON a.order_id = p.order_id
   AND a.status IN ('planted', 'verified', 'completed')
  WHERE p.batch_id = p_batch_id
     OR a.batch_id = p_batch_id
  ORDER BY p.created_at DESC
$function$;

CREATE OR REPLACE FUNCTION public.get_public_batches(p_limit integer DEFAULT 12)
 RETURNS TABLE(batch_id text, species text, tree_count integer, plantation_date date, status text, district text, photo_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT a.batch_id, a.species, a.tree_count, a.plantation_date, a.status,
         lp.district,
         (SELECT count(*) FROM public.plantation_photos p
           WHERE (a.order_id IS NOT NULL AND p.order_id = a.order_id)
              OR p.batch_id = a.batch_id)
  FROM public.tree_allocations a
  LEFT JOIN public.land_partner_applications lp ON lp.id = a.application_id
  WHERE a.batch_id IS NOT NULL
    AND a.status IN ('planted', 'verified', 'completed')
  ORDER BY a.plantation_date DESC
  LIMIT COALESCE(p_limit, 12)
$function$;

GRANT EXECUTE ON FUNCTION public.get_public_batch_photos(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_batches(integer) TO anon, authenticated;