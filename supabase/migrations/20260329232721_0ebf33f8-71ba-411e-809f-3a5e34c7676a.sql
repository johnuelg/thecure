ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS site_title text DEFAULT NULL;
ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS site_description text DEFAULT NULL;