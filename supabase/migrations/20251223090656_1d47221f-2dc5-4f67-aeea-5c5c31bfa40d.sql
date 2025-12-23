-- Allow anyone to lookup email by phone for login purposes
CREATE POLICY "Allow phone lookup for login"
ON public.profiles
FOR SELECT
USING (true);