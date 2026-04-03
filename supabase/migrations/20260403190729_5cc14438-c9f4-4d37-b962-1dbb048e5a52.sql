
CREATE TABLE public.project_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active project categories"
  ON public.project_categories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can view all project categories"
  ON public.project_categories FOR SELECT
  TO public
  USING (is_admin());

CREATE POLICY "Admins can manage project categories"
  ON public.project_categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Seed existing categories from projects table
INSERT INTO public.project_categories (name)
SELECT DISTINCT category FROM public.projects WHERE category IS NOT NULL AND category != ''
ON CONFLICT (name) DO NOTHING;
