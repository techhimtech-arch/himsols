-- Create gift_cards table
CREATE TABLE public.gift_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  value NUMERIC(10,2) NOT NULL CHECK (value > 0),
  balance NUMERIC(10,2) NOT NULL CHECK (balance >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
  recipient_name VARCHAR(100),
  recipient_email VARCHAR(255),
  gift_message TEXT,
  purchaser_id UUID REFERENCES auth.users(id),
  purchaser_name VARCHAR(100),
  purchaser_email VARCHAR(255),
  payment_id VARCHAR(100),
  payment_gateway VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 year'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gift_card_redemptions table for tracking partial redemptions
CREATE TABLE public.gift_card_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES public.donations(id),
  user_id UUID REFERENCES auth.users(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  trees_planted INTEGER DEFAULT 0,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_redemptions ENABLE ROW LEVEL SECURITY;

-- Gift Cards Policies
-- Anyone can view active gift cards by code (for validation)
CREATE POLICY "Anyone can validate gift cards by code"
  ON public.gift_cards FOR SELECT
  USING (true);

-- Users can view their purchased gift cards
CREATE POLICY "Users can view their purchased gift cards"
  ON public.gift_cards FOR SELECT
  USING (auth.uid() = purchaser_id);

-- Only authenticated users can purchase gift cards (insert handled by edge function with service role)
CREATE POLICY "Service role can insert gift cards"
  ON public.gift_cards FOR INSERT
  WITH CHECK (true);

-- Only service role can update gift cards (balance updates during redemption)
CREATE POLICY "Service role can update gift cards"
  ON public.gift_cards FOR UPDATE
  USING (true);

-- Gift Card Redemptions Policies
-- Users can view their own redemptions
CREATE POLICY "Users can view their redemptions"
  ON public.gift_card_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all redemptions
CREATE POLICY "Admins can view all redemptions"
  ON public.gift_card_redemptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role handles inserts
CREATE POLICY "Service role can insert redemptions"
  ON public.gift_card_redemptions FOR INSERT
  WITH CHECK (true);

-- Create function to generate unique gift card code
CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INTEGER;
BEGIN
  LOOP
    new_code := 'GC-';
    FOR i IN 1..4 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    new_code := new_code || '-';
    FOR i IN 1..4 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM public.gift_cards WHERE code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_gift_cards_updated_at
  BEFORE UPDATE ON public.gift_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX idx_gift_cards_status ON public.gift_cards(status);
CREATE INDEX idx_gift_cards_purchaser ON public.gift_cards(purchaser_id);
CREATE INDEX idx_gift_card_redemptions_gift_card ON public.gift_card_redemptions(gift_card_id);
CREATE INDEX idx_gift_card_redemptions_campaign ON public.gift_card_redemptions(campaign_id);