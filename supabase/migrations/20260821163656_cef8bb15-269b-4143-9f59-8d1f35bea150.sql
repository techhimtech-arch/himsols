-- 1) site_visitors: no raw public reads
DROP POLICY IF EXISTS "Anyone can read visitor count" ON public.site_visitors;
CREATE POLICY "Admins can read visitor rows"
ON public.site_visitors FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.site_visitors FROM anon;

-- 2) land_partner_applications: lock admin fields (also created_at/reviewed fields)
CREATE OR REPLACE FUNCTION public.protect_land_partner_admin_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  NEW.status := OLD.status;
  NEW.admin_notes := OLD.admin_notes;
  NEW.reviewed_by := OLD.reviewed_by;
  NEW.reviewed_at := OLD.reviewed_at;
  NEW.user_id := OLD.user_id;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_protect_land_partner_admin_fields ON public.land_partner_applications;
CREATE TRIGGER trg_protect_land_partner_admin_fields
BEFORE UPDATE ON public.land_partner_applications
FOR EACH ROW EXECUTE FUNCTION public.protect_land_partner_admin_fields();

-- 3) tree_allocations: partners may only report survival counts
CREATE OR REPLACE FUNCTION public.protect_tree_allocation_payout_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  NEW.partner_id := OLD.partner_id;
  NEW.allocated_by := OLD.allocated_by;
  NEW.application_id := OLD.application_id;
  NEW.order_id := OLD.order_id;
  NEW.tree_count := OLD.tree_count;
  NEW.species := OLD.species;
  NEW.batch_id := OLD.batch_id;
  NEW.status := OLD.status;
  NEW.plantation_date := OLD.plantation_date;
  NEW.payout_status := OLD.payout_status;
  NEW.payout_amount := OLD.payout_amount;
  NEW.payout_reference := OLD.payout_reference;
  NEW.payout_date := OLD.payout_date;
  NEW.incentive_per_tree := OLD.incentive_per_tree;
  NEW.created_at := OLD.created_at;
  IF NEW.trees_alive IS NULL THEN NEW.trees_alive := 0; END IF;
  IF NEW.trees_dead IS NULL THEN NEW.trees_dead := 0; END IF;
  IF NEW.trees_alive < 0 OR NEW.trees_dead < 0
     OR (NEW.trees_alive + NEW.trees_dead) <> OLD.tree_count THEN
    RAISE EXCEPTION 'Alive + dead trees must equal the allocated tree count';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_protect_tree_allocation_payout_fields ON public.tree_allocations;
CREATE TRIGGER trg_protect_tree_allocation_payout_fields
BEFORE UPDATE ON public.tree_allocations
FOR EACH ROW EXECUTE FUNCTION public.protect_tree_allocation_payout_fields();

-- 4) storage: tree photo updates must stay in owner folder
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'tree-photos' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'tree-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);