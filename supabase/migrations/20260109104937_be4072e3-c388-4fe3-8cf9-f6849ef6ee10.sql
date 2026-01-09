-- Add is_featured column to trees table
ALTER TABLE public.trees 
ADD COLUMN is_featured boolean DEFAULT false;

-- Create index for faster featured trees query
CREATE INDEX idx_trees_featured ON public.trees(is_featured) WHERE is_featured = true;