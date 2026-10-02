"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { getLenis, setLenis } from "@/lib/smooth-scroll";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis smooth scrolling for the storefront. Disabled for users who prefer
 * reduced motion; nested scroll areas (drawers, carousels) keep native scroll.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Lenis is driven by GSAP's ticker so ScrollTrigger reads the same
    // smoothed scroll position on every frame (no jitter between the two).
    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      allowNestedScroll: true,
      anchors: true,
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
    if (!lenis) return;
    lenis.resize();
    if (!window.location.hash) lenis.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.refresh();
  }, [pathname]);

  // Filter changes (same path) can change page height without a scroll jump.
  useEffect(() => {
    getLenis()?.resize();
    ScrollTrigger.refresh();
  }, [search]);

  return null;
}
