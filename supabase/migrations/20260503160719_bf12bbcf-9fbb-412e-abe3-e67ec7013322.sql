
-- Fix 1: gift_card_redemptions - restrict insert to service_role only
DROP POLICY IF EXISTS "Service role can insert redemptions" ON public.gift_card_redemptions;
CREATE POLICY "Service role can insert redemptions"
ON public.gift_card_redemptions
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix 2: farmer_registrations - remove anonymous insert; require auth
DROP POLICY IF EXISTS "Anyone can register as farmer" ON public.farmer_registrations;

-- Fix 3: sellers - restrict SELECT of contact PII to authenticated users
DROP POLICY IF EXISTS "Anyone can view active sellers" ON public.sellers;
CREATE POLICY "Authenticated users can view active sellers"
ON public.sellers
FOR SELECT
TO authenticated
USING (is_active = true);
