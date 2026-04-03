
CREATE TABLE public.hero_parallax_icons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_name text NOT NULL,
  glow_color text NOT NULL DEFAULT '#41c0c2',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_parallax_icons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active parallax icons"
  ON public.hero_parallax_icons FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can view all parallax icons"
  ON public.hero_parallax_icons FOR SELECT
  TO public
  USING (is_admin());

CREATE POLICY "Admins can manage parallax icons"
  ON public.hero_parallax_icons FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Seed default icons
INSERT INTO public.hero_parallax_icons (icon_name, display_order) VALUES
  ('Brain', 0), ('Heart', 1), ('PersonStanding', 2), ('Stethoscope', 3),
  ('Syringe', 4), ('Cross', 5), ('HeartPulse', 6), ('Pill', 7),
  ('Thermometer', 8), ('Hospital', 9), ('Ambulance', 10), ('Dna', 11),
  ('Microscope', 12), ('Ribbon', 13), ('Monitor', 14), ('Database', 15),
  ('UserRound', 16);
