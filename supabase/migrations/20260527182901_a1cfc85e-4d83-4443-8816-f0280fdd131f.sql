
-- 1. Farmer photos: require auth + user-scoped folder
DROP POLICY IF EXISTS "Anyone can upload farmer photos" ON storage.objects;

CREATE POLICY "Authenticated users upload own farmer photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'farmer-photos'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Remove broad listing policies (public CDN reads still work for public buckets)
DROP POLICY IF EXISTS "Anyone can view farmer photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view land photos" ON storage.objects;

-- 3. Admin manage policies for photo buckets
CREATE POLICY "Admins can delete land photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'land-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update land photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'land-photos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'land-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete farmer photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'farmer-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update farmer photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'farmer-photos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'farmer-photos' AND public.has_role(auth.uid(), 'admin'));

-- 4. Revoke EXECUTE on trigger-only / backend-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.create_wallet_for_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_campaign_collected_amount() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_batch_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_gift_card_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_marketplace_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_tracking_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_waste_tracking_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_scrap_to_wallet(uuid, numeric, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.wallet_transaction(uuid, varchar, numeric, varchar, uuid, text) FROM PUBLIC, anon, authenticated;
