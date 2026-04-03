import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const FAVICON_SELECTOR = "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']";
const FALLBACK_FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>";

const setFaviconLinks = (href: string, type: string) => {
  const existingLinks = document.querySelectorAll(FAVICON_SELECTOR);
  existingLinks.forEach((el) => el.remove());

  const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];
  rels.forEach((rel) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (type) link.type = type;
    document.head.appendChild(link);
  });
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
      const p = profile;
      if (!p) return;

      const faviconSource = p.favicon_url || p.logo_url;
      if (faviconSource) {
        try {
          // Use a simple fetch — Supabase storage has CORS enabled
          const response = await fetch(p.favicon_url);

          if (!response.ok) {
            throw new Error(`Failed to load favicon: ${response.status}`);
          }

          const blob = await response.blob();

          // Validate it's actually an image
          if (!blob.type.startsWith('image/')) {
            throw new Error(`Favicon response is not an image: ${blob.type}`);
          }

          const dataUrl = await blobToDataUrl(blob);

          if (isCancelled) return;

          // Use the blob's actual MIME type for the link tag
          setFaviconLinks(dataUrl, blob.type);
          activeIconHrefRef.current = dataUrl;
        } catch (err) {
          console.warn('Dynamic favicon: blob conversion failed, using direct URL', err);

          if (isCancelled) return;

          // Fallback: use the URL directly (works if CORS allows it)
          setFaviconLinks(p.favicon_url, '');
          activeIconHrefRef.current = p.favicon_url;
        }
      } else {
        if (isCancelled) return;
        setFaviconLinks(FALLBACK_FAVICON, 'image/svg+xml');
        activeIconHrefRef.current = FALLBACK_FAVICON;
      }

      // Site title
      if (p.site_title) {
        document.title = p.site_title;

        const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
        if (ogTitle) ogTitle.content = p.site_title;
        const twTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement | null;
        if (twTitle) twTitle.content = p.site_title;
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

        const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
        if (ogDesc) ogDesc.content = p.site_description;
        const twDesc = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement | null;
        if (twDesc) twDesc.content = p.site_description;
      }
    };

    void applyFavicon();

    return () => {
      isCancelled = true;
    };
  }, [profile]);
}
