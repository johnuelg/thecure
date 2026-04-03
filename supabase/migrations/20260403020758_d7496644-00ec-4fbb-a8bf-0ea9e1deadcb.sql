
CREATE TABLE public.hero_keyword_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  glow_color text NOT NULL DEFAULT '#41c0c2',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_keyword_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active keyword highlights"
  ON public.hero_keyword_highlights FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can view all keyword highlights"
  ON public.hero_keyword_highlights FOR SELECT
  TO public
  USING (is_admin());

CREATE POLICY "Admins can manage keyword highlights"
  ON public.hero_keyword_highlights FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
