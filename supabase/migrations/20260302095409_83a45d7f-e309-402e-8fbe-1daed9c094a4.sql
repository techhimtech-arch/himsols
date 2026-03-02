
-- Add user_id to farmer_registrations (nullable for legacy rows)
ALTER TABLE public.farmer_registrations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- RLS: Logged-in users can insert their own farmer registration
CREATE POLICY "Users can insert own farmer registration"
ON public.farmer_registrations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS: Users can view their own registration
CREATE POLICY "Users can view own farmer registration"
ON public.farmer_registrations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS: Partners can update survival fields on their own allocations
CREATE POLICY "Partners can update own allocation survival"
ON public.tree_allocations
FOR UPDATE
TO authenticated
USING (auth.uid() = partner_id);
