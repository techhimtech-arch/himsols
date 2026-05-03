
-- 1. Fix user_roles privilege escalation
DROP POLICY IF EXISTS "Allow role creation on signup" ON public.user_roles;
CREATE POLICY "Allow role creation on signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'user'::app_role);

-- 2. Fix referrals public insert
DROP POLICY IF EXISTS "Service role can insert referrals" ON public.referrals;
CREATE POLICY "Service role can insert referrals"
ON public.referrals
FOR INSERT
TO service_role
WITH CHECK (true);

-- 3. Fix profiles public insert
DROP POLICY IF EXISTS "Allow profile creation on signup" ON public.profiles;
CREATE POLICY "Allow profile creation on signup"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Restrict nurseries SELECT to authenticated users (hides phone/contact PII from anon)
DROP POLICY IF EXISTS "Anyone can view active nurseries" ON public.nurseries;
CREATE POLICY "Authenticated users can view active nurseries"
ON public.nurseries
FOR SELECT
TO authenticated
USING (is_active = true);

-- 5. Harden wallet_transaction with input validation
CREATE OR REPLACE FUNCTION public.wallet_transaction(
  p_user_id uuid,
  p_type character varying,
  p_amount numeric,
  p_source character varying,
  p_reference_id uuid DEFAULT NULL::uuid,
  p_description text DEFAULT NULL::text
)
RETURNS TABLE(new_balance numeric, transaction_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Input validation
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  IF p_amount > 1000000 THEN
    RAISE EXCEPTION 'Amount exceeds maximum allowed (1,000,000)';
  END IF;

  IF p_type NOT IN ('CREDIT', 'DEBIT') THEN
    RAISE EXCEPTION 'Invalid transaction type';
  END IF;

  IF p_description IS NOT NULL AND length(p_description) > 500 THEN
    RAISE EXCEPTION 'Description too long (max 500 chars)';
  END IF;

  -- Get or create wallet
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    INSERT INTO public.wallets (user_id, balance)
    VALUES (p_user_id, 0)
    RETURNING id, balance INTO v_wallet_id, v_current_balance;
  END IF;

  IF p_type = 'CREDIT' THEN
    v_new_balance := v_current_balance + p_amount;
  ELSE
    IF v_current_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;
    v_new_balance := v_current_balance - p_amount;
  END IF;

  UPDATE public.wallets
  SET balance = v_new_balance, updated_at = now()
  WHERE id = v_wallet_id;

  INSERT INTO public.wallet_transactions (
    wallet_id, user_id, type, amount, source, reference_id, description, balance_after
  )
  VALUES (
    v_wallet_id, p_user_id, p_type, p_amount, p_source, p_reference_id, p_description, v_new_balance
  )
  RETURNING id INTO v_transaction_id;

  RETURN QUERY SELECT v_new_balance, v_transaction_id;
END;
$function$;
