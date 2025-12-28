-- Corporate page settings table for hero, stats, etc.
CREATE TABLE public.corporate_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.corporate_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view corporate settings"
  ON public.corporate_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage corporate settings"
  ON public.corporate_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Corporate benefits table
CREATE TABLE public.corporate_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.corporate_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active corporate benefits"
  ON public.corporate_benefits FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage corporate benefits"
  ON public.corporate_benefits FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Corporate solutions table
CREATE TABLE public.corporate_solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  features text[] DEFAULT '{}',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.corporate_solutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active corporate solutions"
  ON public.corporate_solutions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage corporate solutions"
  ON public.corporate_solutions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Corporate packages table
CREATE TABLE public.corporate_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price text NOT NULL,
  period text NOT NULL,
  description text NOT NULL,
  features text[] DEFAULT '{}',
  is_highlighted boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.corporate_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active corporate packages"
  ON public.corporate_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage corporate packages"
  ON public.corporate_packages FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Corporate testimonials table
CREATE TABLE public.corporate_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  company text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.corporate_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active corporate testimonials"
  ON public.corporate_testimonials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage corporate testimonials"
  ON public.corporate_testimonials FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Corporate client logos table
CREATE TABLE public.corporate_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.corporate_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active corporate clients"
  ON public.corporate_clients FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage corporate clients"
  ON public.corporate_clients FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Corporate stats table
CREATE TABLE public.corporate_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL,
  label text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.corporate_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active corporate stats"
  ON public.corporate_stats FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage corporate stats"
  ON public.corporate_stats FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Insert default data

-- Default stats
INSERT INTO public.corporate_stats (value, label, sort_order) VALUES
('50+', 'Corporate Partners', 1),
('10,000+', 'Trees Planted', 2),
('25,000+', 'Plants Gifted', 3),
('98%', 'Client Satisfaction', 4);

-- Default benefits
INSERT INTO public.corporate_benefits (icon, title, description, sort_order) VALUES
('Globe', 'Reduce Carbon Footprint', 'Offset your company''s environmental impact through strategic tree plantation initiatives.', 1),
('Heart', 'Strengthen Brand Values', 'Demonstrate genuine commitment to sustainability and attract eco-conscious stakeholders.', 2),
('Award', 'CSR Compliance', 'Meet corporate social responsibility goals with measurable environmental outcomes.', 3),
('Users', 'Employee Engagement', 'Boost morale and create meaningful team-building experiences around sustainability.', 4),
('TrendingUp', 'Positive PR & Visibility', 'Generate authentic stories for your sustainability reports and marketing communications.', 5),
('Shield', 'Long-term Impact', 'Create lasting environmental benefits with trackable tree growth and survival rates.', 6);

-- Default solutions
INSERT INTO public.corporate_solutions (icon, title, description, features, sort_order) VALUES
('Gift', 'Corporate Plant Gifting', 'Thoughtful, sustainable gifts for employees, clients, and partners. Customizable packaging with your brand.', ARRAY['Branded plant pots', 'Care instructions included', 'Bulk discounts available', 'Delivery across India'], 1),
('TreeDeciduous', 'Tree Sponsorship & CSR', 'Sponsor tree plantations in your company''s name. Perfect for offsetting carbon footprint and CSR initiatives.', ARRAY['Geo-tagged plantations', 'Growth tracking dashboard', 'Certificate for each tree', 'Annual impact reports'], 2),
('Calendar', 'Plantation Events & Drives', 'Organize engaging plantation drives for your team. We handle logistics, saplings, and documentation.', ARRAY['End-to-end coordination', 'Photo & video documentation', 'Team building activities', 'CSR documentation support'], 3);

-- Default packages
INSERT INTO public.corporate_packages (name, price, period, description, features, is_highlighted, sort_order) VALUES
('Starter', '₹25,000', 'onwards', 'Perfect for small teams and pilot programs', ARRAY['50 potted plants or 25 trees', 'Basic branding on packaging', 'Digital certificates', 'Email support'], false, 1),
('Growth', '₹75,000', 'onwards', 'Ideal for medium enterprises with CSR goals', ARRAY['200 potted plants or 100 trees', 'Custom branded packaging', 'Geo-tagged plantation', 'Quarterly impact reports', 'Dedicated account manager'], true, 2),
('Enterprise', 'Custom', 'pricing', 'Tailored solutions for large corporations', ARRAY['Unlimited plants/trees', 'Full white-label options', 'Plantation events included', 'Real-time tracking dashboard', 'Priority support', 'Annual sustainability report'], false, 3);

-- Default testimonials
INSERT INTO public.corporate_testimonials (quote, name, role, company, sort_order) VALUES
('Himsols helped us gift 500+ plants to our employees on Environment Day. The packaging was beautiful and the team coordination was excellent.', 'Priya Sharma', 'HR Director', 'TechCorp India', 1),
('Our CSR tree plantation drive was a huge success. The geo-tagging feature lets us show our stakeholders exactly where our trees are growing.', 'Rajesh Kumar', 'CSR Head', 'GreenBuild Constructions', 2),
('We''ve been partnering with Himsols for 2 years now. Their professionalism and commitment to sustainability aligns perfectly with our values.', 'Anita Desai', 'Sustainability Manager', 'EcoFinance Ltd', 3);

-- Default clients
INSERT INTO public.corporate_clients (name, sort_order) VALUES
('TechCorp', 1),
('GreenBuild', 2),
('EcoFinance', 3),
('SustainCo', 4),
('NatureTech', 5);

-- Default settings
INSERT INTO public.corporate_settings (key, value) VALUES
('hero_title', 'Himsols – Corporate Green Gifting'),
('hero_subtitle', 'Transform your corporate gifting and CSR initiatives with sustainable plant gifts and tree sponsorship programs. Make every gift count for the planet.'),
('why_section_title', 'Why Choose Green Gifting?'),
('why_section_subtitle', 'Align your corporate values with meaningful sustainability actions that benefit your brand, employees, and the environment.'),
('solutions_title', 'Our Corporate Solutions'),
('solutions_subtitle', 'Comprehensive green initiatives tailored for businesses of all sizes.'),
('packages_title', 'Indicative Packages'),
('packages_subtitle', 'Flexible pricing options to suit your organization''s needs and budget.'),
('testimonials_title', 'What Our Corporate Partners Say'),
('testimonials_subtitle', 'Hear from businesses that have transformed their gifting with Himsols.'),
('form_title', 'Get in Touch'),
('form_subtitle', 'Tell us about your green gifting needs and we''ll create a customized solution for you.');