
-- 1. FIX: user_roles privilege escalation - remove auth.uid() IS NULL
DROP POLICY IF EXISTS "Allow role creation on signup" ON public.user_roles;
CREATE POLICY "Allow role creation on signup"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. FIX: wallets public access - restrict to service_role + user's own
DROP POLICY IF EXISTS "Service role can manage wallets" ON public.wallets;
CREATE POLICY "Service role can manage wallets"
ON public.wallets FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. FIX: gift_cards public read/write
DROP POLICY IF EXISTS "Anyone can validate gift cards by code" ON public.gift_cards;
DROP POLICY IF EXISTS "Service role can insert gift cards" ON public.gift_cards;
DROP POLICY IF EXISTS "Service role can update gift cards" ON public.gift_cards;

-- Service role policies (for edge functions)
CREATE POLICY "Service role can insert gift cards"
ON public.gift_cards FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update gift cards"
ON public.gift_cards FOR UPDATE
TO service_role
USING (true);

-- Admins can view all gift cards
CREATE POLICY "Admins can view all gift cards"
ON public.gift_cards FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a security definer function for public gift card validation
CREATE OR REPLACE FUNCTION public.validate_gift_card_code(p_code text)
RETURNS TABLE(id uuid, status text, balance numeric, expires_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT gc.id, gc.status::text, gc.balance, gc.expires_at
  FROM public.gift_cards gc
  WHERE gc.code = p_code
  LIMIT 1;
$$;

-- 4. FIX: wallet_transactions public insert
DROP POLICY IF EXISTS "Service role can insert transactions" ON public.wallet_transactions;
CREATE POLICY "Service role can insert transactions"
ON public.wallet_transactions FOR INSERT
TO service_role
WITH CHECK (true);
