-- Create footer_links table
CREATE TABLE public.footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL,
  label text NOT NULL,
  href text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view active footer links"
ON public.footer_links FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all footer links"
ON public.footer_links FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage footer links"
ON public.footer_links FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Insert default links
INSERT INTO public.footer_links (group_name, label, href, display_order) VALUES
('Navigation', 'About', '#about', 1),
('Navigation', 'Services', '#services', 2),
('Navigation', 'Projects', '#projects', 3),
('Navigation', 'Contact', '#contact', 4),
('Resources', 'Blog', '#blog', 5),
('Resources', 'Resume', '#resume', 6),
('Resources', 'Analytics Demo', '#visualizations', 7);

-- Add copyright text to profile
ALTER TABLE public.profile
ADD COLUMN copyright_text text;

UPDATE public.profile
SET copyright_text = 'HealthcareAI Consulting. All rights reserved.'
WHERE copyright_text IS NULL;

-- Add updated_at trigger
CREATE TRIGGER update_footer_links_updated_at
BEFORE UPDATE ON public.footer_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();