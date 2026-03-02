-- Add TREE_ORDER to the wallet_transactions source check constraint
ALTER TABLE public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_source_check;
ALTER TABLE public.wallet_transactions ADD CONSTRAINT wallet_transactions_source_check 
  CHECK (source IN ('TOPUP', 'WELCOME_BONUS', 'REFERRAL_BONUS', 'GIFT_CARD_REDEMPTION', 'RAZORPAY', 'GIFT_CARD', 'REFUND', 'REFERRAL', 'DONATION', 'MARKETPLACE', 'TREE_ORDER'));