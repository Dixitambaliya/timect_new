"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { getLenis, setLenis } from "@/lib/smooth-scroll";

/**
 * Lenis smooth scrolling for the storefront. Disabled for users who prefer
 * reduced motion; nested scroll areas (drawers, carousels) keep native scroll.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      allowNestedScroll: true,
      anchors: true,
    });
    setLenis(lenis);
    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  // New page → jump to top instantly and re-measure the page height.
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    lenis.resize();
    if (!window.location.hash) lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  // Filter changes (same path) can change page height without a scroll jump.
  useEffect(() => {
    getLenis()?.resize();
  }, [search]);

  return null;
}
