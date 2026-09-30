"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import LuxImage from "@/components/ui/LuxImage";
import Reveal from "@/components/motion/Reveal";
import ParallaxMedia from "@/components/motion/ParallaxMedia";
import SectionHeading from "@/components/home/SectionHeading";
import { SHOP_BY_CATEGORY } from "@/data/categoryFilters";
import { BRAND_IMAGES } from "@/lib/cloudinary";
import { displayCase } from "@/lib/product-display";

const WEARERS = [
  {
    label: "For Him",
    href: "/watches?gender=Men",
    src: BRAND_IMAGES.forHim,
    alt: "Man in a knit polo wearing a watch, seated in a leather chair",
  },
  {
    label: "For Her",
    href: "/watches?gender=Women",
    src: BRAND_IMAGES.forHer,
    alt: "Woman in a tailored jacket wearing a rose-tone watch",
  },
];

/** Entry points into the catalog: by wearer, then by collection. */
export default function CollectionsIndex() {
  const areaRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const area = areaRef.current;
    const preview = previewRef.current;
    if (!area || !preview) return;
    const r = area.getBoundingClientRect();
    preview.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0) translate(-50%, -50%)`;
  };

  return (
    <section
      data-header-theme="dark"
      aria-labelledby="collections-title"
      className="bg-[var(--noir)] text-[var(--ivory)] py-28 md:py-40"
    >
      <div className="lux-container">
        <SectionHeading
          index="06"
          eyebrow="Collections"
          tone="dark"
          title={
            <span id="collections-title">
              Find <em>yours.</em>
            </span>
          }
          lede="Begin with the wrist it is made for, or with the character you are drawn to."
        />

        <div className="mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
          {WEARERS.map((w, i) => (
            <Reveal key={w.href} variant="mask" delay={i * 120}>
              <Link href={w.href} className="group relative block">
                <ParallaxMedia
                  src={w.src}
                  alt={w.alt}
                  sizes="(min-width: 640px) 48vw, 100vw"
                  position="50% 35%"
                  depth={0.06}
                  className="aspect-[4/5] md:aspect-[5/6] bg-[var(--graphite)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-700 group-hover:opacity-80" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 flex items-end justify-between">
                  <span className="display text-[2.4rem] md:text-[3.4rem] leading-none">{w.label}</span>
                  <span className="lux-link text-[var(--ivory)]">
                    Explore{" "}
                    <span className="lux-arrow" aria-hidden>
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div
          ref={areaRef}
          onMouseMove={onMove}
          onMouseLeave={() => setHovered(null)}
          className="relative mt-24 md:mt-32"
        >
          <p className="eyebrow text-[var(--muted-dark)] mb-8">By collection</p>
          <ul className="border-t border-[var(--line-dark)]">
            {SHOP_BY_CATEGORY.map((cat, i) => (
              <li key={cat.slug} className="border-b border-[var(--line-dark)]">
                <Link
                  href={`/watches?filter=${cat.slug}`}
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  className="group flex items-center justify-between gap-6 py-5 md:py-7"
                >
                  <span className="flex items-baseline gap-5 md:gap-8 min-w-0">
                    <span className="numeral text-[0.9rem] text-[var(--champagne)] w-6 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`display text-[1.8rem] sm:text-[2.4rem] md:text-[3.6rem] leading-none transition-[color,transform] duration-700 ease-[var(--ease-lux)] md:group-hover:translate-x-3 ${
                        hovered !== null && hovered !== i ? "md:text-[var(--ivory)]/35" : ""
                      }`}
                    >
                      {displayCase(cat.label)}
                    </span>
                  </span>
                  <span
                    className="text-[1rem] opacity-40 transition-all duration-700 ease-[var(--ease-lux)] group-hover:opacity-100 group-hover:translate-x-1"
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Cursor-following preview (fine pointers only) */}
          <div
            ref={previewRef}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 hidden md:block w-[15rem] aspect-[4/5] z-10"
          >
            {SHOP_BY_CATEGORY.map((cat, i) => (
              <div
                key={cat.slug}
                className={`absolute inset-0 overflow-hidden transition-[opacity,clip-path] duration-700 ease-[var(--ease-lux)] ${
                  hovered === i ? "opacity-100 [clip-path:inset(0)]" : "opacity-0 [clip-path:inset(12%)]"
                }`}
                style={{ background: cat.bg }}
              >
                <LuxImage src={cat.image} alt="" fill sizes="240px" loading="lazy" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
