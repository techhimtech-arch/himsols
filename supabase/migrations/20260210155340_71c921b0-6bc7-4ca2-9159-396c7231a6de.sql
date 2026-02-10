
-- Add occasion field to gift_cards table for themed gift cards
ALTER TABLE public.gift_cards ADD COLUMN IF NOT EXISTS occasion character varying DEFAULT NULL;
