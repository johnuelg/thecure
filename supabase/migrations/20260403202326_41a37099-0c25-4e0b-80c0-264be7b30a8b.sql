ALTER TABLE public.profile 
  ADD COLUMN IF NOT EXISTS parallax_hover_effect text DEFAULT 'soft-glow',
  ADD COLUMN IF NOT EXISTS parallax_scroll_effect text DEFAULT 'parallax-shift';