"use client";

import { useEffect, type RefObject } from "react";

/**
 * Calls `onProgress(p)` (0 → 1) as `ref` travels through the viewport.
 * mode "pin": 0 when the element's top hits the viewport top, 1 when its bottom
 *             reaches the viewport bottom (for tall sections with a sticky stage).
 * mode "pass": 0 when the top enters from below, 1 when the bottom leaves at the top.
 * Work is coalesced into one requestAnimationFrame per scroll burst.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  mode: "pin" | "pass" = "pin",
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let visible = true;

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p: number;
      if (mode === "pin") {
        const distance = rect.height - vh;
        p = distance > 0 ? -rect.top / distance : rect.top <= 0 ? 1 : 0;
      } else {
        p = (vh - rect.top) / (vh + rect.height);
      }
      onProgress(Math.min(1, Math.max(0, p)));
    };

    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(measure);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    io.observe(el);

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, onProgress, mode]);
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Map p from [a, b] to [0, 1], clamped. */
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/** Smooth, precise ease — slow in, slow out. */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
