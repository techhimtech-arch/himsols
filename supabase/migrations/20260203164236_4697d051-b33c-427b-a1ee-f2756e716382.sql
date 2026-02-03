-- Remove the overly permissive phone lookup policy that exposes all user data
DROP POLICY IF EXISTS "Allow phone lookup for login" ON public.profiles;