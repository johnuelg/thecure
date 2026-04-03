ALTER TABLE public.hero_keyword_highlights 
ADD COLUMN target text NOT NULL DEFAULT 'bio' 
CHECK (target IN ('bio', 'headline', 'both'));