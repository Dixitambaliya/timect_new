"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductAccordion from "@/components/product/ProductAccordion";
import RelatedProducts from "@/components/product/RelatedProducts";
import Reveal from "@/components/motion/Reveal";
import { getProductBySlug, getProductSlugByImage, type Product, type Specification, type Variant } from "@/db/actions";
import { signalPageReady } from "@/lib/page-ready";
import { displayCase } from "@/lib/product-display";

/** Already-fetched variants, so switching paints instantly. */
const productCache = new Map<string, Product>();

async function resolveVariants(variants: Variant[] | undefined): Promise<Variant[]> {
  if (!variants?.length) return [];
  return Promise.all(
    variants.map(async (v) => {
      if (v.slug) return v;
      const slug = await getProductSlugByImage(v.image);
      return { ...v, slug: slug || undefined };
    }),
  );
}

type Fact = { label: string; value: string };

const FACT_RULES: { label: string; match: RegExp }[] = [
  { label: "Case", match: /^(dimension|diameter|case size)$/i },
  { label: "Movement", match: /^movement type$/i },
  { label: "Water resistance", match: /^water resistance$/i },
  { label: "Crystal", match: /^(glass|crystal)$/i },
  { label: "Power reserve", match: /^power reserve$/i },
  { label: "Dial", match: /^dial colou?r$/i },
  { label: "Material", match: /^material$/i },
];

/** Pull a handful of headline facts from the flexible specification JSON (never invented). */
function keyFacts(specs: Specification[] | undefined): Fact[] {
  const pairs: Fact[] = [];
  for (const section of specs || []) {
    for (const item of section.items || []) {
      if (typeof item === "string") {
        const idx = item.indexOf(": ");
        if (idx > 0) pairs.push({ label: item.slice(0, idx), value: item.slice(idx + 2) });
      } else if (item && typeof item === "object" && item.label && item.value) {
        pairs.push({ label: String(item.label), value: String(item.value) });
      }
    }
  }
  const facts: Fact[] = [];
  for (const rule of FACT_RULES) {
    const hit = pairs.find((p) => rule.match.test(p.label.trim()));
    if (hit) facts.push({ label: rule.label, value: hit.value.split(/,|;/)[0].trim() });
    if (facts.length === 4) break;
  }
  return facts;
}

function philosophy(p: Product): string | null {
  const general = p.specifications?.find((s) => s.type === "text" && /general/i.test(s.title))?.content;
  return p.description || general || null;
}

function accordionItems(p: Product) {
  const specs: Specification[] = p.specifications?.length
    ? p.specifications
    : [{ title: "Description", type: "text", content: p.description || p.subtitle || "No additional description available." }];

  return specs.map((spec) => {
    let content: React.ReactNode;
    if ((spec.type === "details" || spec.type === "grid") && spec.items) {
      const rows = spec.items
        .map((item) => {
          if (typeof item === "string") {
            const idx = item.indexOf(": ");
            return idx > 0 ? { label: item.slice(0, idx), value: item.slice(idx + 2) } : { label: "", value: item };
          }
          return item && typeof item === "object" ? { label: String(item.label ?? ""), value: String(item.value ?? "") } : null;
        })
        .filter(Boolean) as Fact[];
      content = (
        <dl className="divide-y divide-[var(--line)]">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-x-8 gap-y-1 py-3.5">
              {r.label && <dt className="eyebrow text-[0.62rem] text-[var(--muted)] pt-1">{r.label}</dt>}
              <dd className={`text-[0.95rem] font-light leading-relaxed ${r.label ? "" : "sm:col-span-2"}`}>{r.value}</dd>
            </div>
          ))}
        </dl>
      );
    } else {
      content = <p className="text-[0.95rem] font-light leading-[1.8] max-w-[44rem]">{spec.content}</p>;
    }
    return { title: spec.title, content };
  });
}

