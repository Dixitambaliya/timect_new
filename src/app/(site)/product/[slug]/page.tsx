import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getNewArrivals,
  getProductById,
  getProductBySlug,
  getRecommended,
  getRelatedProducts,
  type Product,
} from "@/db/actions";
import { Breadcrumbs } from "@/components/fuse/buttons";
import ProductMain from "@/components/product/ProductMain";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import { resolveVariants, toCard } from "@/lib/product-view";
import { createPageMetadata } from "@/lib/seo/metadata";
import { productName, productSchemas, productSeoDescription } from "@/lib/seo/product-seo";
import { JsonLd } from "@/lib/seo/structured-data";

type Params = { params: Promise<{ slug: string }> };

async function loadProduct(slug: string): Promise<Product | null> {
  if (/^\d+$/.test(slug)) {
    const byId = await getProductById(Number(slug));
    if (byId?.slug && byId.slug !== slug) permanentRedirect(`/product/${byId.slug}`);
    return byId;
  }
  return getProductBySlug(decodeURIComponent(slug));
}

/** Products flagged "related"; falls back to recommended + new arrivals. */
async function relatedFor(product: Product): Promise<Product[]> {
  let pool = await getRelatedProducts();
  if (pool.length < 4) {
    const [rec, fresh] = await Promise.all([getRecommended(), getNewArrivals()]);
    pool = [...pool, ...rec, ...fresh];
  }
  const seen = new Set<number>([product.id]);
  return pool.filter((p) => !seen.has(p.id) && seen.add(p.id));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = /^\d+$/.test(slug) ? await getProductById(Number(slug)) : await getProductBySlug(decodeURIComponent(slug));
  if (!product) return createPageMetadata({ title: "Watch not found", description: "The requested TIMECT watch could not be found.", path: `/product/${slug}`, noIndex: true });
  const name = productName(product);
  const title = product.collection ? `${name} - ${product.collection}` : name;
  const description = productSeoDescription(product);
  const image = product.image || product.images?.[0];
  return createPageMetadata({ title, description, path: `/product/${product.slug}`, image });
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const raw = await loadProduct(slug);
  if (!raw) notFound();

  const [product, related] = await Promise.all([resolveVariants(raw), relatedFor(raw)]);
  const title = product.title || product.name || "Watch";

  return (
    <div className="container-fuse pb-10 pt-6 md:pt-10">
      {productSchemas(product).map((schema, index) => <JsonLd key={index} data={schema} />)}
      <div className="mb-6">
        <Breadcrumbs items={[["Home", "/"], ["Watches", "/watches"], [title]]} />
      </div>
      <ProductMain product={product} related={related.slice(0, 10).map(toCard)} />
      <RecentlyViewed current={toCard(product)} />
    </div>
  );
}
