-- Create tools table to replace certifications
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view tools" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Admins can manage tools" ON public.tools FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Drop the old certifications table
DROP TABLE IF EXISTS public.certifications;