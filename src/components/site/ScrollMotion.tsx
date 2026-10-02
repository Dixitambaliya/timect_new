"use client";

import { useEffect } from "react";
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
      // background-clip:text wordmarks can't be split — sweep a clip mask instead.
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
      // Masked line-by-line rise — the signature GSAP heading reveal.
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
 * `[data-parallax]` element — including ones rendered later (infinite scroll,
 * filter changes, route changes) — and hands it to GSAP ScrollTrigger.
 */
export default function ScrollMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const active = new Map<HTMLElement, () => void>();
    let frame = 0;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const scan = () => {
      frame = 0;
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
      if (!frame) frame = requestAnimationFrame(scan);
    };
    const queueRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    };

    scan();
    const mo = new MutationObserver(queueScan);
    mo.observe(document.body, { childList: true, subtree: true });
    // Lazy images / loaded products change page height → re-measure triggers.
    const ro = new ResizeObserver(queueRefresh);
    ro.observe(document.body);

    document.fonts?.ready?.then(queueRefresh);
    window.addEventListener("load", queueRefresh);

    return () => {
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener("load", queueRefresh);
      cancelAnimationFrame(frame);
      clearTimeout(refreshTimer);
      active.forEach((cleanup) => cleanup());
      active.clear();
    };
  }, []);

  return null;
}
