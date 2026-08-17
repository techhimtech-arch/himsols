-- 1. land_partner_applications: prevent self-approval
DROP POLICY IF EXISTS "Users can update own pending application" ON public.land_partner_applications;
CREATE POLICY "Users can update own pending application"
ON public.land_partner_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'PendingVerification')
WITH CHECK (auth.uid() = user_id AND status = 'PendingVerification');

CREATE OR REPLACE FUNCTION public.protect_land_partner_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  NEW.status := OLD.status;
  NEW.admin_notes := OLD.admin_notes;
  NEW.reviewed_by := OLD.reviewed_by;
  NEW.reviewed_at := OLD.reviewed_at;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_land_partner_admin_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_land_partner_admin_fields ON public.land_partner_applications;
CREATE TRIGGER trg_protect_land_partner_admin_fields
BEFORE UPDATE ON public.land_partner_applications
FOR EACH ROW EXECUTE FUNCTION public.protect_land_partner_admin_fields();

-- 2. tree_allocations: partners cannot tamper with payout data
DROP POLICY IF EXISTS "Partners can update own allocation survival" ON public.tree_allocations;
CREATE POLICY "Partners can update own allocation survival"
ON public.tree_allocations
FOR UPDATE
TO authenticated
USING (auth.uid() = partner_id)
WITH CHECK (auth.uid() = partner_id);

CREATE OR REPLACE FUNCTION public.protect_tree_allocation_payout_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  -- Non-admins (land partners) may only report survival counts
  NEW.partner_id := OLD.partner_id;
  NEW.order_id := OLD.order_id;
  NEW.tree_count := OLD.tree_count;
  NEW.species := OLD.species;
  NEW.batch_id := OLD.batch_id;
  NEW.payout_status := OLD.payout_status;
  NEW.payout_amount := OLD.payout_amount;
  NEW.incentive_per_tree := OLD.incentive_per_tree;
  IF NEW.trees_alive IS NULL THEN NEW.trees_alive := 0; END IF;
  IF NEW.trees_dead IS NULL THEN NEW.trees_dead := 0; END IF;
  IF NEW.trees_alive < 0 OR NEW.trees_dead < 0
     OR (NEW.trees_alive + NEW.trees_dead) <> OLD.tree_count THEN
    RAISE EXCEPTION 'Alive + dead trees must equal the allocated tree count';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_tree_allocation_payout_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_tree_allocation_payout_fields ON public.tree_allocations;
CREATE TRIGGER trg_protect_tree_allocation_payout_fields
BEFORE UPDATE ON public.tree_allocations
FOR EACH ROW EXECUTE FUNCTION public.protect_tree_allocation_payout_fields();

-- 3. storage land-photos upload ownership
DROP POLICY IF EXISTS "Authenticated users can upload land photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload land photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'land-photos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 4. Tighten EXECUTE on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_gift_card_code(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_daily_visit(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.increment_blog_views(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_visit(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_visitor_count() FROM PUBLIC;