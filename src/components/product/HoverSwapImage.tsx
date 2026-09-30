"use client";

import { cld, cldSrcSet } from "@/lib/cloudinary";

type HoverSwapImageProps = {
  src?: string;
  hoverSrc?: string;
  alt: string;
  fit?: "contain" | "cover";
  className?: string;
  priority?: boolean;
  onPrimaryLoad?: () => void;
};

/** Two stacked photos that crossfade on hover. The hover frame lazy-loads with the card (it overlaps it). */
export default function HoverSwapImage({
  src,
  hoverSrc,
  alt,
  fit = "contain",
  className = "",
  priority = false,
  onPrimaryLoad,
}: HoverSwapImageProps) {
  // Deliver CDN-resized AVIF/WebP instead of multi-megabyte originals.
  const primary = cld(src, { w: 800 });
  const hover = hoverSrc && hoverSrc !== src ? cld(hoverSrc, { w: 800 }) : "";
  const sizes = "(min-width: 1024px) 25vw, 50vw";
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <div className={`hover-swap ${className}`.trim()}>
      <img
        src={primary}
        srcSet={cldSrcSet(src, [400, 600, 800, 1100])}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={onPrimaryLoad}
        className={`hover-swap__img hover-swap__img--base ${fitClass}`}
      />
      {hover ? (
        <img
          src={hover}
          srcSet={cldSrcSet(hoverSrc, [400, 600, 800, 1100])}
          sizes={sizes}
          alt=""
          loading="lazy"
          decoding="async"
          className={`hover-swap__img hover-swap__img--alt ${fitClass}`}
        />
      ) : null}
    </div>
  );
}
