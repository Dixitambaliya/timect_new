"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/data/storefront";
import { cx } from "@/lib/cx";
import { catalogThumbUrl } from "@/lib/catalog-image";
import { ArrowLeft, ArrowRight } from "@/components/fuse/icons";

const AUTOPLAY = 5500;

function BackgroundTitle({ slide }: { slide: HeroSlide }) {
  const primary = slide.title.trim() || "TIMECT";
  const secondary = slide.subtitle.trim() || "COLLECTION";

  return (
    <div
      className="pointer-events-none absolute -right-[34%] top-[13%] z-[1] w-[110%] select-none text-right font-chivo uppercase leading-[0.76] tracking-[-0.075em] text-[#102852] opacity-[0.14] md:-right-[14%] md:top-[14%] md:w-[82%] md:opacity-25 lg:-right-[3vw] lg:top-[9%] lg:w-[66%] lg:leading-[0.72] lg:opacity-100"
      aria-hidden
    >
      <span
        className="block whitespace-nowrap text-[clamp(58px,17vw,92px)] font-light text-transparent md:text-[clamp(80px,12vw,124px)] lg:text-[clamp(76px,10.8vw,188px)]"
        style={{ WebkitTextStroke: "1.25px #102852" }}
      >
        {primary}
      </span>
      <span className="block whitespace-nowrap text-[clamp(70px,20vw,108px)] font-black md:text-[clamp(96px,14vw,148px)] lg:text-[clamp(92px,13vw,226px)]">
        {secondary}
      </span>
      <span
        className="block whitespace-nowrap text-[clamp(64px,18vw,98px)] font-light text-transparent md:text-[clamp(88px,13vw,136px)] lg:text-[clamp(82px,11.5vw,200px)]"
        style={{ WebkitTextStroke: "1.25px #102852" }}
      >
        MOMENT
      </span>
    </div>
  );
}

