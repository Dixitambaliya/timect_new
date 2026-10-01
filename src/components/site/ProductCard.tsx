"use client";

import { displayPrice } from "@/lib/price";
import Link from "next/link";
import { useState } from "react";
import { cx } from "@/lib/cx";
import { catalogThumbUrl } from "@/lib/catalog-image";
import { Badge } from "@/components/fuse/buttons";
import { QuickViewIcon, Star } from "@/components/fuse/icons";
import { useSite } from "./SiteProvider";

/** Minimal product shape shared by catalog cards, homepage carousels and search. */
export type CardProduct = {
  id: number;
  slug: string;
  name?: string;
  title?: string;
  price: string;
  image?: string;
  hoverImage?: string;
  brand?: string;
  collection?: string;
  tag?: string;
  code?: string;
  gender?: string;
  rating?: number;
  isMainProduct?: boolean;
  description?: string;
};

export function productName(p: CardProduct): string {
  return p.name || p.title || [p.collection, p.description].filter(Boolean).join(" ") || "Timect watch";
}

export function productBrand(p: CardProduct): string {
  return p.brand || p.collection || "Timect";
}

function Labels({ product }: { product: CardProduct }) {
  const labels: { text: string; tone: "heading" | "base" | "primary" }[] = [];
  if (product.tag) labels.push({ text: product.tag, tone: "heading" });
  else if (product.isMainProduct) labels.push({ text: "Exclusive", tone: "primary" });
  if (!labels.length) return null;
  return (
    <div className="pointer-events-none absolute left-2 top-2 z-[2] flex flex-col items-start gap-1 md:left-4 md:top-4">
      {labels.map((l) => (
        <Badge key={l.text} tone={l.tone}>
          {l.text}
        </Badge>
      ))}
    </div>
  );
}

export function Rating({ value, className }: { value?: number; className?: string }) {
  const v = value ?? 4.5;
  return (
    <span className={cx("inline-flex items-center gap-1 text-[13px] font-semibold text-muted", className)}>
      <Star className="h-3.5 w-3.5 text-[#c9a04a]" />
      {v.toFixed(1)}
    </span>
  );
}

/**
 * Fuse product card: white 16px-radius tile, second-image rollover on hover,
 * glass quick-view bar sliding up, brand · title · price info block.
 */
export default function ProductCard({
  product,
  priority,
  className,
}: {
  product: CardProduct;
  priority?: boolean;
  className?: string;
}) {
  const { openQuickView } = useSite();
  const [hovered, setHovered] = useState(false);
  const name = productName(product);
  const url = `/product/${product.slug}`;
  const primary = catalogThumbUrl(product.image, 720);
  const hover = product.hoverImage && product.hoverImage !== product.image ? catalogThumbUrl(product.hoverImage, 720) : "";
  const [hoverSeen, setHoverSeen] = useState(false);

  return (
    <article
      className={cx("group/card relative flex h-full flex-col overflow-hidden rounded-fuse bg-white", className)}
      onMouseEnter={() => {
        setHovered(true);
        setHoverSeen(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <Link href={url} className="relative block aspect-[1/1.109] overflow-hidden" aria-label={name} tabIndex={-1}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primary}
            alt={name}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={cx(
              "img-fill object-contain p-4 transition-[opacity,transform] duration-[600ms] ease-fuse md:p-6",
              hover && hovered ? "opacity-0" : "opacity-100",
              hovered ? "scale-[1.03]" : "scale-100",
            )}
          />
          {hover && hoverSeen && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hover}
              alt=""
              decoding="async"
              className={cx(
                "img-fill object-contain p-4 transition-[opacity,transform] duration-[600ms] ease-fuse md:p-6",
                hovered ? "scale-[1.03] opacity-100" : "scale-100 opacity-0",
              )}
            />
          )}
        </Link>

        <Labels product={product} />

        {/* Desktop glass bar: Quick view + details — slides up on hover */}
        <div className="absolute inset-x-0 bottom-0 hidden justify-center px-4 pb-3 md:flex">
          <div className="glass flex translate-y-[calc(100%+16px)] gap-1 rounded-fuse bg-[#f0f2f452] p-1 opacity-0 transition-[transform,opacity] duration-400 ease-fuse-out group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:opacity-100">
            <button
              type="button"
              onClick={() => openQuickView(product.slug)}
              className="rounded-fuse-md border border-line bg-white px-8 py-3 text-[16px] font-semibold transition-colors duration-400 hover:bg-btn"
            >
              Quick view
            </button>
            <Link
              href={url}
              aria-label={`View ${name}`}
              className="flex w-[54px] items-center justify-center rounded-fuse-md border border-line bg-white transition-colors duration-400 hover:bg-btn"
            >
              <QuickViewIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* Touch: compact quick view always visible */}
        <div className="glass absolute bottom-2 right-2 rounded-fuse-md bg-[#f0f2f452] p-1 md:hidden">
          <button
            type="button"
            onClick={() => openQuickView(product.slug)}
            aria-label="Quick view"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white"
          >
            <QuickViewIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-4 pt-3 md:px-5 md:pb-5 md:pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[12px] font-bold uppercase tracking-[0.12em] text-muted">{productBrand(product)}</span>
          <Rating value={product.rating} />
        </div>
        <Link href={url} className="mt-2 line-clamp-2 text-[14px] font-medium leading-[1.4] md:text-[16px]">
          {name}
        </Link>
        {(product.code || product.gender) && (
          <p className="mt-1 text-[13px] text-muted">
            {[product.code && `Ref. ${product.code}`, product.gender].filter(Boolean).join(" · ")}
          </p>
        )}
        <p className="mt-auto pt-3 text-[16px] font-semibold text-ink md:pt-4 md:text-[20px]">{displayPrice(product.price)}</p>
      </div>
    </article>
  );
}

/** Horizontal mini card (search results, related products). */
export function ProductCardHorizontal({
  product,
  className,
  onNavigate,
}: {
  product: CardProduct;
  className?: string;
  onNavigate?: () => void;
}) {
  const { openQuickView } = useSite();
  const name = productName(product);
  return (
    <div className={cx("flex gap-2 rounded-fuse bg-[#ffffff99] p-2", className)}>
      <Link
        href={`/product/${product.slug}`}
        onClick={onNavigate}
        className="relative block aspect-square w-[110px] shrink-0 overflow-hidden rounded-fuse-md bg-white md:w-[140px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={catalogThumbUrl(product.image, 300)} alt={name} loading="lazy" className="img-fill object-contain p-2 transition-transform duration-700 hover:scale-105" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between rounded-fuse-md bg-white p-4">
        <div>
          <p className="truncate text-[12px] font-bold uppercase tracking-[0.12em] text-muted">{productBrand(product)}</p>
          <Link href={`/product/${product.slug}`} onClick={onNavigate} className="mt-1 line-clamp-2 text-[16px] leading-[1.35] hover:underline">
            {name}
          </Link>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="text-[16px] font-semibold">{displayPrice(product.price)}</span>
          <button
            type="button"
            onClick={() => openQuickView(product.slug)}
            aria-label={`Quick view ${name}`}
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-fuse-md bg-heading text-white transition-colors duration-400 hover:bg-secondary-hover"
          >
            <QuickViewIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-fuse bg-white" aria-hidden>
      <div className="aspect-[1/1.109] animate-pulse bg-placeholder/50" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-placeholder" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-placeholder" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-placeholder" />
      </div>
    </div>
  );
}
