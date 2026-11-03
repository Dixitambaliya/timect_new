"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { getLenis, setLenis } from "@/lib/smooth-scroll";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis smooth scrolling for the storefront. Disabled for users who prefer
 * reduced motion; touch input uses Lenis' synchronized inertia while nested
 * scroll areas (drawers and carousels) keep native scrolling.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    // Lenis is driven by GSAP's ticker so ScrollTrigger reads the same
    // smoothed scroll position on every frame (no jitter between the two).
    const lenis = new Lenis({
      autoRaf: false,
      // Lenis ignores duration/easing while lerp is defined. A lower explicit
      // lerp gives wheel input a longer, calmer settle than its 0.1 default.
      lerp: isTouch ? 0.08 : 0.065,
      smoothWheel: true,
      wheelMultiplier: 0.72,
      touchMultiplier: 1,
      syncTouch: isTouch,
      syncTouchLerp: 0.06,
      touchInertiaExponent: 1.35,
      allowNestedScroll: true,
      anchors: true,
      stopInertiaOnNavigate: true,
    });
    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);
    return () => {
      setLenis(null);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // New page → jump to top instantly and re-measure the page height.
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.resize();
      if (!window.location.hash) lenis.scrollTo(0, { immediate: true, force: true });
    }
    ScrollTrigger.refresh();
  }, [pathname]);

  // Filter changes (same path) can change page height without a scroll jump.
  useEffect(() => {
    getLenis()?.resize();
    ScrollTrigger.refresh();
  }, [search]);

  return null;
}
