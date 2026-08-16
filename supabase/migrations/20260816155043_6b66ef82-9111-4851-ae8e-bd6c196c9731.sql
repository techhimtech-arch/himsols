-- 1. Remove duplicate / discontinued inactive navigation rows (keep active ones)
DELETE FROM public.navigation_items
WHERE is_active = false
  AND path IN ('/', '/shop', '/marketplace', '/plants', '/campaigns', '/gift-cards', '/services', '/village-register', '/carbon-dashboard', '/corporate', '/contact', '/blog', '/tree-plantation');

-- 2. Learn dropdown children
WITH learn AS (
  SELECT id FROM public.navigation_items WHERE path = '/learn' AND is_active = true LIMIT 1
)
INSERT INTO public.navigation_items (label, label_hi, path, sort_order, is_active, is_visible_mobile, parent_id)
SELECT v.label, v.label_hi, v.path, v.sort_order, true, true, learn.id
FROM learn,
  (VALUES
    ('Blog', 'ब्लॉग', '/blog', 1),
    ('Green Quiz', 'ग्रीन क्विज़', '/green-quiz', 2),
    ('Sustainability Days', 'पर्यावरण दिवस', '/days', 3),
    ('Gallery', 'गैलरी', '/gallery', 4)
  ) AS v(label, label_hi, path, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.navigation_items n WHERE n.path = v.path AND n.parent_id IS NOT NULL
);

-- 3. Footer: point "Plant Trees" to the request page, not the old shop
UPDATE public.footer_links SET url = '/tree-plantation', label = 'Plant a Tree' WHERE url = '/shop';

-- 4. Footer: single farmer entry, proof + learn rows active
UPDATE public.footer_links SET is_active = false WHERE url IN ('/partner-with-us', '/village-register', '/carbon-dashboard', '/marketplace', '/waste-management', '/plants', '/gift-cards');
UPDATE public.footer_links SET is_active = true WHERE url IN ('/farmer-registration', '/track-request', '/impact', '/gallery', '/learn', '/green-quiz');

-- 5. Footer: add missing proof / learn rows
INSERT INTO public.footer_links (section, label, label_hi, url, sort_order, is_active)
SELECT v.section, v.label, v.label_hi, v.url, v.sort_order, true
FROM (VALUES
  ('programs', 'Impact Dashboard', 'प्रभाव डैशबोर्ड', '/impact', 3),
  ('company', 'Learn Hub', 'लर्न हब', '/learn', 5),
  ('company', 'Green Quiz', 'ग्रीन क्विज़', '/green-quiz', 6),
  ('services', 'Schools Program', 'स्कूल प्रोग्राम', '/schools', 4)
) AS v(section, label, label_hi, url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.footer_links f WHERE f.url = v.url AND f.section = v.section);