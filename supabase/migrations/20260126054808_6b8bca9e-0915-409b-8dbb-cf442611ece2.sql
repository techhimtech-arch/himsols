-- Create payment mode enum for future flexibility (DIRECT, GIFT_CARD, etc.)
CREATE TYPE public.payment_mode AS ENUM ('DIRECT', 'GIFT_CARD');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- Create campaign status enum
CREATE TYPE public.campaign_status AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  banner_image TEXT,
  goal_amount NUMERIC NOT NULL DEFAULT 0,
  collected_amount NUMERIC NOT NULL DEFAULT 0,
  status public.campaign_status NOT NULL DEFAULT 'INACTIVE',
  start_date DATE,
  end_date DATE,
  show_on_homepage BOOLEAN NOT NULL DEFAULT false,
  allow_direct_payment BOOLEAN NOT NULL DEFAULT true,
  allow_gift_card BOOLEAN NOT NULL DEFAULT false,
  price_per_tree NUMERIC DEFAULT 99,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donations table (source-agnostic for future flexibility)
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  donor_phone TEXT,
  amount NUMERIC NOT NULL,
  payment_mode public.payment_mode NOT NULL DEFAULT 'DIRECT',
  payment_status public.payment_status NOT NULL DEFAULT 'PENDING',
  payment_id TEXT,
  payment_gateway TEXT DEFAULT 'manual',
  gift_card_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Campaign RLS policies
CREATE POLICY "Anyone can view active campaigns"
  ON public.campaigns FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY "Admins can manage campaigns"
  ON public.campaigns FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Donation RLS policies
CREATE POLICY "Users can view their own donations"
  ON public.donations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all donations"
  ON public.donations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage donations"
  ON public.donations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to update collected_amount when donation is successful
CREATE OR REPLACE FUNCTION public.update_campaign_collected_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On insert of successful donation
  IF TG_OP = 'INSERT' AND NEW.payment_status = 'SUCCESS' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE public.campaigns
    SET collected_amount = collected_amount + NEW.amount,
        updated_at = now()
    WHERE id = NEW.campaign_id;
  END IF;
  
  -- On update to successful status
  IF TG_OP = 'UPDATE' AND OLD.payment_status != 'SUCCESS' AND NEW.payment_status = 'SUCCESS' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE public.campaigns
    SET collected_amount = collected_amount + NEW.amount,
        updated_at = now()
    WHERE id = NEW.campaign_id;
  END IF;
  
  -- On refund
  IF TG_OP = 'UPDATE' AND OLD.payment_status = 'SUCCESS' AND NEW.payment_status = 'REFUNDED' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE public.campaigns
    SET collected_amount = GREATEST(0, collected_amount - NEW.amount),
        updated_at = now()
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-updating collected_amount
CREATE TRIGGER trigger_update_campaign_collected
  AFTER INSERT OR UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_collected_amount();

-- Add updated_at trigger for campaigns
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for donations
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();