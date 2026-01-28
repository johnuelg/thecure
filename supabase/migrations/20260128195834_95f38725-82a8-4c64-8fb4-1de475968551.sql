-- Create about_highlights table
CREATE TABLE public.about_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'Award',
  title text NOT NULL,
  description text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.about_highlights ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view active highlights"
ON public.about_highlights FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all highlights"
ON public.about_highlights FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage highlights"
ON public.about_highlights FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Insert default highlights
INSERT INTO public.about_highlights (icon, title, description, display_order) VALUES
('Award', '10+ Years Experience', 'Deep expertise in healthcare AI implementation', 1),
('Target', 'Results-Driven', 'Focused on measurable patient outcomes', 2),
('Lightbulb', 'Innovation Leader', 'Pioneering AI solutions in healthcare', 3);

-- Add updated_at trigger
CREATE TRIGGER update_about_highlights_updated_at
BEFORE UPDATE ON public.about_highlights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();