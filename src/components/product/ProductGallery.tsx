"use client";

import { useRef, useState } from "react";
import LuxImage from "@/components/ui/LuxImage";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

/**
 * Desktop: an editorial grid of photographs beside a sticky purchase panel.
 * Mobile: a full-bleed swipe gallery with a quiet counter.
 */
export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  if (!images.length) return <div className="aspect-[4/5] bg-[#ebe6dc]" />;

  const onScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    setIndex(Math.round(rail.scrollLeft / rail.clientWidth));
  };

  return (
    <div className="relative -mx-[var(--gutter)] lg:mx-0">
      {/* One set of images: a swipe rail on small screens, an editorial grid on desktop. */}
      <div
        ref={railRef}
        onScroll={onScroll}
        aria-label="Product photographs"
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible"
      >
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`relative w-full shrink-0 snap-start bg-[#ebe6dc] overflow-hidden aspect-[4/5] ${
              i === 0
                ? "lg:col-span-2 lg:aspect-[5/6]"
                : images.length % 2 === 0 && i === images.length - 1
                  ? "lg:col-span-2 lg:aspect-[16/10]"
                  : ""
            }`}
          >
            <LuxImage
              src={src}
              alt={i === 0 ? alt : `${alt} — view ${i + 1}`}
              fill
              sizes={i === 0 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 29vw, 100vw"}
              preload={i === 0}
              loading={i === 0 ? undefined : "lazy"}
              className="object-cover blend-multiply"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="lg:hidden absolute bottom-5 left-[var(--gutter)] right-[var(--gutter)] flex items-center gap-4" aria-hidden>
          <span className="numeral text-[0.9rem]">{String(index + 1).padStart(2, "0")}</span>
          <span className="relative flex-1 h-px bg-[var(--ink)]/15">
            <span
              className="absolute inset-y-0 left-0 bg-[var(--ink)] transition-transform duration-500 ease-[var(--ease-lux)]"
              style={{ width: `${100 / images.length}%`, transform: `translateX(${index * 100}%)` }}
            />
          </span>
          <span className="numeral text-[0.9rem] text-[var(--muted)]">{String(images.length).padStart(2, "0")}</span>
        </div>
      )}
    </div>
  );
}
