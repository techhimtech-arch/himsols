-- Add is_featured column to marketplace_products table
ALTER TABLE public.marketplace_products 
ADD COLUMN is_featured boolean DEFAULT false;

-- Create index for faster featured products query
CREATE INDEX idx_marketplace_products_featured ON public.marketplace_products(is_featured) WHERE is_featured = true;