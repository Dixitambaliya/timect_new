"use client";

import { useState } from "react";
import type { ProductInput } from "@/admin/lib/product-mapper";
import { flattenSpecifications } from "@/lib/specifications";
import { catalogThumbUrl } from "@/lib/catalog-image";
import { displayPrice, formatPrice, calculateDiscount, isNumericPrice } from "@/lib/price";

/**
 * Storefront preview that mirrors the Fuse product page: stacked white info
 * cards on a #F0F2F4 canvas next to the media gallery. Always rendered in the
 * storefront (light) palette, independent of the admin theme.
 */
export default function ProductPreview({ data }: { data: ProductInput }) {
  const title = data.title || data.name || "Untitled product";
  const images = (data.images?.length ? data.images : data.image ? [data.image] : []).filter(Boolean);
  const [active, setActive] = useState(0);
  const main = images[Math.min(active, images.length - 1)] || "";
  const specs = data.specifications || [];
  const sizes = data.sizes || [];
  const variants = data.variants || [];
  const brand = data.brand || data.collection || "Timect";
  const originalPriceStr = data.originalPrice || data.priceSubtext;
  const discount = originalPriceStr && isNumericPrice(originalPriceStr) ? calculateDiscount(data.price, originalPriceStr) : 0;
  const flags = [
    data.isMainProduct && "Main product",
    data.isNewArrival && "New arrival",
    data.isRecommended && "Recommended",
    data.isRelated && "Related",
  ].filter(Boolean) as string[];

  return (
    <div className="overflow-hidden rounded-fuse bg-[#f0f2f4] text-black">
      <div className="flex items-center justify-between px-4 py-3 text-[12px] font-semibold text-[#5a5a5a]">
        <span>Storefront preview</span>
        <span className="font-mono">/product/{data.slug || "…"}</span>
      </div>

      <div className="grid gap-2 p-2 pt-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-2">
          <div className="rounded-fuse bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[8px] border border-[#cacaca] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5a5a5a]">
                {brand}
              </span>
              {data.tag && <span className="rounded-[6px] bg-[#343d50] px-1.5 py-0.5 text-[11px] font-bold uppercase text-white">{data.tag}</span>}
              {data.gender && <span className="text-[12px] font-semibold text-[#5a5a5a]">{data.gender}</span>}
            </div>
            <h1 className="mt-3 text-[22px] font-bold leading-tight text-[#343d50]">{title}</h1>
            {data.subtitle && <p className="mt-2 text-[14px] text-[#5a5a5a]">{data.subtitle}</p>}
            {data.code && <p className="mt-1 text-[13px] text-[#5a5a5a]">Ref. {data.code}</p>}
            <div className="mt-4 border-t border-[#d4d4d4] pt-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="text-[22px] font-semibold">{data.price ? displayPrice(data.price) : "-"}</p>
                {discount > 0 && originalPriceStr && (
                  <>
                    <span className="text-[14px] text-[#5a5a5a] line-through">{formatPrice(originalPriceStr)}</span>
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
              {originalPriceStr && !isNumericPrice(originalPriceStr) ? (
                <p className="mt-0.5 text-[12px] text-[#5a5a5a]">{originalPriceStr}</p>
              ) : (
                <p className="mt-0.5 text-[11px] text-[#5a5a5a]">Inclusive of all taxes </p>
              )}
            </div>
          </div>

          {sizes.length > 0 && (
            <div className="rounded-fuse bg-white p-5">
              <p className="mb-3 text-[14px] font-semibold">Case size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s, i) => (
                  <span
                    key={s}
                    className={`rounded-fuse border px-3 py-2 text-[14px] font-semibold ${i === (sizes.length > 1 ? 1 : 0) ? "border-[#7c92b7] bg-[#dfe9f9]" : "border-[#cacaca]"
                      }`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {variants.length > 0 && (
            <div className="rounded-fuse bg-white p-5">
              <p className="mb-3 text-[14px] font-semibold">Available in {variants.length + 1} variations</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <span key={v.id} title={v.name} className="relative h-14 w-12 overflow-hidden rounded-[10px] bg-[#f0f2f4] p-[2px]">
                    {v.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={catalogThumbUrl(v.image, 120)} alt="" className="h-full w-full rounded-[8px] bg-white object-contain" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[9px]">{v.name}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-fuse bg-white p-3">
            <div className="rounded-fuse bg-[#128c7e] py-3.5 text-center text-[14px] font-semibold text-white">Ask on WhatsApp</div>
          </div>

          {(data.description?.trim() || specs.length > 0) && (
            <div className="rounded-fuse bg-white p-3">
              {data.description?.trim() && (
                <details className="group mb-2 rounded-fuse border border-[#cacaca] px-4 py-3" open={!specs.length}>
                  <summary className="cursor-pointer list-none text-[14px] font-semibold">Description</summary>
                  <p className="mt-3 text-[13px] leading-relaxed text-[#2b2f38] whitespace-pre-line">{data.description}</p>
                </details>
              )}
              {specs.map((spec, i) => {
                const rows = spec.type === "text" ? [] : flattenSpecifications([spec]).rows;
                return (
                  <details key={i} className="group mb-2 rounded-fuse border border-[#cacaca] px-4 py-3 last:mb-0" open={i === 0}>
                    <summary className="cursor-pointer list-none text-[14px] font-semibold">{spec.title || "Untitled section"}</summary>
                    <div className="mt-3 text-[13px]">
                      {spec.type === "text" ? (
                        <p className="text-[#2b2f38]">{spec.content}</p>
                      ) : (
                        <dl className="grid grid-cols-[40%_1fr] gap-x-3 gap-y-1.5">
                          {rows.map((r, j) => (
                            <div key={j} className="contents">
                              <dt className="text-[#5a5a5a]">{r.label || "-"}</dt>
                              <dd className="font-medium">{r.value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-2 rounded-fuse bg-white p-3 lg:sticky lg:top-0 lg:self-start">
          <div className="relative aspect-square flex-1 overflow-hidden rounded-[12px]">
            {main ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={catalogThumbUrl(main, 900)} alt={title} className="absolute inset-0 h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#dbe0e5] text-[13px] text-[#5a5a5a]">No image yet</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex w-14 flex-col gap-2">
              {images.slice(0, 6).map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative aspect-square overflow-hidden rounded-[10px] border ${i === active ? "border-[#7c92b7]" : "border-transparent opacity-80"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={catalogThumbUrl(img, 120)} alt="" className="absolute inset-0 h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {flags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-4 text-[11px] font-bold uppercase tracking-wide">
          <span className="py-1 text-[#5a5a5a]">Shown in:</span>
          {flags.map((f) => (
            <span key={f} className="rounded-[6px] bg-[#dfe9f9] px-2 py-1 text-[#343d50]">
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
