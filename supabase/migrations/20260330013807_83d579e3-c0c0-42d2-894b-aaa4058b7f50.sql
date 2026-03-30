CREATE TABLE public.expertise_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expertise_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active expertise tags"
  ON public.expertise_tags FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage expertise tags"
  ON public.expertise_tags FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());