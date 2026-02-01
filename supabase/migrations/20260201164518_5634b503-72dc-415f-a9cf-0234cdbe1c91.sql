-- Drop existing source check constraint
ALTER TABLE public.wallet_transactions 
DROP CONSTRAINT wallet_transactions_source_check;

-- Add new constraint with WELCOME_BONUS included
ALTER TABLE public.wallet_transactions 
ADD CONSTRAINT wallet_transactions_source_check 
CHECK (source IN ('RAZORPAY', 'GIFT_CARD', 'REFUND', 'REFERRAL', 'DONATION', 'MARKETPLACE', 'WELCOME_BONUS'));