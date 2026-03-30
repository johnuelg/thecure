import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const FAVICON_SELECTOR = "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']";
const FALLBACK_FAVICON = '/placeholder.svg';

const createIconLink = (rel: string, href: string, type: string) => {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  link.type = type;
  return link;
};

const getIconTypeFromUrl = (url: string) => {
  const normalizedUrl = url.toLowerCase();
  if (normalizedUrl.endsWith('.svg')) return 'image/svg+xml';
  if (normalizedUrl.endsWith('.ico')) return 'image/x-icon';
  if (normalizedUrl.endsWith('.png')) return 'image/png';
  return 'image/png';
};

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to convert favicon to data URL'));
    };
    reader.onerror = () => reject(new Error('Failed to read favicon blob'));
    reader.readAsDataURL(blob);
  });

export function useDynamicFavicon() {
  const activeIconHrefRef = useRef<string | null>(null);

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
    let isCancelled = false;

    const applyFavicon = async () => {
      const p = profile as any;

      let iconHref = FALLBACK_FAVICON;
      let iconType = 'image/svg+xml';

      if (p?.favicon_url) {
        try {
          const response = await fetch(p.favicon_url, { cache: 'no-store' });

          if (!response.ok) {
            throw new Error(`Failed to load favicon: ${response.status}`);
          }

          const blob = await response.blob();

          if (!blob.type.startsWith('image/')) {
            throw new Error('Favicon response is not an image');
          }

          iconHref = await blobToDataUrl(blob);
          iconType = blob.type || 'image/png';
        } catch {
          iconHref = `${p.favicon_url}${p.favicon_url.includes('?') ? '&' : '?'}v=${Date.now()}`;
          iconType = getIconTypeFromUrl(p.favicon_url);
        }
      }

      if (isCancelled) return;

      const existingLinks = document.querySelectorAll(FAVICON_SELECTOR);
      existingLinks.forEach((el) => el.remove());

      document.head.appendChild(createIconLink('icon', iconHref, iconType));
      document.head.appendChild(createIconLink('shortcut icon', iconHref, iconType));
      document.head.appendChild(createIconLink('apple-touch-icon', iconHref, iconType));
      activeIconHrefRef.current = iconHref;

      // Site title
      if (p?.site_title) {
        document.title = p.site_title;
      }

      // Meta description
      if (p?.site_description) {
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
      if (p?.site_title) {
        let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
        if (ogTitle) ogTitle.content = p.site_title;
        let twTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement | null;
        if (twTitle) twTitle.content = p.site_title;
      }
    };

    void applyFavicon();

    return () => {
      isCancelled = true;
    };
  }, [profile]); // stabilized
}
