-- Create homepage_sections table for main section content
CREATE TABLE public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title_en TEXT,
  title_hi TEXT,
  subtitle_en TEXT,
  subtitle_hi TEXT,
  content_en TEXT,
  content_hi TEXT,
  cta_text_en TEXT,
  cta_text_hi TEXT,
  cta_link TEXT,
  background_image TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create homepage_items table for repeatable items (steps, cards)
CREATE TABLE public.homepage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  icon TEXT,
  image_url TEXT,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homepage_sections
CREATE POLICY "Anyone can view active homepage sections"
ON public.homepage_sections FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage homepage sections"
ON public.homepage_sections FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for homepage_items
CREATE POLICY "Anyone can view active homepage items"
ON public.homepage_items FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage homepage items"
ON public.homepage_items FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_homepage_sections_updated_at
BEFORE UPDATE ON public.homepage_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homepage_items_updated_at
BEFORE UPDATE ON public.homepage_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial homepage sections
INSERT INTO public.homepage_sections (section_key, title_en, title_hi, subtitle_en, subtitle_hi, content_en, content_hi, cta_text_en, cta_text_hi, cta_link, is_active, sort_order) VALUES
('hero', 'Plant a Tree in Your Name – For Himachal 🌱', 'अपने नाम से पेड़ लगाइए – हिमाचल के लिए 🌱', 'One tree today can shape Himachal''s tomorrow', 'आज लगाया गया एक पेड़, कल हिमाचल का भविष्य बदलेगा', NULL, NULL, 'Plant a Tree Now', 'पेड़ लगाओ अभी', '/tree-plantation', true, 1),
('how_it_works', 'How It Works', 'यह कैसे काम करता है', 'Simple steps to make a difference', 'बदलाव लाने के सरल कदम', NULL, NULL, NULL, NULL, NULL, true, 2),
('why_himsols', 'Why Choose Himsols?', 'हिमसोल्स क्यों चुनें?', 'We are committed to sustainable change', 'हम टिकाऊ बदलाव के लिए प्रतिबद्ध हैं', NULL, NULL, NULL, NULL, NULL, true, 3),
('impact', 'Our Impact So Far', 'हमारा अब तक का प्रभाव', 'Real work, real numbers', 'असली काम, असली आंकड़े', NULL, NULL, NULL, NULL, NULL, true, 4),
('story', 'Our Story', 'हमारी कहानी', NULL, NULL, 'Himsols started as a local initiative from Himachal Pradesh with a simple mission: to bring communities together for environmental action. We believe that sustainable change happens when local people take ownership of their environment.', 'हिमसोल्स हिमाचल प्रदेश से एक स्थानीय पहल के रूप में शुरू हुई, जिसका एक सरल मिशन था: पर्यावरण कार्रवाई के लिए समुदायों को एक साथ लाना। हम मानते हैं कि टिकाऊ बदलाव तब होता है जब स्थानीय लोग अपने पर्यावरण की जिम्मेदारी लेते हैं।', NULL, NULL, NULL, true, 5),
('final_cta', 'Ready to Make an Impact?', 'बदलाव लाने के लिए तैयार हैं?', 'Join 120+ community members building a greener Himachal', '120+ समुदाय सदस्यों के साथ जुड़ें जो एक हरित हिमाचल बना रहे हैं', NULL, NULL, 'Start Planting Trees', 'पेड़ लगाना शुरू करें', '/tree-plantation', true, 6);

-- Seed How It Works steps
INSERT INTO public.homepage_items (section_key, title_en, title_hi, description_en, description_hi, icon, sort_order) VALUES
('how_it_works', 'Visit Website', 'वेबसाइट पर आइए', 'Browse our platform and explore tree options', 'हमारे प्लेटफॉर्म पर जाएं और पेड़ों के विकल्प देखें', 'Globe', 1),
('how_it_works', 'Select Trees', 'पेड़ चुनिए', 'Choose the type and quantity of trees you want to plant', 'वह पेड़ चुनें जो आप लगाना चाहते हैं', 'TreePine', 2),
('how_it_works', 'Confirm & Contribute', 'पुष्टि करें और योगदान दें', 'Complete your order and we plant trees on your behalf', 'अपना ऑर्डर पूरा करें, हम आपकी तरफ से पेड़ लगाएंगे', 'CheckCircle', 3);

-- Seed Why Himsols cards
INSERT INTO public.homepage_items (section_key, title_en, title_hi, description_en, description_hi, icon, sort_order) VALUES
('why_himsols', 'Local Impact', 'स्थानीय प्रभाव', 'Every tree is planted in Himachal Pradesh by local communities', 'हर पेड़ हिमाचल प्रदेश में स्थानीय समुदायों द्वारा लगाया जाता है', 'MapPin', 1),
('why_himsols', 'Community Driven', 'समुदाय संचालित', 'We work directly with village communities and farmers', 'हम सीधे गांव के समुदायों और किसानों के साथ काम करते हैं', 'Users', 2),
('why_himsols', 'Transparent Process', 'पारदर्शी प्रक्रिया', 'Track your trees with photos and GPS coordinates', 'फोटो और GPS निर्देशांक के साथ अपने पेड़ों को ट्रैक करें', 'Eye', 3),
('why_himsols', 'Eco-Certified', 'इको-प्रमाणित', 'All our processes follow environmental best practices', 'हमारी सभी प्रक्रियाएं पर्यावरण की सर्वोत्तम प्रथाओं का पालन करती हैं', 'Award', 4);

-- Add new site_settings for counters and language
INSERT INTO public.site_settings (key, value) VALUES
('total_trees_planted', '450'),
('villages_covered', '5'),
('people_involved', '120'),
('scrap_recycled_tonnes', '2'),
('default_language', 'hi')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;