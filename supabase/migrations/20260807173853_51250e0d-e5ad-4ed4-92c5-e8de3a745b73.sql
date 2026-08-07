UPDATE public.navigation_items SET is_active = false WHERE path IN ('/gift-cards','/marketplace','/plants','/campaigns','/green-quiz','/village-register','/partner-with-us','/carbon-dashboard');
UPDATE public.navigation_items SET path = '/impact', label = 'Our Impact', label_hi = 'हमारा प्रभाव', is_active = true WHERE id = 'dfe1a75d-e463-47db-8e0f-2f2fbba8f754';
UPDATE public.footer_links SET is_active = false WHERE url IN ('/plants','/marketplace','/gift-cards','/partner-with-us','/village-register','/carbon-dashboard','/campaigns','/green-quiz');
UPDATE public.footer_links SET url = '/about' WHERE id = 'c21dbbf0-c9ed-447f-96e8-835c97d95ebf';
UPDATE public.footer_links SET url = '/track-request' WHERE id = '079610f4-886b-42f9-acbc-e550f530254f';
UPDATE public.footer_links SET is_active = true, url = '/shop', label = 'Plant Trees', section = 'services', sort_order = 1 WHERE id = 'de88404e-dc8c-4c29-91f5-4b9fee0e9147';
INSERT INTO public.footer_links (section, label, label_hi, url, sort_order, is_active, is_external)
SELECT 'services', 'Climate Impact Pack', NULL, '/climate-impact-pack', 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM public.footer_links WHERE url = '/climate-impact-pack');
INSERT INTO public.footer_links (section, label, label_hi, url, sort_order, is_active, is_external)
SELECT 'services', 'Bulk / CSR Plantation', NULL, '/bulk-plantation', 3, true, false
WHERE NOT EXISTS (SELECT 1 FROM public.footer_links WHERE url = '/bulk-plantation');
INSERT INTO public.footer_links (section, label, label_hi, url, sort_order, is_active, is_external)
SELECT 'programs', 'Schools Program', NULL, '/schools', 2, true, false
WHERE NOT EXISTS (SELECT 1 FROM public.footer_links WHERE url = '/schools');