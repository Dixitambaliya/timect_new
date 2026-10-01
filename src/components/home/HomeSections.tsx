"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { PromoBanner } from "@/data/storefront";
import type { ShopCategory } from "@/db/content";
import { cx } from "@/lib/cx";
import { catalogThumbUrl } from "@/lib/catalog-image";
import { useCarousel, useDragScroll } from "@/components/fuse/hooks";
import { CarouselProgress, Section, SectionHeading, SliderArrows } from "@/components/fuse/ui";
import { ButtonOutline, ButtonPrimary } from "@/components/fuse/buttons";
import { ArrowRight } from "@/components/fuse/icons";
import ProductCard, { type CardProduct } from "@/components/site/ProductCard";
import { watchesFilterHref } from "@/components/site/navigation";

/** Oversized statement heading with category link chips (Fuse "short links"). */
export function HomeStatement({
  heading,
  text,
  categories,
}: {
  heading: string;
  text: string;
  categories: ShopCategory[];
}) {
  return (
    <Section className="container-fuse py-10 md:py-[100px]">
      <div className="grid grid-cols-1 gap-6 px-3 md:px-16 lg:grid-cols-2 lg:gap-16">
        <h2 className="reveal-wipe fuse-h1 max-w-[640px]">{heading}</h2>
        <div className="flex min-w-0 flex-col gap-8 lg:pt-1">
          <p className="reveal-rise text-[14px] font-medium leading-[1.6] text-heading md:text-[20px] md:font-semibold md:leading-[1.5]">
            {text}
          </p>
          <ul className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 md:mx-0 md:flex-wrap md:px-0">
            {categories.map((c, i) => (
              <li key={c.slug} className="reveal-rise shrink-0" style={{ "--delay": `${0.1 + i * 0.05}s` } as CSSProperties}>
                <Link href={watchesFilterHref(c.slug)} className="btn-chip capitalize">
                  {c.label.toLowerCase()}
                  <ArrowRight />
                </Link>
              </li>
            ))}
            <li className="reveal-rise shrink-0" style={{ "--delay": `${0.1 + categories.length * 0.05}s` } as CSSProperties}>
              <Link href="/about" className="btn-chip">
                Our story
                <ArrowRight />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

type ProductTab = { id: string; label: string; href: string; products: CardProduct[] };

/** Tabbed product carousel (New arrivals / Recommended …) with Fuse arrows. */
export function ProductTabs({ heading, tabs }: { heading: string; tabs: ProductTab[] }) {
  const available = tabs.filter((t) => t.products.length);
  const [active, setActive] = useState(0);
  const car = useCarousel();
  useDragScroll(car.ref);
  if (!available.length) return null;
  const tab = available[Math.min(active, available.length - 1)];

  return (
    <Section className="container-fuse py-10 md:py-[60px]">
      <div className="mb-6 flex flex-col gap-6 px-2 md:mb-10 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading>{heading}</SectionHeading>
        <div className="flex flex-wrap items-center gap-2">
          {available.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActive(i);
                car.ref.current?.scrollTo({ left: 0 });
              }}
              className={cx("pill", i === active && "is-active")}
              aria-pressed={i === active}
            >
              {t.label}
              <span className="ms-2 text-[13px] font-normal text-muted">{t.products.length}</span>
            </button>
          ))}
          <SliderArrows carousel={car} small className="ms-2 hidden md:flex" />
        </div>
      </div>
      <ul
        key={tab.id}
        ref={car.ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto md:gap-3"
      >
        {tab.products.map((p, i) => (
          <li
            key={p.id}
            className="w-[calc(50%-4px)] shrink-0 snap-start animate-rise-in md:w-[calc(33.333%-8px)] xl:w-[calc(25%-9px)]"
            style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
          >
            <ProductCard product={p} priority={i < 4} />
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col items-center gap-8 md:mt-10">
        <CarouselProgress carousel={car} />
        <ButtonOutline href={tab.href} className="min-w-[240px]">
          View all {tab.label.toLowerCase()}
        </ButtonOutline>
      </div>
    </Section>
  );
}

/**
 * "Shop by category": the section background is a heavily blurred copy of
 * the hovered category image, cross-fading as you move across cards.
 */
export function CategoryCarousel({ categories }: { categories: ShopCategory[] }) {
  const [bg, setBg] = useState(0);
  const car = useCarousel();
  useDragScroll(car.ref);
  if (!categories.length) return null;
  return (
    <Section className="container-fuse py-10 md:py-[60px]">
      <div className="relative isolate overflow-hidden rounded-fuse py-8 md:py-20">
        {categories.map((c, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={c.slug}
            src={catalogThumbUrl(c.image, 600)}
            alt=""
            aria-hidden
            className={cx("img-fill -z-10 scale-125 blur-[60px] transition-opacity duration-1000 ease-fuse", i === bg ? "opacity-100" : "opacity-0")}
          />
        ))}
        <div className="absolute inset-0 -z-10 bg-white/35" />
        <div className="mb-6 flex items-end justify-between gap-6 px-4 md:mb-10 md:px-12">
          <h2 className="reveal-wipe fuse-h2 max-w-[520px]">Shop by category</h2>
          <SliderArrows carousel={car} glass className="hidden md:flex" />
        </div>
        <ul ref={car.ref} className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 md:scroll-px-12 md:px-12">
          {categories.map((c, i) => (
            <li
              key={c.slug}
              className="reveal-rise w-[170px] shrink-0 snap-start md:w-[240px]"
              style={{ "--delay": `${i * 0.06}s` } as CSSProperties}
              onMouseEnter={() => setBg(i)}
              onFocus={() => setBg(i)}
            >
              <Link
                href={watchesFilterHref(c.slug)}
                className="group/c block rounded-fuse bg-white p-2 transition-shadow duration-400 hover:shadow-[0_12px_30px_rgba(0,0,0,.1)]"
              >
                <span className="relative block aspect-[193/246] overflow-hidden rounded-fuse-md" style={{ background: c.bg }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={catalogThumbUrl(c.image, 480)}
                    alt=""
                    loading="lazy"
                    className="img-fill transition-transform duration-700 ease-fuse group-hover/c:scale-110"
                  />
                </span>
                <span className="block px-3 pb-8 pt-5 text-[16px] font-semibold capitalize">
                  <span className="link-hover">{c.label.toLowerCase()}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex justify-center md:mt-20">
          <ButtonOutline href="/watches" className="min-w-[214px] bg-white">
            See all watches
          </ButtonOutline>
        </div>
      </div>
    </Section>
  );
}

/**
 * Two-up full-bleed banners (For Him / For Her). Copy is revealed on hover on
 * desktop while the image slowly zooms; always visible on touch.
 */
export function GridBanner({ banners }: { banners: PromoBanner[] }) {
  if (!banners.length) return null;
  return (
    <Section className="container-fuse py-10 md:py-[60px]">
      <div className={cx("grid gap-2 overflow-hidden rounded-fuse md:gap-0", banners.length > 1 && "md:grid-cols-2")}>
        {banners.map((b, i) => (
          <div
            key={b.id || b.title}
            className="reveal-fade group/gb relative aspect-[708/780] overflow-hidden rounded-fuse md:rounded-none"
            style={{ "--delay": `${i * 0.15}s` } as CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={catalogThumbUrl(b.image, 1400)}
              alt=""
              loading="lazy"
              className="img-fill transition-transform duration-[1.6s] ease-fuse group-hover/gb:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-[#0000001a]" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-start bg-[linear-gradient(180deg,rgba(35,35,35,0),rgba(35,35,35,.65))] p-6 pt-32 text-white transition-[opacity,transform] duration-[600ms] ease-fuse-out md:translate-y-10 md:p-12 md:pt-48 md:opacity-0 md:group-focus-within/gb:translate-y-0 md:group-focus-within/gb:opacity-100 md:group-hover/gb:translate-y-0 md:group-hover/gb:opacity-100">
              <h2 className="text-[28px] font-bold text-white md:text-[44px] md:leading-[1.09]">{b.title}</h2>
              {b.text && <p className="mt-3 max-w-[460px] text-[16px] leading-[1.5]">{b.text}</p>}
              <ButtonPrimary href={b.href} glass bg="#ffffff" className="mt-6 !bg-white/10">
                {b.buttonLabel || "Explore"}
              </ButtonPrimary>
            </div>
            {/* Title visible before hover on desktop */}
            <p className="pointer-events-none absolute left-6 top-6 hidden text-[24px] font-bold text-white drop-shadow transition-opacity duration-400 group-hover/gb:opacity-0 md:left-12 md:top-10 md:block">
              {b.title}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/** Endless brand-quote ticker with inline watch images; reverse direction. */
export function QuoteTicker({ text, images }: { text: string; images: string[] }) {
  const unit = (k: number) => (
    <div className="flex shrink-0 items-center" key={k}>
      {images.slice(0, 2).map((src, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <Link
            href="/watches"
            className="mx-4 block h-[60px] w-[80px] shrink-0 overflow-hidden rounded-fuse-md bg-white md:mx-10 md:h-[150px] md:w-[204px] md:rounded-fuse"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={catalogThumbUrl(src, 420)} alt="" loading="lazy" className="h-full w-full object-contain p-2 transition-transform duration-700 hover:scale-110" />
          </Link>
          <p className="whitespace-nowrap font-chivo text-[44px] font-bold leading-[1.1] text-heading md:text-[110px] xl:text-[160px]">{text}</p>
        </span>
      ))}
    </div>
  );
  return (
    <Section className="marquee reveal-fade overflow-hidden py-8 md:py-12" aria-label={text}>
      <div className="marquee-track pause-on-hover" style={{ ["--speed" as string]: "70s", ["--direction" as string]: "reverse" }}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0" aria-hidden={k === 1}>
            {unit(k)}
          </div>
        ))}
      </div>
    </Section>
  );
}
