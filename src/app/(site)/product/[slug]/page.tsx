import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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

type Params = { params: Promise<{ slug: string }> };

async function loadProduct(slug: string): Promise<Product | null> {
  if (/^\d+$/.test(slug)) {
    const byId = await getProductById(Number(slug));
    if (byId?.slug && byId.slug !== slug) redirect(`/product/${byId.slug}`);
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
  if (!product) return { title: "Watch not found" };
  const title = product.title || product.name || "Timect watch";
  const description = product.subtitle || product.description || `${title} — ${product.price}`;
  const image = product.image || product.images?.[0];
  return {
    title,
    description,
    openGraph: { title, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const raw = await loadProduct(slug);
  if (!raw) notFound();

  const [product, related] = await Promise.all([resolveVariants(raw), relatedFor(raw)]);
  const title = product.title || product.name || "Watch";

  return (
    <div className="container-fuse pb-10 pt-6 md:pt-10">
      <div className="mb-6">
        <Breadcrumbs items={[["Home", "/"], ["Watches", "/watches"], [title]]} />
      </div>
      <ProductMain product={product} related={related.slice(0, 10).map(toCard)} />
      <RecentlyViewed current={toCard(product)} />
    </div>
  );
}
