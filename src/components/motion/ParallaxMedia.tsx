"use client";

import { useCallback, useRef } from "react";
import LuxImage from "@/components/ui/LuxImage";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScrollProgress } from "@/hooks/useScrollProgress";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  /** Tailwind aspect / sizing classes for the frame. */
  className?: string;
  /** object-position, e.g. "30% 40%" */
  position?: string;
  /** Travel as a fraction of the frame height (0.08 = ±8%). */
  depth?: number;
  preload?: boolean;
};

/**
 * Masked image frame: the photograph drifts slower than the page
 * (transform only) and settles in with a scale-down on reveal.
 */
export default function ParallaxMedia({
  src,
  alt,
  sizes,
  className = "",
  position = "50% 50%",
  depth = 0.08,
  preload = false,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const onProgress = useCallback(
    (p: number) => {
      if (reduced || !innerRef.current) return;
      const y = (0.5 - p) * depth * 2 * 100;
      innerRef.current.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
    },
    [depth, reduced],
  );
  useScrollProgress(frameRef, onProgress, "pass");

  return (
    <div ref={frameRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={innerRef}
        className="absolute left-0 right-0 will-change-transform"
        style={{ top: `-${depth * 100}%`, bottom: `-${depth * 100}%` }}
      >
        <LuxImage
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          className="reveal-img object-cover"
          style={{ objectPosition: position }}
        />
      </div>
    </div>
  );
}
