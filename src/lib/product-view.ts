import { getProductSlugByImage, type Product, type Variant } from "@/db/actions";
import { sql } from "@/db/neon";
import type { CardProduct } from "@/components/site/ProductCard";

/** Lean card projection -keeps client payloads small. */
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

/** Older variants were linked by image only -resolve them to product slugs.
 * Also builds a stable, canonical family list across all variant sibling pages.
 */
export async function resolveVariants(product: Product): Promise<Product> {
  if (!product.variants?.length) return product;

  // 1. Resolve older variants linked by image only to product slugs.
  const resolvedVariants: Variant[] = await Promise.all(
    product.variants.map(async (v) => {
      if (v.slug || !v.image) return v;
      const slug = await getProductSlugByImage(v.image);
      return { ...v, slug: slug || undefined };
    }),
  );

  const linkedSlugs = resolvedVariants
    .map((v) => v.slug)
    .filter((s): s is string => Boolean(s) && s !== product.slug);

  // If variants do not reference separate product pages (e.g. swatch-only local variants),
  // retain them as-is.
  if (linkedSlugs.length === 0) {
    return { ...product, variants: resolvedVariants };
  }

  try {
    const familySlugs = Array.from(new Set([product.slug, ...linkedSlugs]));
    const rows = await sql`
      SELECT id, slug, name, title, image, variants, status
      FROM products
      WHERE slug = ANY(${familySlugs})
      ORDER BY id ASC
    `;

    // Only show published sibling products on the storefront (plus the current product itself).
    const visibleRows = (rows as any[]).filter(
      (r) => r.status === "published" || r.slug === product.slug,
    );

    if (visibleRows.length <= 1) {
      return { ...product, variants: resolvedVariants };
    }

    const familyVariants: Variant[] = visibleRows.map((r) => {
      const isCurrent = r.slug === product.slug;
      const existing = resolvedVariants.find((v) => v.slug === r.slug);

      let colorHex = existing?.colorHex;
      if (!colorHex && Array.isArray(r.variants)) {
        const found = (r.variants as Variant[]).find((v) => v.colorHex);
        if (found?.colorHex) colorHex = found.colorHex;
      }

      return {
        id: existing?.id || `v-${r.id}`,
        name: isCurrent
          ? product.title || product.name || r.title || r.name || "Watch"
          : existing?.name || r.title || r.name || "Watch",
        image: isCurrent
          ? product.image || product.images?.[0] || r.image || ""
          : existing?.image || r.image || "",
        slug: r.slug,
        colorHex,
      };
    });

    return { ...product, variants: familyVariants };
  } catch (err) {
    console.error("resolveVariants error:", err);
    return { ...product, variants: resolvedVariants };
  }
}
