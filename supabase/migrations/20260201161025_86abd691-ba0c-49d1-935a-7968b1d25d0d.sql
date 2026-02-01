-- Create wallets table for user balances
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create wallet_transactions table for transaction history
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  source VARCHAR(50) NOT NULL CHECK (source IN ('RAZORPAY', 'GIFT_CARD', 'REFUND', 'REFERRAL', 'DONATION', 'MARKETPLACE')),
  reference_id UUID,
  description TEXT,
  balance_after NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Wallets policies
CREATE POLICY "Users can view their own wallet"
ON public.wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage wallets"
ON public.wallets FOR ALL
USING (true)
WITH CHECK (true);

-- Wallet transactions policies
CREATE POLICY "Users can view their own transactions"
ON public.wallet_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions"
ON public.wallet_transactions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all transactions"
ON public.wallet_transactions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to auto-create wallet for new users
CREATE OR REPLACE FUNCTION public.create_wallet_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create wallet when profile is created
CREATE TRIGGER on_profile_created_create_wallet
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_wallet_for_user();

-- Create function to add wallet transaction with balance update
CREATE OR REPLACE FUNCTION public.wallet_transaction(
  p_user_id UUID,
  p_type VARCHAR(20),
  p_amount NUMERIC,
  p_source VARCHAR(50),
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(new_balance NUMERIC, transaction_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_transaction_id UUID;
BEGIN
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
  
  -- Calculate new balance
  IF p_type = 'CREDIT' THEN
    v_new_balance := v_current_balance + p_amount;
  ELSE
    IF v_current_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;
    v_new_balance := v_current_balance - p_amount;
  END IF;
  
  -- Update wallet balance
  UPDATE public.wallets
  SET balance = v_new_balance, updated_at = now()
  WHERE id = v_wallet_id;
  
  -- Insert transaction record
  INSERT INTO public.wallet_transactions (
    wallet_id, user_id, type, amount, source, reference_id, description, balance_after
  )
  VALUES (
    v_wallet_id, p_user_id, p_type, p_amount, p_source, p_reference_id, p_description, v_new_balance
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN QUERY SELECT v_new_balance, v_transaction_id;
END;
$$;

-- Create index for faster queries
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);