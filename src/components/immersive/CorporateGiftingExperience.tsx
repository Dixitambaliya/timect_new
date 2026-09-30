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
  const [apiProducts, setApiProducts] = useState<GiftSample[]>(products);
  const [loading, setLoading] = useState(false);

  // Fetch corporate gifting products from API when colour swatch changes
  useEffect(() => {
    if (colour === "all") {
      setApiProducts(products);
      return;
    }

    let active = true;
    setLoading(true);

    fetch(`/api/corporate-gifting?colour=${encodeURIComponent(colour)}`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success && Array.isArray(data.products)) {
          setApiProducts(data.products);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch /api/corporate-gifting:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [colour, products]);

  const giftProducts = useMemo(() => {
    const source = apiProducts.length ? apiProducts : products;
    return source
      .filter((p) => p.image)
      .map((p): GiftProduct => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        title: p.title,
        price: p.price,
        image: p.image,
        hoverImage: p.hoverImage,
      }));
  }, [apiProducts, products]);

  const selectedProduct = useMemo(() => {
    if (selectedId == null) return null;
    const source = apiProducts.length ? apiProducts : products;
    return source.find((p) => p.id === selectedId) ?? null;
  }, [apiProducts, products, selectedId]);

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
