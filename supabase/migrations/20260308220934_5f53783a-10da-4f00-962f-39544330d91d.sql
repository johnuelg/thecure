
CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date_obtained TEXT NOT NULL DEFAULT '',
  credential_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view certifications" ON public.certifications
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage certifications" ON public.certifications
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
