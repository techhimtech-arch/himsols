-- Create table for gift card page content (admin-controllable)
CREATE TABLE public.gift_card_page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title_en TEXT,
  title_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  icon TEXT,
  link_url TEXT,
  link_text_en TEXT,
  link_text_hi TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gift_card_page_content ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view gift card page content"
ON public.gift_card_page_content
FOR SELECT
USING (true);

-- Admin-only write access using user_roles check
CREATE POLICY "Admins can manage gift card page content"
ON public.gift_card_page_content
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Insert default content for the two usage options
INSERT INTO public.gift_card_page_content (section_key, title_en, title_hi, description_en, description_hi, icon, link_url, link_text_en, link_text_hi, sort_order) VALUES
('usage_campaign', 'Campaigns में Donate करें', 'Campaigns में Donate करें', 'Active tree plantation campaigns में directly redeem करें। आपके नाम पर पेड़ लगेंगे और certificate भी मिलेगा!', 'Active tree plantation campaigns में directly redeem करें। आपके नाम पर पेड़ लगेंगे और certificate भी मिलेगा!', 'TreePine', '/campaigns', 'Active Campaigns देखें', 'Active Campaigns देखें', 1),
('usage_wallet', 'Wallet में Add करें', 'Wallet में Add करें', 'अपने Himsols Wallet में balance add करें। Wallet से Marketplace orders और future campaigns में use करें।', 'अपने Himsols Wallet में balance add करें। Wallet से Marketplace orders और future campaigns में use करें।', 'Wallet', '/profile', 'My Wallet देखें', 'My Wallet देखें', 2);

-- Create trigger for updated_at
CREATE TRIGGER update_gift_card_page_content_updated_at
BEFORE UPDATE ON public.gift_card_page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();