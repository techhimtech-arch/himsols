-- Create sellers table (admin-created farmer/producer profiles)
CREATE TABLE public.sellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  village TEXT NOT NULL,
  region TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  description TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace product categories enum
CREATE TYPE public.marketplace_category AS ENUM (
  'farmer_produce',
  'value_added',
  'plants_gardening',
  'home_utility'
);

-- Create marketplace products table
CREATE TABLE public.marketplace_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_hi TEXT,
  category marketplace_category NOT NULL,
  subcategory TEXT,
  seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
  origin_location TEXT,
  description TEXT NOT NULL,
  description_hi TEXT,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  delivery_timeline TEXT DEFAULT '3-5 days',
  image_url TEXT,
  is_seasonal BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace orders table
CREATE TABLE public.marketplace_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  items JSONB NOT NULL,
  total_price NUMERIC NOT NULL,
  delivery_address TEXT NOT NULL,
  district TEXT,
  state TEXT,
  notes TEXT,
  status request_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Function to generate marketplace order number
CREATE OR REPLACE FUNCTION public.generate_marketplace_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    new_id := 'HMP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.marketplace_orders WHERE order_number = new_id) INTO id_exists;
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN new_id;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

-- Sellers policies
CREATE POLICY "Anyone can view active sellers"
ON public.sellers FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage sellers"
ON public.sellers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Marketplace products policies
CREATE POLICY "Anyone can view active products"
ON public.marketplace_products FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage products"
ON public.marketplace_products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Marketplace orders policies
CREATE POLICY "Users can create their own orders"
ON public.marketplace_orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
ON public.marketplace_orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
ON public.marketplace_orders FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update orders"
ON public.marketplace_orders FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_sellers_updated_at
BEFORE UPDATE ON public.sellers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_marketplace_products_updated_at
BEFORE UPDATE ON public.marketplace_products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_marketplace_orders_updated_at
BEFORE UPDATE ON public.marketplace_orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();