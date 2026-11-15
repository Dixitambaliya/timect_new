"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

const SELECTOR = ".reveal-rise, .reveal-fade, .reveal-wipe, .reveal-zoom, [data-parallax]";
const START = "top 88%";

/** Author-set stagger from the inline `--delay` custom property (seconds). */
function delayOf(el: HTMLElement) {
  return parseFloat(el.style.getPropertyValue("--delay")) || 0;
}

/** Builds the GSAP animation for one element; returns its cleanup. */
function animate(el: HTMLElement): () => void {
  const ctx = gsap.context(() => {
    const delay = delayOf(el);
    // If the element is an item inside a horizontal scroll container,
    // trigger on the container's vertical position so offscreen items trigger properly.
    const trigger = el.closest(".overflow-x-auto") || el;

    const markRevealed = () => {
      el.classList.add("is-revealed");
    };

    const once = {
      trigger,
      start: START,
      once: true,
      fastScrollEnd: true,
      onEnter: markRevealed,
    };

    if (el.hasAttribute("data-parallax")) {
      // Image drifts against the scroll inside its overflow-hidden frame.
      const amount = parseFloat(el.dataset.parallax || "") || 10;
      gsap.fromTo(
        el,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
      return;
    }

    if (el.classList.contains("reveal-wipe")) {
      gsap.set(el, { opacity: 1, clipPath: "none" });
      markRevealed();
      // background-clip:text wordmarks can't be split -sweep a clip mask instead.
      if (el.classList.contains("text-image")) {
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 100% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.8,
            ease: "expo.inOut",
            delay,
            scrollTrigger: once,
            onComplete: markRevealed,
          },
        );
        return;
      }
      // Masked line-by-line rise -the signature GSAP heading reveal.
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.3,
            stagger: 0.12,
            delay,
            scrollTrigger: once,
            onComplete: markRevealed,
          }),
      });
      return;
    }

    const from: gsap.TweenVars = { autoAlpha: 0 };
    const to: gsap.TweenVars = {
      autoAlpha: 1,
      delay,
      scrollTrigger: once,
      onStart: markRevealed,
      onComplete: markRevealed,
      clearProps: "transform,visibility",
    };
    if (el.classList.contains("reveal-rise")) {
      Object.assign(from, { y: 60 });
      Object.assign(to, { y: 0, duration: 1.2 });
    } else if (el.classList.contains("reveal-zoom")) {
      Object.assign(from, { scale: 1.15 });
      Object.assign(to, { scale: 1, duration: 1.6 });
    } else {
      Object.assign(to, { duration: 1.4, ease: "power2.out" });
    }
    gsap.fromTo(el, from, to);
  });
  return () => ctx.revert();
}

/**
 * Scroll-driven motion for the storefront. Picks up every `.reveal-*` and
 * `[data-parallax]` element -including ones rendered later (infinite scroll,
 * filter changes, route changes) -and hands it to GSAP ScrollTrigger.
 */
export default function ScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    // ScrollTrigger, SplitText, and scrubbed parallax all measure or update on
    // the main thread. Keep mobile/touch scrolling compositor-driven instead;
    // globals.css exposes the elements without animation for these devices.
    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce), (max-width: 1024px), (hover: none), (pointer: coarse)",
      ).matches
    ) {
      return;
    }

    const active = new Map<HTMLElement, () => void>();
    let mounted = true;
    let frame = 0;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let scanTimer: ReturnType<typeof setTimeout> | undefined;
    const routeIsCurrent = () => window.location.pathname === pathname;

    const scan = () => {
      frame = 0;
      // The URL changes before an incoming RSC tree finishes hydrating. The
      // observer owned by the outgoing route must not add classes/styles to
      // that server-rendered markup or React will detect a hydration mismatch.
      if (!mounted || !routeIsCurrent()) return;
      for (const [el, cleanup] of active) {
        if (!el.isConnected) {
          cleanup();
          active.delete(el);
        }
      }
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (!active.has(el)) active.set(el, animate(el));
      });
      ScrollTrigger.refresh();
    };

    const queueScan = () => {
      if (!mounted || !routeIsCurrent()) return;
      clearTimeout(scanTimer);
      // Defer scanning until React finishes hydration and layout phases for newly inserted DOM nodes.
      scanTimer = setTimeout(() => {
        if (mounted && routeIsCurrent() && !frame) {
          frame = requestAnimationFrame(scan);
        }
      }, 100);
    };

    const queueRefresh = () => {
      if (!mounted || !routeIsCurrent()) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        if (mounted && routeIsCurrent()) ScrollTrigger.refresh();
      }, 200);
    };

    // Give React time to complete hydration on the tree before GSAP animates or splits text.
    scanTimer = setTimeout(() => {
      if (mounted && routeIsCurrent()) {
        scan();
      }
    }, 100);

    const mo = new MutationObserver(queueScan);
    mo.observe(document.body, { childList: true, subtree: true });
    // Lazy images / loaded products change page height → re-measure triggers.
    const ro = new ResizeObserver(queueRefresh);
    ro.observe(document.body);

    document.fonts?.ready?.then(queueRefresh);
    window.addEventListener("load", queueRefresh);

    return () => {
      mounted = false;
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener("load", queueRefresh);
      cancelAnimationFrame(frame);
      clearTimeout(refreshTimer);
      clearTimeout(scanTimer);
      active.forEach((cleanup) => cleanup());
      active.clear();
    };
  }, [pathname]);

  return null;
}
