-- Drop the check constraint that requires either request_id or order_id
ALTER TABLE public.plantation_photos DROP CONSTRAINT IF EXISTS check_request_or_order;