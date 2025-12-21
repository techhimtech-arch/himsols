-- Create trigger to automatically create profile and role on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow profiles to be inserted by the trigger (using service role)
CREATE POLICY "Allow profile creation on signup"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Allow the trigger to insert user roles
CREATE POLICY "Allow role creation on signup"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);