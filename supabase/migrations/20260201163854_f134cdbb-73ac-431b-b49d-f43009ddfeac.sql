-- Add referral_code to profiles
ALTER TABLE public.profiles 
ADD COLUMN referral_code TEXT UNIQUE;

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer_bonus NUMERIC NOT NULL DEFAULT 25,
  referee_bonus NUMERIC NOT NULL DEFAULT 15,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referee_id) -- One referral per new user
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their referrals as referrer"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view their referral as referee"
ON public.referrals FOR SELECT
USING (auth.uid() = referee_id);

CREATE POLICY "Admins can view all referrals"
ON public.referrals FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert referrals"
ON public.referrals FOR INSERT
WITH CHECK (true);

-- Add site settings for bonus amounts (use ON CONFLICT to handle if they exist)
INSERT INTO public.site_settings (key, value) VALUES 
  ('welcome_bonus_amount', '10'),
  ('referral_bonus_referrer', '25'),
  ('referral_bonus_referee', '15'),
  ('referral_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INTEGER;
BEGIN
  LOOP
    new_code := 'HIM-';
    FOR i IN 1..4 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code);
  END LOOP;
  RETURN new_code;
END;
$$;

-- Update handle_new_user function to also generate referral code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    public.generate_referral_code()
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Generate referral codes for existing users who don't have one
UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;