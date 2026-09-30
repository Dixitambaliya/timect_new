"use client";

import { useEffect } from "react";

type HoverSwapImageProps = {
  src?: string;
  hoverSrc?: string;
  alt: string;
  fit?: "contain" | "cover";
  className?: string;
  priority?: boolean;
  onPrimaryLoad?: () => void;
};

/** Two stacked photos that crossfade on hover. Hover src is preloaded so it never pops in. */
export default function HoverSwapImage({
  src,
  hoverSrc,
  alt,
  fit = "contain",
  className = "",
  priority = false,
  onPrimaryLoad,
}: HoverSwapImageProps) {
  const primary = src || "";
  const hover = hoverSrc && hoverSrc !== primary ? hoverSrc : "";
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";

  useEffect(() => {
    if (!hover) return;
    const img = new Image();
    img.decoding = "async";
    img.src = hover;
  }, [hover]);

  return (
    <div className={`hover-swap ${className}`.trim()}>
      <img
        src={primary}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={onPrimaryLoad}
        className={`hover-swap__img hover-swap__img--base ${fitClass}`}
      />
      {hover ? (
        <img
          src={hover}
          alt=""
          loading="eager"
          decoding="async"
          className={`hover-swap__img hover-swap__img--alt ${fitClass}`}
        />
      ) : null}
    </div>
  );
}
