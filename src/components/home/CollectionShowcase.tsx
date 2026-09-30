"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import SectionHeading from "@/components/home/SectionHeading";
import WatchCard, { type WatchCardData } from "@/components/home/WatchCard";
import Reveal from "@/components/motion/Reveal";

type Props = { products: WatchCardData[] };

/**
 * New arrivals as a horizontal editorial rail. Native scrolling (touch, trackpad,
 * keyboard) with mouse drag layered on top; clicks are suppressed after a drag.
 */
export default function CollectionShowcase({ products }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const [edges, setEdges] = useState({ start: true, end: false });

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const p = max > 0 ? rail.scrollLeft / max : 0;
    const visible = rail.scrollWidth > 0 ? rail.clientWidth / rail.scrollWidth : 1;
    if (barRef.current) {
      barRef.current.style.width = `${Math.max(visible, 0.08) * 100}%`;
      barRef.current.style.transform = `translateX(${(p * (1 / Math.max(visible, 0.08) - 1) * 100).toFixed(2)}%)`;
    }
    setEdges({ start: rail.scrollLeft < 8, end: rail.scrollLeft > max - 8 });
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync, products.length]);

  const step = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-card]");
    const amount = (card?.offsetWidth ?? rail.clientWidth * 0.3) + 32;
    rail.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !railRef.current) return;
    drag.current = { active: true, startX: e.clientX, startLeft: railRef.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const rail = railRef.current;
    if (!d.active || !rail) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6 && !d.moved) {
      d.moved = true;
      rail.style.scrollSnapType = "none";
      rail.setPointerCapture(e.pointerId);
    }
    if (d.moved) rail.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    const rail = railRef.current;
    drag.current.active = false;
    if (rail) rail.style.scrollSnapType = "";
  };
  const suppressClickAfterDrag = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <section
      id="collection"
      data-header-theme="light"
      aria-labelledby="collection-title"
      className="bg-[var(--paper)] text-[var(--ink)] pt-28 md:pt-40 pb-24 md:pb-32 overflow-hidden"
    >
      <div className="lux-container">
        <SectionHeading
          index="04"
          eyebrow="The Collection"
          title={
            <span id="collection-title">
              New to the <em>collection.</em>
            </span>
          }
          lede="Recent additions to the Timect line — each one chosen for the way it wears, reads and endures."
          aside={
            <Link href="/watches?category=new" className="lux-link">
              View all new arrivals{" "}
              <span className="lux-arrow" aria-hidden>
                →
              </span>
            </Link>
          }
        />
      </div>

      {products.length > 0 ? (
        <>
          <Reveal className="mt-16 md:mt-24">
            <div
              ref={railRef}
              onScroll={sync}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
              className="rail gap-5 md:gap-8 px-[var(--gutter)] scroll-px-[var(--gutter)] cursor-grab active:cursor-grabbing select-none"
              aria-label="New arrivals"
            >
              {products.map((product, i) => (
                <div
                  key={product.slug}
                  data-card
                  className={`shrink-0 ${
                    i === 0
                      ? "w-[82vw] sm:w-[58vw] md:w-[44vw] lg:w-[38vw] xl:w-[34rem]"
                      : "w-[68vw] sm:w-[42vw] md:w-[31vw] lg:w-[26vw] xl:w-[24rem]"
                  } ${i === 0 ? "" : "md:pt-24"}`}
                >
                  <WatchCard
                    product={product}
                    index={i}
                    featured={i === 0}
                    onClickCapture={suppressClickAfterDrag}
                    sizes={i === 0 ? "(min-width: 768px) 40vw, 82vw" : "(min-width: 768px) 28vw, 68vw"}
                  />
                </div>
              ))}
              <div className="shrink-0 w-px" aria-hidden />
            </div>
          </Reveal>

          <div className="lux-container mt-12 md:mt-16 flex items-center gap-8">
            <div className="relative flex-1 h-px bg-[var(--line)] overflow-hidden" aria-hidden>
              <div
                ref={barRef}
                className="absolute inset-y-0 left-0 bg-[var(--ink)] transition-transform duration-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <RailButton label="Previous watches" disabled={edges.start} onClick={() => step(-1)}>
                ←
              </RailButton>
              <RailButton label="Next watches" disabled={edges.end} onClick={() => step(1)}>
                →
              </RailButton>
            </div>
          </div>
        </>
      ) : (
        <div className="lux-container mt-16">
          <Link href="/watches" className="lux-link">
            Explore all watches{" "}
            <span className="lux-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>
      )}
    </section>
  );
}

function RailButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="w-12 h-12 rounded-full border border-[var(--line)] flex items-center justify-center text-[0.95rem] transition-colors duration-500 hover:border-[var(--ink)] disabled:opacity-30 disabled:hover:border-[var(--line)]"
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}
