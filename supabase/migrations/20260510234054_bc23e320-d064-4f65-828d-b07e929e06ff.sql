CREATE TABLE public.knowledge_extraction_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_hash TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  content TEXT NOT NULL,
  char_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_extraction_cache_hash
  ON public.knowledge_extraction_cache (content_hash);

ALTER TABLE public.knowledge_extraction_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage extraction cache"
  ON public.knowledge_extraction_cache
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can view extraction cache"
  ON public.knowledge_extraction_cache
  FOR SELECT
  TO authenticated
  USING (is_admin());