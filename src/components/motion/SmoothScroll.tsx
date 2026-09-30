"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

/**
 * Inertial wheel scrolling for long-form pages. Native scroll stays the source
 * of truth (Lenis drives window.scrollTo), so sticky stages and
 * IntersectionObservers keep working. Disabled for reduced motion and touch.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
