import { getProductSlugByImage, type Product } from "@/db/actions";
import type { CardProduct } from "@/components/site/ProductCard";

/** Lean card projection — keeps client payloads small. */
export function toCard(p: Product): CardProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    title: p.title,
    price: p.price,
    image: p.image || p.images?.[0],
    hoverImage: p.hoverImage,
    brand: p.brand,
    collection: p.collection,
    tag: p.tag,
    code: p.code,
    gender: p.gender,
    rating: p.rating,
    isMainProduct: p.isMainProduct,
    description: p.description,
  };
}

/** Older variants were linked by image only — resolve them to product slugs. */
export async function resolveVariants(product: Product): Promise<Product> {
  if (!product.variants?.length) return product;
  const variants = await Promise.all(
    product.variants.map(async (v) => {
      if (v.slug || !v.image) return v;
      const slug = await getProductSlugByImage(v.image);
      return { ...v, slug: slug || undefined };
    }),
  );
  return { ...product, variants };
}
