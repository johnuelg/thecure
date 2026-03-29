import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useDynamicFavicon() {
  const { data: profile } = useQuery({
    queryKey: ['profile-branding'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profile')
        .select('favicon_url, logo_url')
        .maybeSingle();
      return data as { favicon_url: string | null; logo_url: string | null } | null;
    },
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    const faviconUrl = (profile as any)?.favicon_url;
    if (!faviconUrl) return;

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [profile]);
}