export default function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const touch = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = setTimeout(() => go(index + 1), AUTOPLAY);
    return () => clearTimeout(timer);
  }, [go, index, paused, slides.length]);

  if (!slides.length) return null;

  const slideNumber = String(index + 1).padStart(2, "0");
  const slideCount = String(slides.length).padStart(2, "0");

  return (
    <section
      className="container-fuse pb-2 md:max-w-none md:px-0 md:pb-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured watches"
    >
      <div
        className="relative isolate min-h-[720px] overflow-hidden rounded-fuse bg-[#f7f6f2] text-[#102852] md:min-h-[760px] md:rounded-none lg:min-h-[calc(100svh-var(--announcement-h))]"
        onTouchStart={(event) => (touch.current = event.touches[0].clientX)}
        onTouchEnd={(event) => {
          if (touch.current === null) return;
          const distance = event.changedTouches[0].clientX - touch.current;
          if (Math.abs(distance) > 50) go(index + (distance < 0 ? 1 : -1));
          touch.current = null;
        }}
      >
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_76%_68%,rgba(195,202,211,.46),transparent_28%),linear-gradient(115deg,#fbfaf7_0%,#f7f6f2_52%,#eceef0_100%)]" />
        <div className="absolute -bottom-[14%] right-[-35%] z-0 aspect-square w-[100%] rounded-full border border-[#aab3c0]/60 bg-[repeating-radial-gradient(circle_at_center,rgba(255,255,255,.92)_0_2px,rgba(180,188,198,.22)_3px_4px,rgba(255,255,255,.9)_6px_10px)] shadow-[inset_0_0_60px_rgba(16,40,82,.14),0_-20px_80px_rgba(16,40,82,.08)] md:-bottom-[24%] md:right-[-20%] md:w-[82%] lg:-bottom-[34%] lg:right-[-9%] lg:w-[72%]" />

        {slides.map((slide, slideIndex) => {
          const active = slideIndex === index;
          const nearby = active || Math.abs(slideIndex - index) === 1;

          return (
            <div
              key={slide.id || slideIndex}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${slides.length}`}
              aria-hidden={!active}
              className={cx(
                "absolute inset-0 transition-opacity duration-700 ease-fuse",
                active ? "z-[2] opacity-100" : "pointer-events-none z-[1] opacity-0",
              )}
            >
              <BackgroundTitle slide={slide} />

              <div className="absolute inset-x-5 top-[16%] z-[4] md:left-[6%] md:right-auto md:top-[17%] md:w-[50%] lg:left-[4.2%] lg:top-[18%] lg:w-[38%] xl:w-[34%]">
                <div
                  className={cx(
                    "transition-[opacity,transform] duration-700 ease-fuse-out",
                    active && loaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
                  )}
                >
                  <div className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#52627e] md:mb-6 md:gap-4 md:text-[11px] md:tracking-[0.42em] lg:mb-7">
                    <span>Timect collection</span>
                    <span className="h-px w-12 bg-[#76849a] md:w-20" />
                  </div>
                  <h1 className="max-w-[520px] font-chivo text-[44px] font-black leading-[0.92] tracking-[-0.055em] text-[#102852] sm:text-[52px] md:text-[clamp(58px,7.5vw,76px)] lg:text-[clamp(64px,6vw,104px)]">
                    Find<br />Your Time.
                  </h1>
                  <p className="mt-3 max-w-[360px] text-[14px] leading-[1.55] text-[#66748d] sm:text-[15px] md:mt-5 md:max-w-[470px] md:text-[17px] lg:text-[19px]">
                    {slide.description || "Timeless designs. Everyday distinction."}
                  </p>
                  <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center md:mt-7 lg:mt-8">
                    <Link
                      href={slide.href}
                      tabIndex={active ? 0 : -1}
                      className="group inline-flex w-full max-w-[280px] items-center justify-between gap-8 rounded-full bg-[#102852] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_12px_28px_rgba(16,40,82,.16)] transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto sm:justify-start md:px-7 md:py-4 md:text-[15px]"
                    >
                      {slide.buttonLabel || "Explore collection"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/corporate-gifting"
                      tabIndex={active ? 0 : -1}
                      className="group inline-flex items-center gap-4 border-b border-[#102852] pb-1 text-[14px] font-medium"
                    >
                      Corporate gifting
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>

              <div
                className={cx(
                  "absolute bottom-[76px] right-[-5%] z-[3] h-[31%] w-[58%] transition-[opacity,transform] duration-1000 ease-fuse-out sm:right-[1%] sm:h-[34%] sm:w-[54%] md:bottom-[5%] md:right-[2%] md:h-[50%] md:w-[43%] lg:bottom-[2%] lg:right-[7%] lg:h-[72%] lg:w-[44%]",
                  active && loaded ? "translate-x-0 translate-y-0 opacity-100" : "translate-x-8 translate-y-5 opacity-0",
                )}
                style={{ transitionDelay: active ? "120ms" : "0ms" }}
              >
                {nearby && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={catalogThumbUrl(slide.image, 1100)}
                    alt={`${slide.title} ${slide.subtitle}`.trim()}
                    loading={active ? "eager" : "lazy"}
                    className="h-full w-full object-contain object-center drop-shadow-[0_35px_30px_rgba(16,40,82,.2)] transition-transform duration-700 hover:scale-[1.025]"
                  />
                )}
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-6 left-5 z-[8] flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-[#66748d] sm:gap-3 sm:text-[11px] md:bottom-9 md:left-[6%] lg:left-[4.2%]">
          <span>{slideNumber}</span>
          <span className="h-px w-5 bg-[#aeb6c2]" />
          <span>{slideCount}</span>
          <div className="ml-1 flex items-center gap-1">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id || slideIndex}
                type="button"
                onClick={() => go(slideIndex)}
                aria-label={`Go to slide ${slideIndex + 1}`}
                aria-current={slideIndex === index ? "true" : undefined}
                className={cx(
                  "h-[2px] transition-[width,background-color] duration-500",
                  slideIndex === index ? "w-10 bg-[#102852] sm:w-16" : "w-6 bg-[#b7bec9] hover:bg-[#78859a] sm:w-9",
                )}
              />
            ))}
          </div>
          <div className="ml-2 hidden gap-1 sm:flex">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous watch" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#aeb6c2] transition-colors hover:bg-white">
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next watch" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#aeb6c2] transition-colors hover:bg-white">
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 z-[7] h-[3px] bg-[#102852]/15 transition-[width] duration-700" style={{ width: `${((index + 1) / slides.length) * 100}%` }} />
      </div>
    </section>
  );
}
