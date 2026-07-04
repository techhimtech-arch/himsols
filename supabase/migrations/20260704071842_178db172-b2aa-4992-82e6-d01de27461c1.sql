
ALTER TABLE public.trees ADD COLUMN IF NOT EXISTS mrp NUMERIC;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS mrp NUMERIC;

-- Backfill trees: set mrp to current price, then drop price by ₹30 (min 1)
UPDATE public.trees
SET mrp = price,
    price = GREATEST(price - 30, 1)
WHERE price > 30 AND (mrp IS NULL OR mrp = price);

-- Backfill marketplace: same ₹30 off
UPDATE public.marketplace_products
SET mrp = price,
    price = GREATEST(price - 30, 1)
WHERE price > 30 AND (mrp IS NULL OR mrp = price);
