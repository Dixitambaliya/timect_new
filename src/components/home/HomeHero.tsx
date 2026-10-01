"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/data/storefront";
import { cx } from "@/lib/cx";
import { catalogThumbUrl } from "@/lib/catalog-image";
import { ButtonPrimary } from "@/components/fuse/buttons";
import { ArrowLeft, ArrowRight } from "@/components/fuse/icons";

const AUTOPLAY = 8000;

function Marquee({ text, className }: { text: string; className?: string }) {
  const items = Array.from({ length: 4 }, () => text);
  return (
    <div className={cx("marquee pointer-events-none overflow-hidden whitespace-nowrap", className)} aria-hidden>
      <div className="marquee-track" style={{ ["--speed" as string]: "60s" }}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {items.map((t, i) => (
              <span key={i} className="px-[.18em]">
                {t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Fuse "interactive slides" for Timect: blurred full-bleed backdrop, oversized
 * marquee title behind a floating watch card, copy bottom-left, glass spec
 * chips and a thumbnail navigator bottom-right. Slides come from the CMS.
 */
export default function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const thumbs = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const go = useCallback(
    (i: number) => {
      setIndex((i + slides.length) % slides.length);
      setTick((t) => t + 1);
    },
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setTimeout(() => go(index + 1), AUTOPLAY);
    return () => clearTimeout(t);
  }, [index, paused, go, tick, slides.length]);

  useEffect(() => {
    const el = thumbs.current?.children[index] as HTMLElement | undefined;
    if (el && thumbs.current) thumbs.current.scrollTo({ left: el.offsetLeft - 8, behavior: "smooth" });
  }, [index]);

  if (!slides.length) return null;

  return (
    <section
      className="container-fuse pb-[10px] md:pb-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured watches"
    >
      <div
        className="relative isolate h-[max(680px,min(calc(100svh-var(--announcement-h)-40px),900px))] overflow-hidden rounded-fuse bg-[#2b3342] text-white md:h-[max(780px,min(calc(100vh-20px),1000px))]"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
      >
        {slides.map((s, i) => {
          const active = i === index;
          const near = active || Math.abs(i - index) === 1 || (index === 0 && i === slides.length - 1);
          return (
            <div
              key={s.id || i}
              className={cx("absolute inset-0 transition-opacity duration-1000 ease-fuse", active ? "z-[1] opacity-100" : "z-0 opacity-0")}
              aria-hidden={!active}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
            >
              {/* blurred backdrop */}
              {near && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={catalogThumbUrl(s.image, 600)}
                  alt=""
                  className={cx(
                    "img-fill blur-[60px] transition-transform duration-[2s] ease-fuse-out md:blur-[100px]",
                    active && loaded ? "scale-[1.4]" : "scale-[1.6]",
                  )}
                />
              )}
              <div className="absolute inset-0 bg-[#1a1f2a]/45" />

              {/* oversized marquee + floating watch card */}
              <div className="absolute inset-0 z-[2] flex items-center justify-center pb-[310px] pt-[90px] md:pb-0 md:pt-0">
                <Marquee
                  text={`${s.title} ${s.subtitle}`.trim()}
                  className="absolute inset-x-0 top-[37%] -translate-y-1/2 font-chivo text-[64px] font-black uppercase leading-none text-white/90 md:top-1/2 md:text-[130px] xl:text-[200px]"
                />
                <div
                  className={cx(
                    "group/media relative h-[220px] w-[190px] overflow-hidden rounded-fuse bg-[radial-gradient(circle_at_50%_40%,#ffffff,#e6eaef_70%)] shadow-[0_40px_80px_rgba(0,0,0,.35)] transition-[opacity,transform] duration-1000 ease-fuse md:h-[460px] md:w-[400px]",
                    active && loaded ? "translate-y-0 opacity-100" : "translate-y-6 scale-90 opacity-0",
                  )}
                  style={{ transitionDelay: active ? "0.35s" : "0s" }}
                >
                  {near && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={catalogThumbUrl(s.image, 900)}
                      alt={`${s.title} ${s.subtitle}`}
                      loading={active ? "eager" : "lazy"}
                      className="img-fill object-contain p-6 transition-transform duration-1000 ease-fuse group-hover/media:scale-110"
                    />
                  )}
                </div>
              </div>

              {/* spec chips (desktop) */}
              {s.specs.length > 0 && (
                <ul
                  className={cx(
                    "absolute right-8 top-1/2 z-[3] hidden w-[230px] -translate-y-1/2 flex-col gap-2 transition-[opacity,transform] duration-[800ms] ease-fuse-out xl:flex",
                    active && loaded ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
                  )}
                  style={{ transitionDelay: active ? "0.6s" : "0s" }}
                >
                  {s.specs.map((spec) => (
                    <li key={spec.label} className="glass rounded-fuse-md !bg-[#1a1f2a]/55 px-4 py-3">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">{spec.label}</p>
                      <p className="mt-1 text-[16px] font-semibold">{spec.value}</p>
                    </li>
                  ))}
                </ul>
              )}

              {/* copy */}
              <div className="absolute inset-x-0 bottom-0 z-[3] flex flex-col items-center p-4 pb-16 text-center md:items-start md:p-12 md:text-left">
                <div
                  className={cx(
                    "max-w-[520px] transition-[opacity,transform] duration-[800ms] ease-fuse-out",
                    active && loaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                  )}
                  style={{ transitionDelay: active ? "0.5s" : "0s" }}
                >
                  {s.eyebrow && (
                    <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-white/75">{s.eyebrow}</p>
                  )}
                  <h2 className="text-[28px] font-bold leading-[1.1] text-white xl:text-[40px]">
                    {s.title} <span className="font-normal text-white/80">{s.subtitle}</span>
                  </h2>
                  <p className="mt-3 line-clamp-3 text-[14px] leading-[1.5] text-white/90 md:mt-5 md:line-clamp-none md:text-[16px]">{s.description}</p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-5 md:mt-8 md:justify-start">
                    <ButtonPrimary href={s.href} glass className="!bg-white/10" bg="#ffffff" tabIndex={active ? 0 : -1}>
                      {s.buttonLabel || "Explore"}
                    </ButtonPrimary>
                    {s.price && (
                      <div className="text-left">
                        <p className="text-[20px] font-semibold">{s.price}</p>
                        <p className="text-[12px] text-white/70">Incl. taxes · 5-year guarantee</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Thumbnail navigator (desktop) */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 right-8 z-[4] hidden items-end gap-4 lg:flex">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="glass flex h-[56px] w-[72px] items-center justify-center rounded-fuse bg-white/10 p-1"
            >
              <span className="flex h-full w-full items-center justify-center rounded-fuse-md bg-white text-ink">
                <ArrowLeft className="h-4 w-4" />
              </span>
            </button>
            <div className="glass w-[400px] rounded-fuse bg-white/10 p-2">
              <div ref={thumbs} className="no-scrollbar flex gap-2 overflow-x-auto">
                {slides.map((s, i) => (
                  <button
                    key={s.id || i}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index}
                    className={cx(
                      "relative h-[90px] w-[120px] shrink-0 overflow-hidden rounded-fuse-md border bg-white transition-[border-color,opacity] duration-400",
                      i === index ? "border-white" : "border-white/[.16] opacity-70 hover:opacity-100",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={catalogThumbUrl(s.image, 240)} alt="" className="img-fill object-contain p-2" loading="lazy" />
                  </button>
                ))}
              </div>
              <div className="mx-1 mt-2 h-[3px] overflow-hidden rounded-full bg-white/30">
                <div
                  key={`${index}-${tick}-${paused}`}
                  className="h-full origin-left rounded-full bg-white"
                  style={{
                    width: `${100 / slides.length}%`,
                    marginLeft: `${(index * 100) / slides.length}%`,
                    animation: paused ? "none" : `progress ${AUTOPLAY}ms linear both`,
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="glass flex h-[56px] w-[72px] items-center justify-center rounded-fuse bg-white/10 p-1"
            >
              <span className="flex h-full w-full items-center justify-center rounded-fuse-md bg-white text-ink">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        )}

        {/* Pagination (mobile / tablet) */}
        <div className="absolute inset-x-0 bottom-6 z-[4] flex justify-center gap-2 lg:hidden">
          {slides.map((s, i) => (
            <button
              key={s.id || i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cx("h-1.5 rounded-full transition-all duration-400", i === index ? "w-8 bg-white" : "w-1.5 bg-white/50")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
