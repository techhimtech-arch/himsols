-- Create activities table for homepage Recent Activities section
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'plantation',
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'TreePine',
  status TEXT NOT NULL DEFAULT 'completed',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active activities" 
ON public.activities 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage activities" 
ON public.activities 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();