"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Header from "@/components/Header";
import FloatingGiftField from "@/components/immersive/FloatingGiftField";
import GiftProductOverlay from "@/components/immersive/GiftProductOverlay";
import { signalPageReady } from "@/lib/page-ready";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import type { GiftSample } from "@/data/giftSamples";
import type { GiftProduct } from "@/components/immersive/InfiniteProductScroll";

type Props = {
  /** Static gift samples only — not loaded from the database. */
  products: GiftSample[];
};

const GIFT_NAV = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact" },
  { href: "/watches", label: "Catalog" },
] as const;

const COLOURS = [
  { id: "all", label: "All", swatch: "#f5f2ec", border: true },
  { id: "silver", label: "Silver", swatch: "#c5c8ce" },
  { id: "gold", label: "Gold", swatch: "#c4a574" },
  { id: "black", label: "Black", swatch: "#1a1a1a" },
  { id: "blue", label: "Blue", swatch: "#2c4a6e" },
  { id: "green", label: "Green", swatch: "#3d5c4a" },
  { id: "rose", label: "Rose", swatch: "#c48b7a" },
] as const;

/**
 * Corporate gifting — Omega “my gifts” style:
 * full-viewport light floating product field, sticky colour panel, no footer.
 */
export default function CorporateGiftingExperience({ products }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [colour, setColour] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const giftProducts = useMemo(() => {
    const toGift = (p: GiftSample): GiftProduct => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      title: p.title,
      price: p.price,
      image: p.image,
      hoverImage: p.hoverImage,
    });

    const base = products.filter((p) => p.image).map(toGift);

    if (colour === "all") return base;

    const keywords: Record<string, string[]> = {
      silver: ["silver", "steel", "graphite", "line", "studio"],
      gold: ["gold", "truton", "two-tone"],
      black: ["black", "noir", "graphite"],
      blue: ["blue", "azure", "heritage"],
      green: ["green", "forest"],
      rose: ["rose", "pink", "ladies"],
    };
    const keys = keywords[colour] || [];
    if (!keys.length) return base;
    const full = products.filter((p) => p.image);
    const filtered = full.filter((p) => {
      const t =
        `${p.name || ""} ${p.title || ""} ${p.collection || ""}`.toLowerCase();
      return keys.some((k) => t.includes(k));
    });
    return filtered.length ? filtered.map(toGift) : base;
  }, [products, colour]);

  const selectedProduct = useMemo(() => {
    if (selectedId == null) return null;
    return products.find((p) => p.id === selectedId) ?? null;
  }, [products, selectedId]);

  const handleProductSelect = useCallback((product: GiftProduct) => {
    setSelectedId(product.id);
    setOverlayOpen(true);
  }, []);

  const handleOverlayClose = useCallback(() => {
    setOverlayOpen(false);
    window.setTimeout(() => setSelectedId(null), 350);
  }, []);

  useEffect(() => {
    signalPageReady();
  }, []);

  // Lock page scroll — gift field is the only interaction surface
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const reduced = prefersReducedMotion();
      const header = root.querySelector("header");
      const field = root.querySelector(".cg-field-stage");
      const panel = root.querySelector(".cg-colour-panel");

      if (reduced) {
        gsap.set([header, field], { autoAlpha: 1, y: 0 });
        gsap.set(panel, { autoAlpha: 1, y: 0, xPercent: -50 });
        return;
      }

      gsap.set(header, { yPercent: -100, opacity: 0 });
      gsap.set(field, { autoAlpha: 0 });
      gsap.set(panel, { autoAlpha: 0, y: 24, xPercent: -50 });

      gsap
        .timeline({ defaults: { ease: EASE.out } })
        .to(header, { yPercent: 0, opacity: 1, duration: 0.8 })
        .to(field, { autoAlpha: 1, duration: 1.1, ease: EASE.expo }, "-=0.4")
        .to(panel, { autoAlpha: 1, y: 0, xPercent: -50, duration: 0.7 }, "-=0.5");
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="cg-page cg-gifts-omega">
      <Header links={[...GIFT_NAV]} variant="gift" />

      <main className="cg-gifts-main">
        <section
          className="cg-field-stage"
          data-header-theme="light"
          aria-label="Find your gift"
        >
          <div className="cg-field-logo" aria-hidden="true">
            <img
              src="https://res.cloudinary.com/dphscxzb4/image/upload/v1784048492/timect/timect_logo.png"
              alt=""
              className="cg-field-logo__img"
            />
          </div>

          <FloatingGiftField
            products={giftProducts}
            baseDuration={130}
            className="cg-field-main"
            onProductSelect={handleProductSelect}
            paused={overlayOpen}
          />
        </section>

        {/* Fixed to viewport bottom — stays visible while interacting */}
        <div
          className={`cg-colour-panel${overlayOpen ? " is-hidden" : ""}`}
          role="region"
          aria-label="Filter gifts"
          aria-hidden={overlayOpen}
        >
          <p className="cg-colour-panel__title tracked">Pick a colour</p>
          <div
            className="cg-colour-panel__swatches"
            role="listbox"
            aria-label="Colours"
          >
            {COLOURS.map((c) => (
              <div key={c.id} className="cg-swatch-wrap">
                <button
                  type="button"
                  role="option"
                  aria-selected={colour === c.id}
                  aria-label={c.label}
                  className={`cg-swatch cursor-pointer${colour === c.id ? " is-active" : ""}${
                    "border" in c && c.border ? " cg-swatch--bordered" : ""
                  }`}
                  style={{ background: c.swatch }}
                  onClick={() => setColour(c.id)}
                />
                <span role="tooltip" className="cg-swatch__tooltip">
                  {c.label}
                </span>
              </div>
            ))}
          </div>
          <div className="cg-colour-panel__meta">
            <Link href="/" className="cg-colour-panel__back cursor-pointer">
              ‹ Back
            </Link>
            <span className="cg-colour-panel__count">
              {giftProducts.length} products
            </span>
          </div>
        </div>

        <GiftProductOverlay
          product={selectedProduct}
          open={overlayOpen && !!selectedProduct}
          onClose={handleOverlayClose}
        />
      </main>
    </div>
  );
}
