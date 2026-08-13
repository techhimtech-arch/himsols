-- Restructure public navigation to the four doors + content lane
UPDATE public.navigation_items SET is_active = false;

UPDATE public.navigation_items SET is_active = true, label = 'Home', label_hi = 'होम', path = '/', sort_order = 1
WHERE id = '279bd7f6-b081-4344-a5ce-43d153ee4a21';

UPDATE public.navigation_items SET is_active = true, label = 'For Companies', label_hi = 'कंपनियों के लिए', path = '/corporate', sort_order = 2
WHERE id = '5cd8f3f4-c485-405c-bda7-65a235eab968';

UPDATE public.navigation_items SET is_active = true, label = 'Plant a Tree 🌱', label_hi = 'पेड़ लगवाएं 🌱', path = '/tree-plantation', sort_order = 4
WHERE id = 'ed8af065-7b29-4a47-aa3d-ad3d5fcadd58';

UPDATE public.navigation_items SET is_active = true, label = 'For Farmers', label_hi = 'किसानों के लिए', path = '/farmer-registration', sort_order = 5
WHERE id = '3e18ba35-aa76-4746-9069-0d0a93bc7200';

UPDATE public.navigation_items SET is_active = true, label = 'Our Impact', label_hi = 'हमारा प्रभाव', path = '/impact', sort_order = 6
WHERE id = 'dfe1a75d-e463-47db-8e0f-2f2fbba8f754';

UPDATE public.navigation_items SET is_active = true, label = 'Learn', label_hi = 'जानें', path = '/learn', sort_order = 7
WHERE id = '36ea8b7f-e307-4882-914b-f26d2951bea5';

UPDATE public.navigation_items SET is_active = true, label = 'Blog', label_hi = 'ब्लॉग', path = '/blog', sort_order = 8
WHERE id = 'd53f43d7-ec9a-4e42-a338-c7974b6e2ec2';

UPDATE public.navigation_items SET is_active = true, label = 'Contact', label_hi = 'संपर्क', path = '/contact', sort_order = 9
WHERE id = '515e9e4a-4130-4212-baad-14d4b68dd55a';

-- Schools door (no existing row)
INSERT INTO public.navigation_items (label, label_hi, path, icon, sort_order, is_active, is_visible_mobile)
SELECT 'Schools', 'स्कूल', '/schools', 'GraduationCap', 3, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.navigation_items WHERE path = '/schools');
