-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Allow authenticated users to upload blog images
CREATE POLICY "Admins can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow anyone to view blog images
CREATE POLICY "Anyone can view blog images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-images');

-- Allow admins to update blog images
CREATE POLICY "Admins can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete blog images
CREATE POLICY "Admins can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);