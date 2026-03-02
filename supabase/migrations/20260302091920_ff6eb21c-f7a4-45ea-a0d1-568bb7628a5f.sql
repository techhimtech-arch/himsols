
-- Add incentive and payout fields to tree_allocations
ALTER TABLE public.tree_allocations
  ADD COLUMN IF NOT EXISTS incentive_per_tree numeric NOT NULL DEFAULT 120,
  ADD COLUMN IF NOT EXISTS trees_alive integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trees_dead integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS review_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payout_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payout_amount numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payout_reference text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payout_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS batch_id text DEFAULT NULL;

-- Generate batch_id for existing allocations that don't have one
UPDATE public.tree_allocations
SET batch_id = 'BATCH-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || SUBSTR(id::text, 1, 6)
WHERE batch_id IS NULL;

-- Create a function to auto-generate batch IDs
CREATE OR REPLACE FUNCTION public.generate_batch_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.batch_id IS NULL THEN
    NEW.batch_id := 'BATCH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  END IF;
  -- Auto-set review_date to 6 months from plantation_date
  IF NEW.review_date IS NULL AND NEW.plantation_date IS NOT NULL THEN
    NEW.review_date := NEW.plantation_date + INTERVAL '6 months';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_batch_id_on_allocation
  BEFORE INSERT ON public.tree_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_batch_id();
