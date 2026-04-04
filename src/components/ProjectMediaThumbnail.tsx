interface ProjectMediaThumbnailProps {
  src: string;
  alt: string;
  className?: string;
}

const isVideo = (url: string) =>
  url.endsWith('.mp4') || url.endsWith('.webm');

export function ProjectMediaThumbnail({ src, alt, className = "" }: ProjectMediaThumbnailProps) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        className={className}
        muted
        loop
        playsInline
        autoPlay
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
