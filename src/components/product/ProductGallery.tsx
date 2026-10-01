"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { cx } from "@/lib/cx";
import { catalogThumbUrl } from "@/lib/catalog-image";
import { Badge } from "@/components/fuse/buttons";
import { Modal } from "@/components/fuse/Overlay";
import { ArrowLeft, ArrowRight, CloseIcon } from "@/components/fuse/icons";

/** Hover-zoom image: follows the cursor at 2x on fine pointers. */
function ZoomImage({ src, alt, onOpen, eager }: { src: string; alt: string; onOpen: () => void; eager?: boolean }) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onMouseLeave={() => setZoom(null)}
      className="relative block h-full w-full cursor-zoom-in overflow-hidden"
      aria-label="Open image zoom"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={catalogThumbUrl(src, 1400)}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        className="img-fill object-contain transition-transform duration-300 ease-out"
        style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
      />
    </button>
  );
}

function Lightbox({
  open,
  onClose,
  images,
  index,
  setIndex,
  title,
}: {
  open: boolean;
  onClose: () => void;
  images: string[];
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  title: string;
}) {
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open, images.length, setIndex]);
  return (
    <Modal open={open} onClose={onClose} label={`${title} images`} className="h-[calc(100vh-16px)] max-w-[1600px] bg-white md:h-[calc(100vh-48px)]">
      <div className="relative h-full">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${src}-${i}`}
            src={catalogThumbUrl(src, 2000)}
            alt=""
            className={cx("img-fill object-contain p-6 transition-opacity duration-400", i === index ? "opacity-100" : "opacity-0")}
          />
        ))}
        <button type="button" onClick={onClose} aria-label="Close" className="icon-btn absolute right-4 top-4 bg-white">
          <CloseIcon />
        </button>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-fuse bg-white/80 p-2 backdrop-blur">
            <button type="button" className="slider-arrow is-sm" onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)} aria-label="Previous image">
              <ArrowLeft />
            </button>
            <span className="min-w-14 text-center font-semibold">
              {index + 1} / {images.length}
            </span>
            <button type="button" className="slider-arrow is-sm" onClick={() => setIndex((i) => (i + 1) % images.length)} aria-label="Next image">
              <ArrowRight />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * Fuse product media: large stage, prev/next tiles on the left, vertical
 * thumbnail rail on the right, swipe on touch, hover zoom + lightbox.
 */
export default function ProductGallery({
  images: raw,
  title,
  labels = [],
}: {
  images: string[];
  title: string;
  labels?: string[];
}) {
  const images = raw.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);

  useEffect(() => {
    const el = rail.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [index]);

  const go = (d: number) => setIndex((i) => (i + d + images.length) % images.length);

  return (
    <div className="relative flex h-full gap-4 rounded-fuse bg-white p-2 md:p-6">
      <div
        className="relative min-h-[340px] flex-1 overflow-hidden rounded-fuse-md"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        <div className="relative aspect-square w-full lg:aspect-auto lg:h-[min(78vh,820px)]">
          {images.length === 0 && <div className="img-fill bg-placeholder" />}
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className={cx(
                "absolute inset-0 transition-[opacity,transform] duration-[600ms] ease-fuse-out",
                i === index ? "z-[1] scale-100 opacity-100" : "pointer-events-none scale-[.98] opacity-0",
              )}
            >
              {Math.abs(i - index) <= 1 || i === 0 ? (
                <ZoomImage src={src} alt={title} eager={i === 0} onOpen={() => setLightbox(true)} />
              ) : null}
            </div>
          ))}
        </div>

        {labels.length > 0 && (
          <div className="pointer-events-none absolute left-2 top-2 z-[2] flex flex-col items-start gap-1">
            {labels.map((l) => (
              <Badge key={l}>{l}</Badge>
            ))}
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute left-2 top-1/2 z-[2] hidden -translate-y-1/2 flex-col gap-2 md:flex">
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="flex h-16 w-20 items-center justify-center rounded-fuse border border-line-soft bg-white transition-colors hover:border-line-hover">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className="flex h-16 w-20 items-center justify-center rounded-fuse border border-line-soft bg-white transition-colors hover:border-line-hover">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-2 z-[2] flex justify-center gap-1.5 md:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cx("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-ink" : "w-1.5 bg-ink/25")}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="relative hidden w-20 shrink-0 md:block">
          <div
            ref={rail}
            className="no-scrollbar absolute inset-0 flex flex-col gap-2 overflow-y-auto py-12 [mask-image:linear-gradient(transparent,#000_12%,#000_88%,transparent)]"
          >
            {images.map((src, i) => (
              <button
                key={`${src}-r${i}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                className={cx(
                  "relative aspect-square w-20 shrink-0 overflow-hidden rounded-fuse-md border transition-[border-color,opacity] duration-400",
                  i === index ? "border-accent-border" : "border-transparent opacity-80 hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={catalogThumbUrl(src, 160)} alt="" loading="lazy" className="img-fill object-contain" />
              </button>
            ))}
          </div>
        </div>
      )}

      <Lightbox open={lightbox} onClose={() => setLightbox(false)} images={images} index={index} setIndex={setIndex} title={title} />
    </div>
  );
}
