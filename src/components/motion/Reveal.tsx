"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

type RevealProps = {
  as?: ElementType;
  /** fade: rise + fade · mask: wipe from top · focus: blur → sharp · line: hairline draws in */
  variant?: "fade" | "mask" | "focus" | "line";
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Fraction of the element that must be visible. */
  threshold?: number;
} & Record<string, unknown>;

/**
 * One-shot reveal driven by IntersectionObserver + CSS transitions
 * (no per-frame JS). Reduced motion is handled in CSS.
 */
export default function Reveal({
  as: Tag = "div",
  variant = "fade",
  delay = 0,
  className = "",
  style,
  children,
  threshold = 0.18,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      className={className}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
