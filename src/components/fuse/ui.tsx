"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { Carousel } from "./hooks";
import { ArrowLeft, ArrowRight } from "./icons";

type RevealType = "rise" | "fade" | "wipe" | "zoom";

/** Wraps children with the Fuse entrance animation (rise / fade / wipe / zoom), played by GSAP. */
export function Reveal({
  as: Tag = "div",
  type = "rise",
  delay = 0,
  className,
  style,
  children,
  ...rest
}: {
  as?: ElementType;
  type?: RevealType;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
}) {
  return (
    <Tag
      className={cx(`reveal-${type}`, className)}
      style={{ "--delay": `${delay}s`, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Plain section wrapper; nested .reveal-* children are animated by ScrollMotion. */
export function Section({
  as: Tag = "section",
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}) {
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  );
}

export function SectionHeading({
  children,
  className,
  center,
}: {
  children: ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <Reveal as="h2" type="wipe" className={cx("fuse-h2", center && "text-center", className)}>
      {children}
    </Reveal>
  );
}

export function SliderArrows({
  carousel,
  className,
  small,
  glass,
}: {
  carousel: Carousel;
  className?: string;
  small?: boolean;
  glass?: boolean;
}) {
  const cls = cx("slider-arrow", small && "is-sm", glass && "is-glass");
  return (
    <div className={cx("flex gap-2", className)}>
      <button type="button" className={cls} onClick={carousel.prev} disabled={carousel.atStart} aria-label="Previous slide">
        <ArrowLeft />
      </button>
      <button type="button" className={cls} onClick={carousel.next} disabled={carousel.atEnd} aria-label="Next slide">
        <ArrowRight />
      </button>
    </div>
  );
}

/** Thin progress bar under horizontal carousels. */
export function CarouselProgress({ carousel, className }: { carousel: Carousel; className?: string }) {
  return (
    <div className={cx("mx-auto h-1 w-[240px] overflow-hidden rounded-full bg-pag-bg md:w-[320px]", className)}>
      <div
        className="h-full rounded-full bg-pag-fill transition-[width] duration-200"
        style={{ width: `${Math.max(12, carousel.progress * 100)}%` }}
      />
    </div>
  );
}
