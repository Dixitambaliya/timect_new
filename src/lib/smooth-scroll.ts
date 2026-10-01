import type Lenis from "lenis";

/**
 * Shared handle to the storefront Lenis instance so overlays and buttons can
 * pause / drive smooth scrolling. Falls back to native scrolling when Lenis
 * isn't running (admin, reduced motion, before hydration).
 */
let instance: Lenis | null = null;
let locks = 0;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
  if (lenis && locks > 0) lenis.stop();
}

export function getLenis(): Lenis | null {
  return instance;
}

/** Pause smooth scrolling while a drawer / modal is open (ref-counted). */
export function lockSmoothScroll() {
  locks += 1;
  instance?.stop();
}

export function unlockSmoothScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) instance?.start();
}

export function smoothScrollTo(top: number) {
  if (instance) instance.scrollTo(top, { duration: 1.2 });
  else window.scrollTo({ top, behavior: "smooth" });
}
