"use client";

import { useState } from "react";
import LuxImage from "@/components/ui/LuxImage";

interface ProductVariant {
  id: string;
  image: string;
  name: string;
  slug?: string;
}

interface ProductInfoProps {
  brand: string;
  title: string;
  subtitle: string;
  sizes: string[];
  price: string;
  priceSubtext: string;
  variants: ProductVariant[];
  selectedVariantId: string;
  onVariantSelect: (id: string) => void;
}

/** Static copy shared across all product variants — always visible, never gated on load. */
const SHARED_AVAILABILITY = "Available Exclusively at Corporate Boutiques and e-commerce";

/** Purchase panel. Remount per product (key) so the size selection resets cleanly. */
export default function ProductInfo({
  brand,
  title,
  subtitle,
  sizes,
  price,
  priceSubtext,
  variants,
  selectedVariantId,
  onVariantSelect,
}: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState(sizes[1] || sizes[0] || "");

  const handleWhatsAppClick = () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const sizeNote = selectedSize ? ` — ${selectedSize}` : "";
    const msg = `Hi, I need help with ${title}${subtitle ? ` (${subtitle})` : ""}${sizeNote} — ${price}\n${pageUrl}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  return (
    <div className="flex flex-col">
      <p className="eyebrow text-[var(--champagne)]">{brand}</p>
      <h1 className="display text-[2.4rem] md:text-[3rem] leading-[1.02] mt-5">{title}</h1>
      {subtitle ? <p className="mt-4 text-[0.92rem] font-light leading-relaxed text-[var(--muted)]">{subtitle}</p> : null}

      <div className="mt-10 pt-8 border-t border-[var(--line)]">
        <p className="text-[1.35rem] tracking-[0.03em]">{price}</p>
        <p className="mt-2 text-[0.75rem] font-light leading-relaxed text-[var(--muted)] max-w-sm">
          {priceSubtext || "Recommended Retail Price"}
        </p>
      </div>

      {sizes.length > 0 && (
        <fieldset className="mt-10">
          <legend className="eyebrow text-[0.62rem] text-[var(--muted)] mb-4">Case size</legend>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((size) => {
              const active = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[5.5rem] h-11 px-4 border text-[0.8rem] tracking-[0.12em] transition-colors duration-500 ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                      : "border-[var(--line)] hover:border-[var(--ink)]"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {variants.length > 0 && (
        <fieldset className="mt-10">
          <legend className="eyebrow text-[0.62rem] text-[var(--muted)] mb-4">
            {variants.length} {variants.length === 1 ? "variation" : "variations"}
            {selectedVariant?.name ? <span className="text-[var(--ink)]"> — {selectedVariant.name}</span> : null}
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {variants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => onVariantSelect(variant.id)}
                  title={variant.name}
                  aria-label={`Select ${variant.name}`}
                  aria-pressed={isSelected}
                  className={`relative w-14 h-[4.25rem] bg-[#ebe6dc] overflow-hidden transition-[box-shadow,opacity] duration-500 ${
                    isSelected
                      ? "shadow-[0_0_0_1px_var(--ink)]"
                      : "opacity-75 hover:opacity-100 hover:shadow-[0_0_0_1px_var(--line)]"
                  }`}
                >
                  {variant.image ? (
                    <LuxImage
                      src={variant.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover blend-multiply pointer-events-none"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-[var(--muted)] p-1 text-center">
                      {variant.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Actions — always rendered so the CTA never “buffers” away */}
      <div className="mt-12 flex flex-col gap-4">
        <button type="button" onClick={handleWhatsAppClick} className="lux-btn lux-btn--solid w-full">
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Enquire on WhatsApp
        </button>
        <p className="text-[0.75rem] font-light text-[var(--muted)] text-center">{SHARED_AVAILABILITY}</p>
      </div>
    </div>
  );
}
