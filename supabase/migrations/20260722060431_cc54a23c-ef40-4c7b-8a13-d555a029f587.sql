CREATE POLICY "Admins can upload any tree photo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'tree-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any tree photo"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'tree-photos' AND public.has_role(auth.uid(), 'admin'));