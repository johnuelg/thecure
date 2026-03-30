import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useDynamicFavicon() {
  const { data: profile } = useQuery({
    queryKey: ['profile-branding'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profile')
        .select('favicon_url, logo_url, site_title, site_description')
        .maybeSingle();
      return data as {
        favicon_url: string | null;
        logo_url: string | null;
        site_title: string | null;
        site_description: string | null;
      } | null;
    },
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    const p = profile as any;
    if (!p) return;

    // Favicon - remove all existing and set fresh
    if (p.favicon_url) {
      // Remove all existing favicon links
      const existingLinks = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']");
      existingLinks.forEach(el => el.remove());

      // Create new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = p.favicon_url + '?v=' + Date.now();
      document.head.appendChild(link);

      // Also add shortcut icon for broader browser support
      const shortcut = document.createElement('link');
      shortcut.rel = 'shortcut icon';
      shortcut.href = p.favicon_url + '?v=' + Date.now();
      document.head.appendChild(shortcut);
    }

    // Site title
    if (p.site_title) {
      document.title = p.site_title;
    }

    // Meta description
    if (p.site_description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = p.site_description;

      // Also update OG description
      let ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
      if (ogDesc) ogDesc.content = p.site_description;
      let twDesc = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement | null;
      if (twDesc) twDesc.content = p.site_description;
    }

    // OG title
    if (p.site_title) {
      let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
      if (ogTitle) ogTitle.content = p.site_title;
      let twTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement | null;
      if (twTitle) twTitle.content = p.site_title;
    }
  }, [profile]);
}
