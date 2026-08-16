UPDATE public.footer_links SET section = 'services', sort_order = 5 WHERE url = '/impact' AND section = 'programs';
INSERT INTO public.footer_links (section, label, label_hi, url, sort_order, is_active)
SELECT 'services', 'For Farmers', 'किसानों के लिए', '/farmer-registration', 6, true
WHERE NOT EXISTS (SELECT 1 FROM public.footer_links WHERE url = '/farmer-registration' AND section = 'services');