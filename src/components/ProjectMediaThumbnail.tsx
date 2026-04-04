import { useRef, useState } from "react";

interface ProjectMediaThumbnailProps {
  src: string;
  alt: string;
  className?: string;
}

const isVideo = (url: string) =>
  url.endsWith('.mp4') || url.endsWith('.webm');

export function ProjectMediaThumbnail({ src, alt, className = "" }: ProjectMediaThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  if (isVideo(src)) {
    return (
      <div
        className="w-full h-full relative"
        onMouseEnter={() => {
          setIsHovered(true);
          videoRef.current?.play();
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
        }}
      >
        <video
          ref={videoRef}
          src={src}
          className={className}
          muted
          loop
          playsInline
          preload="metadata"
        />
        {!isHovered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
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
