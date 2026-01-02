-- Create testimonials table for dynamic testimonials management
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  avatar TEXT,
  rating INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can view active testimonials
CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials
FOR SELECT
USING (is_active = true);

-- Admins can manage all testimonials
CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default testimonials
INSERT INTO public.testimonials (quote, name, role, location, avatar, rating, sort_order) VALUES
('Himsols planted 50 trees in our panchayat area. The team was professional and the saplings are growing well. Excellent initiative!', 'Ramesh Sharma', 'Panchayat Pradhan', 'Kullu District', 'RS', 5, 1),
('We organized a tree plantation drive with Himsols at our school. Students loved it! Great awareness program for the next generation.', 'Anita Devi', 'School Principal', 'Mandi District', 'AD', 5, 2),
('The scrap collection service is very convenient. They pick up from doorstep and pay fair prices. Highly recommended!', 'Suresh Kumar', 'Local Farmer', 'Shimla District', 'SK', 5, 3);