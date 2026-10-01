"use client";

import { displayPrice } from "@/lib/price";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { Product, Specification, Variant } from "@/db/actions";
import { flattenSpecifications } from "@/lib/specifications";
import { catalogThumbUrl } from "@/lib/catalog-image";
import { cx } from "@/lib/cx";
import { Drawer } from "@/components/fuse/Overlay";
import { useCarousel } from "@/components/fuse/hooks";
import { SliderArrows } from "@/components/fuse/ui";
import { ArrowRight, Box, CloseIcon, Mail, Share, Shield, WhatsApp } from "@/components/fuse/icons";
import { ProductCardHorizontal, Rating, type CardProduct } from "@/components/site/ProductCard";
import { useSite, whatsappLink } from "@/components/site/SiteProvider";
import ProductGallery from "./ProductGallery";

const AVAILABILITY = "Available exclusively at corporate boutiques and e-commerce";

function InfoCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-fuse bg-white p-4 md:p-6", className)}>{children}</div>;
}

/** Renders one specification section (details / grid / text) Fuse-style. */
function SpecContent({ spec }: { spec: Specification }) {
  if (spec.type === "text") {
    return <p className="rte">{spec.content}</p>;
  }
  const rows = flattenSpecifications([spec]).rows;
  if (!rows.length) return <p className="text-muted">No details listed.</p>;
  return (
    <dl className="grid grid-cols-[minmax(110px,40%)_1fr] gap-x-4 gap-y-3 text-[16px]">
      {rows.map((r, i) => (
        <div key={`${r.label}-${i}`} className="contents">
          <dt className="text-muted">{r.label || "—"}</dt>
          <dd className="font-medium">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const SERVICE_PANELS: Record<string, ReactNode> = {
  "Delivery and returns": (
    <div className="rte">
      <p>
        Orders are typically processed within a few business days. We ship watches in secure packaging designed to protect
        the case, crystal, and bracelet or strap. You will receive tracking details once the package ships.
      </p>
      <h3>Returns</h3>
      <p>
        Unused Timect watches in original packaging may be eligible for return within the stated return window after
        delivery, subject to inspection. Contact customer care before returning any item so we can guide you through the
        process.
      </p>
      <p>
        See our <Link href="/terms">Terms &amp; Conditions</Link> for full details.
      </p>
    </div>
  ),
  "Care and warranty": (
    <div className="rte">
      <p>
        Wipe the case and crystal with a soft, dry cloth. Avoid strong chemicals, solvents, and prolonged exposure to
        extreme heat or magnets. Store the watch away from moisture when not worn.
      </p>
      <p>
        Timect watches include a limited manufacturer warranty covering defects in materials and workmanship under normal
        use. For service, email <a href="mailto:service@timect.com">service@timect.com</a> with your model details.
      </p>
    </div>
  ),
};

function RelatedCarousel({ products }: { products: CardProduct[] }) {
  const car = useCarousel({ loop: true });
  if (!products.length) return null;
  return (
    <InfoCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[20px] font-semibold md:text-[24px]">You may also like</h2>
        <SliderArrows carousel={car} small />
      </div>
      <ul ref={car.ref} className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-fuse">
        {products.map((p) => (
          <li key={p.id} className="w-full shrink-0 snap-start">
            <ProductCardHorizontal product={p} className="bg-bg" />
          </li>
        ))}
      </ul>
    </InfoCard>
  );
}

/**
 * Two-column Fuse product layout: stacked info cards (left) and a sticky
 * media gallery (right). Used by the product page and the homepage feature.
 */
export default function ProductMain({
  product,
  related = [],
  headingAs = "h1",
}: {
  product: Product;
  related?: CardProduct[];
  headingAs?: "h1" | "h2";
}) {
  const router = useRouter();
  const { whatsappNumber } = useSite();
  const sizes = product.sizes || [];
  const [size, setSize] = useState(sizes[1] || sizes[0] || "");
  const [panel, setPanel] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState(`/product/${product.slug}`);

  useEffect(() => {
    setPageUrl(`${window.location.origin}/product/${product.slug}`);
  }, [product.slug]);

  const title = product.title || product.name || "Timect watch";
  const brand = product.brand || product.collection || "Timect";
  const subtitle = product.subtitle || product.description || "";
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const specs = product.specifications?.length
    ? product.specifications
    : subtitle
      ? [{ title: "Description", type: "text", content: subtitle }]
      : [];
  const keySpecs = flattenSpecifications(product.specifications).rows.filter((r) => r.label && r.value).slice(0, 4);

  // Variants: current product is always part of the family.
  const variants: Variant[] = [...(product.variants || [])];
  if (!variants.some((v) => v.slug === product.slug || (v.image && v.image === product.image)) && product.slug) {
    variants.unshift({ id: "current", name: title, image: product.image || images[0] || "", slug: product.slug });
  }
  const selectedVariant = variants.find((v) => v.slug === product.slug || (v.image && v.image === product.image));

  const labels = [product.tag || (product.isMainProduct ? "Exclusive" : "")].filter(Boolean) as string[];
  const panels = [...specs.map((s) => s.title), ...Object.keys(SERVICE_PANELS)];
  const Heading = headingAs;

  const message = `Hi, I need help with ${title}${size ? ` (${size})` : ""}${subtitle ? ` — ${subtitle}` : ""} — ${displayPrice(product.price)}\n${pageUrl}`;

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title, url: pageUrl });
      else {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* dismissed */
    }
  };

  const panelBody = () => {
    if (!panel) return null;
    if (SERVICE_PANELS[panel]) return SERVICE_PANELS[panel];
    const spec = specs.find((s) => s.title === panel);
    return spec ? <SpecContent spec={spec} /> : null;
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-[480px_minmax(0,1fr)] lg:items-start">
      <div className="order-2 flex min-w-0 flex-col gap-3 lg:order-1">
        <InfoCard className="md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-[8px] border border-line px-3 py-1 text-[13px] font-bold uppercase tracking-[0.14em] text-muted">
              {brand}
            </span>
            <Rating value={product.rating} />
            {product.gender && <span className="text-[13px] font-semibold text-muted">{product.gender}</span>}
          </div>
          {headingAs === "h2" ? (
            <Link href={`/product/${product.slug}`} className="hover:underline">
              <Heading className="fuse-h4 mt-4">{title}</Heading>
            </Link>
          ) : (
            <Heading className="fuse-h4 mt-4">{title}</Heading>
          )}
          {subtitle && <p className="mt-3 text-[16px] leading-[1.5] text-muted">{subtitle}</p>}
          {product.code && <p className="mt-2 text-[14px] text-muted">Ref. {product.code}</p>}
          <div className="mt-6 border-t border-line-soft pt-6">
            <p className="text-[28px] font-semibold text-ink">{displayPrice(product.price)}</p>
            <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">
              {product.priceSubtext || "Recommended Retail Price"}
            </p>
          </div>
        </InfoCard>

        {sizes.length > 0 && (
          <InfoCard>
            <p className="mb-4 font-semibold">
              Case size: <span className="font-normal text-muted">{size}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button key={s} type="button" onClick={() => setSize(s)} aria-pressed={size === s} className={cx("pill min-w-[84px]", size === s && "is-active")}>
                  {s}
                </button>
              ))}
            </div>
          </InfoCard>
        )}

        {variants.length > 1 && (
          <InfoCard>
            <p className="mb-4 font-semibold">
              Available in {variants.length} variations
              {selectedVariant && <span className="font-normal text-muted"> · {selectedVariant.name}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const active = v === selectedVariant;
                return (
                  <button
                    key={v.id || v.slug}
                    type="button"
                    title={v.name}
                    aria-label={`Select ${v.name}`}
                    aria-pressed={active}
                    disabled={!v.slug}
                    onMouseEnter={() => v.slug && router.prefetch(`/product/${v.slug}`)}
                    onClick={() => v.slug && !active && router.push(`/product/${v.slug}`, { scroll: false })}
                    className={cx(
                      "relative h-[72px] w-[64px] overflow-hidden rounded-fuse-md bg-bg p-[3px] transition-[box-shadow] duration-400",
                      active ? "shadow-[0_0_0_1px_#000]" : "shadow-[0_0_0_1px_transparent] hover:shadow-[0_0_0_1px_#8c8c8c]",
                      !v.slug && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <span className="relative block h-full w-full overflow-hidden rounded-[10px] bg-white">
                      {v.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={catalogThumbUrl(v.image, 160)} alt={v.name} className="img-fill object-contain p-1" />
                      ) : (
                        <span className="flex h-full items-center justify-center p-1 text-center text-[10px] text-muted">{v.name}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </InfoCard>
        )}

        <InfoCard>
          <div className="flex flex-col gap-2">
            <a
              href={whatsappLink(whatsappNumber, message)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-fuse bg-whatsapp px-6 py-[18px] text-[16px] font-semibold text-white transition-[filter] duration-400 hover:brightness-95"
            >
              <WhatsApp /> Ask on WhatsApp
            </a>
            <Link
              href={`/contact?product=${encodeURIComponent(product.slug)}`}
              className="flex items-center justify-center gap-2.5 rounded-fuse border border-line bg-btn px-6 py-[17px] font-semibold transition-colors duration-400 hover:border-line-hover hover:bg-white"
            >
              <Mail className="h-5 w-5" /> Enquire by email
            </Link>
          </div>
          <p className="mt-4 text-center text-[14px] text-muted">{AVAILABILITY}</p>
        </InfoCard>

        {keySpecs.length > 0 && (
          <InfoCard>
            <ul className="grid grid-cols-2 gap-2">
              {keySpecs.map((r) => (
                <li key={`${r.label}-${r.value}`} className="rounded-fuse-md bg-bg px-4 py-3">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">{r.label}</p>
                  <p className="mt-1 line-clamp-2 text-[15px] font-semibold">{r.value}</p>
                </li>
              ))}
            </ul>
          </InfoCard>
        )}

        <InfoCard>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-muted" /> Manufacturer warranty on materials and workmanship
            </li>
            <li className="flex items-center gap-3">
              <Box className="h-6 w-6 text-muted" /> Shipped in secure, protective packaging
            </li>
          </ul>
        </InfoCard>

        {panels.length > 0 && (
          <InfoCard>
            <ul className="flex flex-col gap-2">
              {panels.map((k) => (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => setPanel(k)}
                    className="group/d flex w-full items-center justify-between rounded-fuse border border-line px-6 py-4 text-start font-semibold transition-colors duration-400 hover:border-line-hover"
                  >
                    {k}
                    <ArrowRight className="h-5 w-5 transition-transform duration-400 group-hover/d:translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
          </InfoCard>
        )}

        <InfoCard>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted">Share:</span>
            <button type="button" onClick={share} className="icon-btn relative h-16 w-16 bg-white" aria-label="Share">
              <Share className="h-5 w-5" />
              {copied && (
                <span className="absolute -top-9 animate-fade-in whitespace-nowrap rounded-[6px] bg-ink px-2 py-1 text-[12px] text-white">
                  Link copied!
                </span>
              )}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${pageUrl}`)}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp" className="icon-btn h-16 w-16 bg-white">
              <WhatsApp />
            </a>
            <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(pageUrl)}`} aria-label="Share by email" className="icon-btn h-16 w-16 bg-white">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </InfoCard>

        <RelatedCarousel products={related.filter((p) => p.slug !== product.slug)} />
      </div>

      <div className="order-1 lg:sticky lg:top-4 lg:order-2">
        <ProductGallery key={product.id} images={images} title={title} labels={labels} />
      </div>

      <Drawer open={!!panel} onClose={() => setPanel(null)} side="right" label={panel || "Details"} width="md:w-[600px]">
        <div className="flex items-center justify-between p-4 md:p-6">
          <h2 className="fuse-h5">{panel}</h2>
          <button type="button" onClick={() => setPanel(null)} aria-label="Close" className="icon-btn bg-white">
            <CloseIcon />
          </button>
        </div>
        <div className="mx-2 mb-2 flex-1 overflow-y-auto rounded-fuse bg-white p-6 md:mx-4 md:mb-4">{panelBody()}</div>
      </Drawer>
    </div>
  );
}
