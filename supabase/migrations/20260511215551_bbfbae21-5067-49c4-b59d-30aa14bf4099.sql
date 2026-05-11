-- Rate limit counter table
CREATE TABLE IF NOT EXISTS public.chat_rate_limits (
  key TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rate limits"
  ON public.chat_rate_limits
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Atomic check-and-increment. Returns true if request is allowed (under limit),
-- false if rate-limited. Resets the window when it has elapsed.
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  _key TEXT,
  _max_requests INTEGER,
  _window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _now TIMESTAMPTZ := now();
  _window_start TIMESTAMPTZ;
  _count INTEGER;
BEGIN
  INSERT INTO public.chat_rate_limits (key, window_started_at, request_count, updated_at)
  VALUES (_key, _now, 1, _now)
  ON CONFLICT (key) DO UPDATE
  SET
    window_started_at = CASE
      WHEN public.chat_rate_limits.window_started_at < _now - make_interval(secs => _window_seconds)
        THEN _now
      ELSE public.chat_rate_limits.window_started_at
    END,
    request_count = CASE
      WHEN public.chat_rate_limits.window_started_at < _now - make_interval(secs => _window_seconds)
        THEN 1
      ELSE public.chat_rate_limits.request_count + 1
    END,
    updated_at = _now
  RETURNING window_started_at, request_count INTO _window_start, _count;

  RETURN _count <= _max_requests;
END;
$$;

-- Lock down execution: only the service role (used by edge functions) may call this.
REVOKE EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INTEGER, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

-- Helpful index for cleanup
CREATE INDEX IF NOT EXISTS chat_rate_limits_updated_at_idx
  ON public.chat_rate_limits (updated_at);