CREATE TABLE public.hero_typewriter_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_typewriter_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active typewriter keywords" ON public.hero_typewriter_keywords
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage typewriter keywords" ON public.hero_typewriter_keywords
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.hero_typewriter_keywords (keyword, display_order) VALUES
  ('Healthcare AI', 1),
  ('Patient Outcomes', 2),
  ('Medical Data', 3),
  ('Clinical Workflows', 4),
  ('Health Analytics', 5);