"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Where the photo shows through, in % of the word box:
 * T, I → solid · M → small upper crop · E → strong · C → lower section · last T → photo fading in from dark.
 */
const PHOTO_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>` +
    `<defs><linearGradient id='t'><stop offset='0' stop-color='#fff' stop-opacity='.2'/><stop offset='.6' stop-color='#fff'/></linearGradient></defs>` +
    `<g fill='#fff'>` +
    `<rect x='16' y='76' width='9' height='24'/>` +
    `<polygon points='38,0 50,0 50,44 41,56'/>` +
    `<polygon points='52,36 66,20 66,100 52,100'/>` +
    `<polygon points='68,60 84,38 84,100 68,100'/>` +
    `</g><rect x='85' y='0' width='15' height='100' fill='url(#t)'/></svg>`,
)}")`;

/**
 * Footer wordmark: solid charcoal TIMECT with the watch photo revealed only through
 * irregular crops (see `.wordmark-photo` mask), crossed by a gold second-hand line.
 */
export default function FooterWordmark({ image }: { image: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const photo = el.querySelector<HTMLElement>(".wordmark-photo")!;
    const hand = el.querySelector<HTMLElement>(".wordmark-hand")!;
    const ease = "power3.out";

    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 90%", once: true } })
        .fromTo(photo, { "--shift": "-18px", autoAlpha: 0 }, { "--shift": "0px", autoAlpha: 1, duration: 1.4, ease })
        .fromTo(
          hand,
          { autoAlpha: 0, rotate: -6, scale: 0.92 },
          { autoAlpha: 1, rotate: 0, scale: 1, duration: 1.2, ease },
          0.25,
        );
    }, el);

    const enter = () => {
      gsap.to(photo, { "--shift": "8px", duration: 0.9, ease, overwrite: "auto" });
      gsap.to(hand, { rotate: 2, duration: 0.9, ease, overwrite: "auto" });
    };
    const leave = () => {
      gsap.to(photo, { "--shift": "0px", duration: 0.9, ease, overwrite: "auto" });
      gsap.to(hand, { rotate: 0, duration: 0.9, ease, overwrite: "auto" });
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      ctx.revert();
    };
  }, []);

  return (
    <div className="text-center">
      <div ref={root} role="img" aria-label="Timect" className="wordmark">
        <span aria-hidden className="wordmark-base">
          TIMECT
        </span>
        <span aria-hidden className="wordmark-photo" style={{ "--text-image": `url(${image})`, "--wordmark-mask": PHOTO_MASK } as CSSProperties}>
          TIMECT
        </span>
        <span aria-hidden className="wordmark-hand">
          <i />
        </span>
      </div>
    </div>
  );
}
