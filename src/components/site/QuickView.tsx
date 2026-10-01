"use client";

import { displayPrice } from "@/lib/price";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductBySlug, type Product } from "@/db/actions";
import { cx } from "@/lib/cx";
import { catalogThumbUrl } from "@/lib/catalog-image";
import { Modal, CloseButton } from "@/components/fuse/Overlay";
import { ButtonPrimary } from "@/components/fuse/buttons";
import { Spinner, WhatsApp } from "@/components/fuse/icons";
import { productBrand, productName, Rating } from "./ProductCard";
import { useSite, whatsappLink } from "./SiteProvider";

const cache = new Map<string, Product | null>();

export default function QuickView() {
  const { quickView, closeQuickView, whatsappNumber } = useSite();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(0);
  const [size, setSize] = useState("");

  useEffect(() => {
    if (!quickView) return;
    setImage(0);
    if (cache.has(quickView)) {
      const p = cache.get(quickView) ?? null;
      setProduct(p);
      setSize(p?.sizes?.[0] || "");
      return;
    }
    let active = true;
    setLoading(true);
    setProduct(null);
    getProductBySlug(quickView)
      .then((p) => {
        cache.set(quickView, p);
        if (active) {
          setProduct(p);
          setSize(p?.sizes?.[0] || "");
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [quickView]);

  const images = product
    ? (product.images?.length ? product.images : product.image ? [product.image] : []).filter(Boolean)
    : [];
  const name = product ? product.title || productName(product) : "";

  return (
    <Modal open={!!quickView} onClose={closeQuickView} label="Quick view" className="max-w-[1100px]">
      <CloseButton onClick={closeQuickView} className="absolute right-3 top-3 z-10 md:right-4 md:top-4" />
      {loading || !product ? (
        <div className="flex h-[60vh] items-center justify-center">
          {loading ? <Spinner className="h-8 w-8 text-heading" /> : <p className="text-muted">This watch is no longer available.</p>}
        </div>
      ) : (
        <div className="grid max-h-[calc(100vh-48px)] gap-2 overflow-y-auto p-2 md:grid-cols-2 md:gap-3 md:p-4">
          <div className="flex flex-col gap-2 rounded-fuse bg-white p-2 md:p-4">
            <div className="relative aspect-square overflow-hidden rounded-fuse-md">
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${src}-${i}`}
                  src={catalogThumbUrl(src, 1000)}
                  alt={i === 0 ? name : ""}
                  className={cx(
                    "img-fill object-contain transition-opacity duration-400",
                    i === image ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
            </div>
            {images.length > 1 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={`${src}-t${i}`}
                    type="button"
                    onClick={() => setImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={cx(
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-fuse-sm border transition-colors",
                      i === image ? "border-accent-border" : "border-transparent opacity-80 hover:opacity-100",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={catalogThumbUrl(src, 160)} alt="" className="img-fill object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="rounded-fuse bg-white p-5 md:p-8">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted">{productBrand(product)}</span>
                <Rating value={product.rating} />
              </div>
              <h2 className="fuse-h5 mt-3 md:!text-[28px]">{name}</h2>
              {(product.subtitle || product.description) && (
                <p className="mt-3 line-clamp-3 text-muted">{product.subtitle || product.description}</p>
              )}
              <p className="mt-6 text-[24px] font-semibold">{displayPrice(product.price)}</p>
              {product.priceSubtext && <p className="mt-1 text-[13px] text-muted">{product.priceSubtext}</p>}
            </div>

            {!!product.sizes?.length && (
              <div className="rounded-fuse bg-white p-5 md:p-6">
                <p className="mb-3 font-semibold">
                  Case size: <span className="font-normal text-muted">{size}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button key={s} type="button" onClick={() => setSize(s)} className={cx("pill", size === s && "is-active")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 rounded-fuse bg-white p-3 md:p-4">
              <a
                href={whatsappLink(
                  whatsappNumber,
                  `Hi, I need help with ${name}${size ? ` (${size})` : ""} — ${displayPrice(product.price)}\n${typeof window !== "undefined" ? window.location.origin : ""}/product/${product.slug}`,
                )}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-fuse bg-whatsapp px-6 py-[17px] font-semibold text-white transition-[filter] duration-400 hover:brightness-95"
              >
                <WhatsApp /> Ask on WhatsApp
              </a>
              <ButtonPrimary href={`/product/${product.slug}`} className="w-full" bg="#f0f2f4" onClick={closeQuickView}>
                View full details
              </ButtonPrimary>
            </div>
            <Link href="/contact" onClick={closeQuickView} className="link-underline self-center text-[14px] font-semibold text-muted">
              Prefer email? Contact our concierge
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
