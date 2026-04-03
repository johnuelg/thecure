ALTER TABLE public.profile 
  ADD COLUMN IF NOT EXISTS blog_description text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS blog_posts_per_page integer DEFAULT 6,
  ADD COLUMN IF NOT EXISTS blog_layout text DEFAULT 'grid',
  ADD COLUMN IF NOT EXISTS blog_page_title text DEFAULT 'Blog',
  ADD COLUMN IF NOT EXISTS blog_meta_description text DEFAULT NULL;