import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductView from "@/components/product/ProductView";
import { getProductById, getProductBySlug, type Product } from "@/db/actions";
import { cld } from "@/lib/cloudinary";
import { SITE_NAME, SITE_URL, jsonLdScript, priceToNumber } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

/** One lookup per request, shared by metadata and the page. */
const loadProduct = cache(async (slug: string): Promise<Product | null> => {
  if (/^\d+$/.test(slug)) return getProductById(parseInt(slug, 10));
  return getProductBySlug(slug);
});

function describe(p: Product) {
  const general = p.specifications?.find((s) => s.type === "text" && /general/i.test(s.title))?.content;
  return (p.description || p.subtitle || general || `${p.title || p.name} by ${SITE_NAME}.`).slice(0, 200);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Watch not found", robots: { index: false } };
  const name = product.title || product.name || "Timect watch";
  const image = product.image || product.images?.[0];
  return {
    title: name,
    description: describe(product),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: name,
      description: describe(product),
      url: `/product/${product.slug}`,
      images: image ? [{ url: cld(image, { w: 1200 }), alt: name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();
  // Legacy numeric URLs resolve to the canonical slug.
  if (product.slug && product.slug !== slug) permanentRedirect(`/product/${product.slug}`);

  const name = product.title || product.name || "Timect watch";
  const price = priceToNumber(product.price);
  const images = (product.images?.length ? product.images : [product.image]).filter(Boolean) as string[];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: describe(product),
    image: images.map((i) => cld(i, { w: 1200 })),
    sku: product.code || undefined,
    brand: { "@type": "Brand", name: product.brand && product.brand !== "Exclusive" ? product.brand : SITE_NAME },
    url: `${SITE_URL}/product/${product.slug}`,
    offers: price
      ? {
          "@type": "Offer",
          priceCurrency: "INR",
          price,
          url: `${SITE_URL}/product/${product.slug}`,
        }
      : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <ProductView initialProduct={product} />
    </>
  );
}
