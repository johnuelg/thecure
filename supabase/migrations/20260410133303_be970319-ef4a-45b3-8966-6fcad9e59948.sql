ALTER TABLE public.hero_parallax_icons
  ADD COLUMN icon_type text NOT NULL DEFAULT 'lucide',
  ADD COLUMN custom_icon_url text;
