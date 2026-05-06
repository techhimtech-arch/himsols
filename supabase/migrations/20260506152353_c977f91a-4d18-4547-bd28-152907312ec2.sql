-- RLS for scrap vendors
CREATE POLICY "Scrap vendors can view all requests"
  ON public.waste_management_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'scrap_vendor'));

CREATE POLICY "Scrap vendors can update requests"
  ON public.waste_management_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'scrap_vendor'));

CREATE POLICY "Scrap vendors can view request items"
  ON public.scrap_request_items FOR SELECT
  USING (public.has_role(auth.uid(), 'scrap_vendor'));

CREATE POLICY "Scrap vendors can update request items"
  ON public.scrap_request_items FOR UPDATE
  USING (public.has_role(auth.uid(), 'scrap_vendor'));

CREATE POLICY "Scrap vendors can insert request items"
  ON public.scrap_request_items FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'scrap_vendor'));

-- Function to credit a user's wallet for a scrap pickup
CREATE OR REPLACE FUNCTION public.credit_scrap_to_wallet(
  p_request_id uuid,
  p_amount numeric,
  p_note text DEFAULT NULL
)
RETURNS TABLE(new_balance numeric, transaction_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_tracking text;
  v_caller uuid := auth.uid();
BEGIN
  IF NOT (public.has_role(v_caller, 'scrap_vendor') OR public.has_role(v_caller, 'admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT user_id, tracking_id INTO v_user_id, v_tracking
  FROM public.waste_management_requests
  WHERE id = p_request_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  RETURN QUERY
  SELECT * FROM public.wallet_transaction(
    v_user_id,
    'CREDIT'::varchar,
    p_amount,
    'scrap_collection'::varchar,
    p_request_id,
    COALESCE(p_note, 'Scrap pickup credit for ' || v_tracking)
  );
END;
$$;