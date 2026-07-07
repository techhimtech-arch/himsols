
-- 1. Drop broad SELECT policies that permit listing on public buckets
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view tree photos" ON storage.objects;

-- 2. Scope tree-photos uploads to the uploader's own folder
DROP POLICY IF EXISTS "Authenticated users can upload tree photos" ON storage.objects;
CREATE POLICY "Users upload tree photos to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'tree-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Private-bucket read policies via signed URL (owners + admins)
CREATE POLICY "Owners can read own farmer photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'farmer-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can read farmer photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'farmer-photos'
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Owners can read own land photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'land-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can read land photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'land-photos'
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 4. Lock down SECURITY DEFINER functions that must not be user-callable.
--    Keep public execute on: record_visit, get_visitor_count, validate_gift_card_code,
--    increment_blog_views, record_daily_visit, has_role (used inside RLS).
DO $$
DECLARE
  f text;
  keep text[] := ARRAY[
    'record_visit', 'get_visitor_count', 'validate_gift_card_code',
    'increment_blog_views', 'record_daily_visit', 'has_role'
  ];
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure::text
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND p.proname <> ALL(keep)
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
  END LOOP;
END $$;
