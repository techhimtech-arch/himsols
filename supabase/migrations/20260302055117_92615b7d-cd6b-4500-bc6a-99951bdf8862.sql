
-- Link buyer orders to tree allocations
ALTER TABLE public.tree_allocations 
ADD COLUMN order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;

-- Allow authenticated users to view allocations linked to their orders
CREATE POLICY "Buyers can view their order allocations"
ON public.tree_allocations
FOR SELECT
TO authenticated
USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
