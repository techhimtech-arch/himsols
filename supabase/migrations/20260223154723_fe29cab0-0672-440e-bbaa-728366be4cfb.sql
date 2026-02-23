
-- Create storage bucket for marketplace product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-images', 'marketplace-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view marketplace images
CREATE POLICY "Anyone can view marketplace images"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-images');

-- Admins can upload marketplace images
CREATE POLICY "Admins can upload marketplace images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'marketplace-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update marketplace images
CREATE POLICY "Admins can update marketplace images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'marketplace-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can delete marketplace images
CREATE POLICY "Admins can delete marketplace images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'marketplace-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
