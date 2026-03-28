
CREATE TABLE public.hero_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'Brain',
  value text NOT NULL DEFAULT '0+',
  label text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hero stats" ON public.hero_stats
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all hero stats" ON public.hero_stats
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "Admins can manage hero stats" ON public.hero_stats
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Seed default data
INSERT INTO public.hero_stats (icon, value, label, display_order) VALUES
  ('Brain', '3+', 'Years Healthcare Experience', 0),
  ('Activity', '5+', 'Healthcare Dashboard', 1),
  ('TrendingUp', '3+', 'AI Tools Built', 2);