export default function ProductView({ initialProduct }: { initialProduct: Product }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<Product | null>(null);
  const [resolved, setResolved] = useState<{ slug: string; variants: Variant[] } | null>(null);

  // While a variant navigation is in flight, paint the cached variant if we have it.
  const product = pending && optimistic ? optimistic : initialProduct;

  useEffect(() => {
    productCache.set(initialProduct.slug, initialProduct);
    signalPageReady();
  }, [initialProduct]);

  useEffect(() => {
    let cancelled = false;
    resolveVariants(initialProduct.variants).then((variants) => {
      if (cancelled) return;
      setResolved({ slug: initialProduct.slug, variants });
      // Warm sibling variants for instant switching.
      variants
        .map((v) => v.slug)
        .filter((s): s is string => !!s && s !== initialProduct.slug && !productCache.has(s))
        .forEach((s) => {
          getProductBySlug(s)
            .then((sibling) => sibling && productCache.set(s, sibling))
            .catch(() => undefined);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [initialProduct]);

  const variants = useMemo(() => {
    const list = resolved?.slug === product.slug ? [...resolved.variants] : [...(product.variants || [])];
    const hasCurrent = list.some((v) => v.slug === product.slug || v.image === product.image);
    if (!hasCurrent && product.slug) {
      list.unshift({ id: "current", name: product.title || product.name || "Current", image: product.image || product.images?.[0] || "", slug: product.slug });
    }
    return list;
  }, [product, resolved]);

  const selectedVariantId = variants.find((v) => v.slug === product.slug || v.image === product.image)?.id || "";

  const onVariantSelect = (id: string) => {
    const v = variants.find((x) => x.id === id);
    if (!v?.slug || v.slug === product.slug) return;
    setOptimistic(productCache.get(v.slug) ?? null);
    startTransition(() => router.push(`/product/${v.slug}`, { scroll: false }));
  };

  const title = displayCase(product.title || product.name || "Timect watch");
  const facts = keyFacts(product.specifications);
  const statement = philosophy(product);
  const images = (product.images?.length ? product.images : [product.image]).filter(Boolean) as string[];

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <Header />
      <main>
        <section className="lux-container pt-6 md:pt-10 pb-20 md:pb-32">
          <nav aria-label="Breadcrumb" className="eyebrow text-[0.6rem] text-[var(--muted)] mb-8 md:mb-12">
            <ol className="flex flex-wrap items-center gap-3">
              <li>
                <Link href="/" className="hover:text-[var(--ink)] transition-colors">Home</Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/watches" className="hover:text-[var(--ink)] transition-colors">Watches</Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-[var(--ink)] truncate max-w-[16rem]">{title}</li>
            </ol>
          </nav>

          <div
            className={`grid grid-cols-12 gap-x-4 md:gap-x-8 gap-y-12 transition-opacity duration-300 ${pending && !optimistic ? "opacity-70" : "opacity-100"}`}
          >
            <div className="col-span-12 lg:col-span-7">
              <ProductGallery key={product.slug} images={images} alt={title} />
            </div>
            <div className="col-span-12 lg:col-span-5 xl:col-span-4 xl:col-start-9">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
                <ProductInfo
                  key={product.slug}
                  brand={product.collection || (product.brand && product.brand !== "Exclusive" ? product.brand : "Timect")}
                  title={title}
                  subtitle={product.subtitle || product.code || ""}
                  sizes={product.sizes || []}
                  price={product.price}
                  priceSubtext={product.priceSubtext || "Recommended Retail Price"}
                  variants={variants}
                  selectedVariantId={selectedVariantId}
                  onVariantSelect={onVariantSelect}
                />
              </div>
            </div>
          </div>
        </section>

        {statement && (
          <section className="bg-[var(--ivory)] py-24 md:py-36">
            <div className="lux-container">
              <Reveal as="p" className="eyebrow text-[var(--champagne)]">
                The Philosophy
              </Reveal>
              <Reveal as="p" delay={80} className="display display-md mt-8 max-w-[26ch]">
                {statement}
              </Reveal>
            </div>
          </section>
        )}

        {facts.length > 0 && (
          <section aria-label="Key details" className="border-b border-[var(--line)]">
            <div className="lux-container grid grid-cols-2 lg:grid-cols-4">
              {facts.map((f, i) => (
                <Reveal
                  key={f.label}
                  delay={i * 80}
                  className={`py-12 md:py-16 pr-6 ${i % 2 === 1 ? "pl-6 border-l border-[var(--line)]" : ""} ${
                    i > 0 ? "lg:pl-8 lg:border-l lg:border-[var(--line)]" : ""
                  } ${i > 1 ? "border-t lg:border-t-0 border-[var(--line)]" : ""}`}
                >
                  <p className="eyebrow text-[0.6rem] text-[var(--muted)]">{f.label}</p>
                  <p className="display text-[1.5rem] md:text-[2rem] leading-tight mt-4">{f.value}</p>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="specs-title" className="lux-container py-24 md:py-32 grid grid-cols-12 gap-x-4 md:gap-x-8 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="eyebrow text-[var(--champagne)]">Specifications</p>
            <h2 id="specs-title" className="display display-md mt-6">
              In <em>detail.</em>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <ProductAccordion key={product.slug} items={accordionItems(product)} />
          </div>
        </section>

        <RelatedProducts excludeSlug={product.slug} />
      </main>
      <Footer />
    </div>
  );
}
