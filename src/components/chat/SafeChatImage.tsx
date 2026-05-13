import { useEffect, useState, type ImgHTMLAttributes } from "react";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_DIM = 1600; // px — natural dimension cap before we refuse to render

interface SafeChatImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

/**
 * Renders an <img> with client-side guards:
 *  - HEAD-checks Content-Length and refuses to render if > 5 MB (when the
 *    server reports it; many CDNs do).
 *  - On load, inspects naturalWidth/Height and hides the image if either
 *    exceeds 1600px to protect layout/perf.
 *  - Caps rendered size via CSS (max-w-full, max-h-80) regardless.
 */
const SafeChatImage = ({ src, alt, ...rest }: SafeChatImageProps) => {
  const [blocked, setBlocked] = useState(false);
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    // Best-effort HEAD check; ignore CORS/network failures and let the
    // <img> tag try anyway — the onLoad guard is the second line of defense.
    (async () => {
      try {
        const res = await fetch(src, { method: "HEAD", mode: "cors" });
        const len = Number(res.headers.get("content-length") ?? "0");
        if (len && len > MAX_BYTES && !cancelled) {
          setBlocked(true);
          setReason(`Image too large (${(len / 1024 / 1024).toFixed(1)} MB)`);
        }
      } catch {
        // ignore — fall back to onLoad checks
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (blocked) {
    return (
      <span className="block text-xs italic text-muted-foreground">
        [{reason || "Image blocked"}]
      </span>
    );
  }

  return (
    <img
      {...rest}
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      className="max-w-full h-auto max-h-80 rounded-md"
      onLoad={(e) => {
        const el = e.currentTarget;
        if (el.naturalWidth > MAX_DIM || el.naturalHeight > MAX_DIM) {
          setBlocked(true);
          setReason(
            `Image too large (${el.naturalWidth}×${el.naturalHeight}px)`,
          );
        }
      }}
      onError={() => {
        setBlocked(true);
        setReason("Image failed to load");
      }}
    />
  );
};

export default SafeChatImage;
