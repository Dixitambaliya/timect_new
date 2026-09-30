"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db/neon";
import type { Product, Variant } from "@/db/actions";
import {
  mapRowToProduct,
  type ProductInput,
} from "@/admin/lib/product-mapper";
import { slugify, uniqueSlug } from "@/admin/lib/slug";
import { canDelete, canWrite } from "@/admin/lib/constants";
import { requireAdminSession } from "@/admin/lib/session";
import { formatPrice } from "@/lib/price";

export type ProductListFilters = {
  search?: string;
  flag?: "all" | "main" | "new" | "recommended" | "related";
  gender?: string;
  sortBy?: "newest" | "oldest" | "name" | "price-asc" | "price-desc";
  page?: number;
  pageSize?: number;
};

export type ProductListResult = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

async function assertWrite() {
  const session = await requireAdminSession();
  if (!canWrite(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

async function assertDelete() {
  const session = await requireAdminSession();
  if (!canDelete(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

async function existingSlugs(excludeId?: number): Promise<Set<string>> {
  const rows =
    excludeId != null
      ? await sql`SELECT slug FROM products WHERE id <> ${excludeId}`
      : await sql`SELECT slug FROM products`;
  return new Set(
    rows.map((r) => String((r as { slug: string | null }).slug || "")),
  );
}

/** Reject huge data: URLs so product rows stay lean (use Cloudinary URLs). */
function assertImageUrlsOk(urls: string[]): string | null {
  for (const url of urls) {
    if (!url) continue;
    if (url.startsWith("data:") && url.length > 500_000) {
      return "One or more images are embedded as large data URLs. Re-upload them so they become Cloudinary/CDN links, then save again.";
    }
  }
  return null;
}

function normalizeInput(input: ProductInput): ProductInput {
  const images = (input.images || []).filter(Boolean);
  const primary = input.image || images[0] || "";
  const name = (input.name || input.title || "").trim();
  const title = (input.title || input.name || "").trim();
  return {
    ...input,
    name,
    title,
    price: formatPrice(input.price),
    image: primary,
    images: images.length ? images : primary ? [primary] : [],
    sizes: (input.sizes || []).filter(Boolean),
    variants: (input.variants || []).filter(
      (v) => v.name || v.image || v.slug,
    ),
    specifications: input.specifications || [],
  };
}

export async function adminListProducts(
  filters: ProductListFilters = {},
): Promise<ProductListResult> {
  await requireAdminSession();

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(5, filters.pageSize || 20));
  const search = (filters.search || "").trim().toLowerCase();
  const flag = filters.flag || "all";
  const gender = filters.gender || "";
  const sortBy = filters.sortBy || "newest";

  try {
    const rows = await sql`SELECT * FROM products ORDER BY id DESC`;
    let products = rows.map((r) => mapRowToProduct(r as Record<string, unknown>));

    if (flag === "main") products = products.filter((p) => p.isMainProduct);
    if (flag === "new") products = products.filter((p) => p.isNewArrival);
    if (flag === "recommended")
      products = products.filter((p) => p.isRecommended);
    if (flag === "related") products = products.filter((p) => p.isRelated);

    if (gender) {
      products = products.filter((p) => p.gender === gender);
    }

    if (search) {
      products = products.filter((p) => {
        const blob = [
          p.name,
          p.title,
          p.slug,
          p.brand,
          p.collection,
          p.code,
          p.description,
          p.tag,
          p.price,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(search);
      });
    }

    const parsePrice = (s: string) => {
      const n = parseFloat(s.replace(/[^\d.]/g, ""));
      return Number.isFinite(n) ? n : 0;
    };

    if (sortBy === "oldest") products.sort((a, b) => a.id - b.id);
    else if (sortBy === "name") {
      products.sort((a, b) =>
        (a.name || a.title || "").localeCompare(b.name || b.title || ""),
      );
    } else if (sortBy === "price-asc") {
      products.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortBy === "price-desc") {
      products.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else {
      products.sort((a, b) => b.id - a.id);
    }

    const total = products.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const slice = products.slice(start, start + pageSize);

    return { products: slice, total, page, pageSize, totalPages };
  } catch (err) {
    console.error("adminListProducts:", err);
    return { products: [], total: 0, page, pageSize, totalPages: 1 };
  }
}

export async function adminGetProduct(id: number): Promise<Product | null> {
  await requireAdminSession();
  const rows = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return null;
  return mapRowToProduct(rows[0] as Record<string, unknown>);
}

export async function adminCreateProduct(
  input: ProductInput,
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  try {
    const session = await assertWrite();
    const data = normalizeInput(input);
    if (!data.price) return { ok: false, error: "Price is required." };
    if (!data.name && !data.title) {
      return { ok: false, error: "Product name is required." };
    }
    const imageErr = assertImageUrlsOk([
      data.image || "",
      data.hoverImage || "",
      ...(data.images || []),
      ...(data.variants || []).map((v) => v.image || ""),
    ]);
    if (imageErr) return { ok: false, error: imageErr };

    const slugs = await existingSlugs();
    const base = data.slug?.trim() || data.name || data.title || "product";
    const slug = uniqueSlug(base, slugs);
    data.variants = (data.variants || []).filter((v) => v.slug !== slug);

    const rows = await sql`
      INSERT INTO products (
        slug, is_main_product, is_new_arrival, is_recommended, is_related,
        name, price, image, brand, title, subtitle, price_subtext,
        sizes, images, variants, specifications,
        tag, code, collection, description, gender, rating, hover_image
      ) VALUES (
        ${slug},
        ${Boolean(data.isMainProduct)},
        ${Boolean(data.isNewArrival)},
        ${Boolean(data.isRecommended)},
        ${Boolean(data.isRelated)},
        ${data.name || null},
        ${data.price},
        ${data.image || null},
        ${data.brand || null},
        ${data.title || null},
        ${data.subtitle || data.description || null},
        ${data.priceSubtext || null},
        ${JSON.stringify(data.sizes || [])},
        ${JSON.stringify(data.images || [])},
        ${JSON.stringify(data.variants || [])},
        ${JSON.stringify(data.specifications || [])},
        ${data.tag || null},
        ${data.code || null},
        ${data.collection || null},
        ${data.description || null},
        ${data.gender || null},
        ${data.rating ?? 4.5},
        ${data.hoverImage || null}
      )
      RETURNING id
    `;

    const id = (rows[0] as { id: number }).id;

    await syncBidirectionalVariants({
      currentProductId: id,
      currentProductSlug: slug,
      currentProductTitle: data.title || data.name || "Product",
      currentProductImage: data.image || "",
      nextVariants: data.variants || [],
    });

    try {
      await sql`
        INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, meta)
        VALUES (${session.id}, 'create', 'product', ${String(id)}, ${JSON.stringify({ slug })}::jsonb)
      `;
    } catch {
      /* optional */
    }

    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");

    return { ok: true, id };
  } catch (err) {
    console.error("adminCreateProduct:", err);
    return { ok: false, error: "Failed to create product." };
  }
}

export async function adminUpdateProduct(
  id: number,
  input: ProductInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await assertWrite();
    const data = normalizeInput(input);
    if (!data.price) return { ok: false, error: "Price is required." };
    const imageErr = assertImageUrlsOk([
      data.image || "",
      data.hoverImage || "",
      ...(data.images || []),
      ...(data.variants || []).map((v) => v.image || ""),
    ]);
    if (imageErr) return { ok: false, error: imageErr };

    const existing = await sql`
      SELECT id, slug, variants FROM products WHERE id = ${id} LIMIT 1
    `;
    if (existing.length === 0) return { ok: false, error: "Product not found." };
    const previousSlug = String(
      (existing[0] as { slug: string | null }).slug || "",
    );
    const previousVariants = parseVariants(
      (existing[0] as { variants: unknown }).variants,
    );

    const slugs = await existingSlugs(id);
    const base = data.slug?.trim() || data.name || data.title || `product-${id}`;
    let slug = slugify(base) || `product-${id}`;
    if (slugs.has(slug)) slug = uniqueSlug(base, slugs, id);
    data.variants = (data.variants || []).filter((v) => v.slug !== slug);

    await sql`
      UPDATE products SET
        slug = ${slug},
        is_main_product = ${Boolean(data.isMainProduct)},
        is_new_arrival = ${Boolean(data.isNewArrival)},
        is_recommended = ${Boolean(data.isRecommended)},
        is_related = ${Boolean(data.isRelated)},
        name = ${data.name || null},
        price = ${data.price},
        image = ${data.image || null},
        brand = ${data.brand || null},
        title = ${data.title || null},
        subtitle = ${data.subtitle || data.description || null},
        price_subtext = ${data.priceSubtext || null},
        sizes = ${JSON.stringify(data.sizes || [])},
        images = ${JSON.stringify(data.images || [])},
        variants = ${JSON.stringify(data.variants || [])},
        specifications = ${JSON.stringify(data.specifications || [])},
        tag = ${data.tag || null},
        code = ${data.code || null},
        collection = ${data.collection || null},
        description = ${data.description || null},
        gender = ${data.gender || null},
        rating = ${data.rating ?? 4.5},
        hover_image = ${data.hoverImage || null}
      WHERE id = ${id}
    `;

    await syncBidirectionalVariants({
      currentProductId: id,
      currentProductSlug: slug,
      previousProductSlug: previousSlug,
      currentProductTitle: data.title || data.name || "Product",
      currentProductImage: data.image || "",
      nextVariants: data.variants || [],
      previousVariants,
    });

    try {
      await sql`
        INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id)
        VALUES (${session.id}, 'update', 'product', ${String(id)})
      `;
    } catch {
      /* optional */
    }

    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath(`/product/${slug}`);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    revalidatePath("/admin/dashboard");

    return { ok: true };
  } catch (err) {
    console.error("adminUpdateProduct:", err);
    return { ok: false, error: "Failed to update product." };
  }
}

export async function adminDeleteProduct(
  id: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await assertDelete();

    // Fetch slug of the product to delete first
    const pRow = await sql`SELECT slug FROM products WHERE id = ${id} LIMIT 1`;
    if (pRow.length > 0) {
      const slug = pRow[0].slug as string;
      
      // Delete relationship from other products' variants
      const affectedProducts = await sql`
        SELECT id, slug, variants FROM products 
        WHERE variants::text LIKE ${'%' + slug + '%'}
      `;
      for (const row of affectedProducts) {
        const prodId = row.id as number;
        const prodSlug = row.slug as string;
        const rVariants = parseVariants(row.variants);
        const updatedVariants = rVariants.filter((v) => v.slug !== slug);
        await sql`
          UPDATE products SET variants = ${JSON.stringify(updatedVariants)}
          WHERE id = ${prodId}
        `;
        revalidatePath(`/product/${prodSlug}`);
      }
    }

    await sql`DELETE FROM products WHERE id = ${id}`;
    try {
      await sql`
        INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id)
        VALUES (${session.id}, 'delete', 'product', ${String(id)})
      `;
    } catch {
      /* optional */
    }
    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("adminDeleteProduct:", err);
    return { ok: false, error: "Failed to delete product." };
  }
}

export async function adminBulkDeleteProducts(
  ids: number[],
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    const session = await assertDelete();
    if (!ids.length) return { ok: true, count: 0 };
    let count = 0;
    for (const id of ids) {
      await sql`DELETE FROM products WHERE id = ${id}`;
      count += 1;
    }
    try {
      await sql`
        INSERT INTO audit_logs (admin_user_id, action, entity_type, meta)
        VALUES (${session.id}, 'bulk_delete', 'product', ${JSON.stringify({ ids })}::jsonb)
      `;
    } catch {
      /* optional */
    }
    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return { ok: true, count };
  } catch (err) {
    console.error("adminBulkDeleteProducts:", err);
    return { ok: false, error: "Bulk delete failed." };
  }
}

export async function adminBulkUpdateFlags(
  ids: number[],
  flags: Partial<{
    isMainProduct: boolean;
    isNewArrival: boolean;
    isRecommended: boolean;
    isRelated: boolean;
  }>,
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    const session = await assertWrite();
    if (!ids.length) return { ok: true, count: 0 };

    let count = 0;
    for (const id of ids) {
      const current = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
      if (current.length === 0) continue;
      const row = current[0] as Record<string, unknown>;
      await sql`
        UPDATE products SET
          is_main_product = ${
            flags.isMainProduct !== undefined
              ? flags.isMainProduct
              : Boolean(row.is_main_product)
          },
          is_new_arrival = ${
            flags.isNewArrival !== undefined
              ? flags.isNewArrival
              : Boolean(row.is_new_arrival)
          },
          is_recommended = ${
            flags.isRecommended !== undefined
              ? flags.isRecommended
              : Boolean(row.is_recommended)
          },
          is_related = ${
            flags.isRelated !== undefined
              ? flags.isRelated
              : Boolean(row.is_related)
          }
        WHERE id = ${id}
      `;
      count += 1;
    }

    try {
      await sql`
        INSERT INTO audit_logs (admin_user_id, action, entity_type, meta)
        VALUES (${session.id}, 'bulk_update', 'product', ${JSON.stringify({ ids, flags })}::jsonb)
      `;
    } catch {
      /* optional */
    }

    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return { ok: true, count };
  } catch (err) {
    console.error("adminBulkUpdateFlags:", err);
    return { ok: false, error: "Bulk update failed." };
  }
}

export async function adminDuplicateProduct(
  id: number,
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  try {
    await assertWrite();
    const product = await adminGetProduct(id);
    if (!product) return { ok: false, error: "Product not found." };

    const input: ProductInput = {
      name: `${product.name || product.title || "Product"} (Copy)`,
      title: product.title
        ? `${product.title} (Copy)`
        : product.name
          ? `${product.name} (Copy)`
          : "Product (Copy)",
      slug: "",
      brand: product.brand,
      collection: product.collection,
      code: product.code,
      description: product.description,
      tag: product.tag,
      gender: product.gender,
      price: product.price,
      priceSubtext: product.priceSubtext,
      subtitle: product.subtitle,
      isMainProduct: false,
      isNewArrival: product.isNewArrival,
      isRecommended: product.isRecommended,
      isRelated: product.isRelated,
      image: product.image,
      hoverImage: product.hoverImage,
      images: product.images,
      sizes: product.sizes,
      variants: product.variants,
      specifications: product.specifications,
      rating: product.rating,
    };

    return adminCreateProduct(input);
  } catch (err) {
    console.error("adminDuplicateProduct:", err);
    return { ok: false, error: "Failed to duplicate product." };
  }
}

export async function adminGetDashboardStats() {
  await requireAdminSession();
  try {
    const rows = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE is_new_arrival)::int AS new_arrivals,
        COUNT(*) FILTER (WHERE is_recommended)::int AS recommended,
        COUNT(*) FILTER (WHERE is_related)::int AS related,
        COUNT(*) FILTER (WHERE is_main_product)::int AS main_products,
        COUNT(DISTINCT NULLIF(collection, ''))::int AS collections
      FROM products
    `;
    const s = rows[0] as Record<string, number>;
    const recentRows = await sql`
      SELECT * FROM products ORDER BY id DESC LIMIT 8
    `;
    return {
      total: s.total || 0,
      newArrivals: s.new_arrivals || 0,
      recommended: s.recommended || 0,
      related: s.related || 0,
      mainProducts: s.main_products || 0,
      collections: s.collections || 0,
      recentlyAdded: recentRows.map((r) =>
        mapRowToProduct(r as Record<string, unknown>),
      ),
    };
  } catch (err) {
    console.error("adminGetDashboardStats:", err);
    return {
      total: 0,
      newArrivals: 0,
      recommended: 0,
      related: 0,
      mainProducts: 0,
      collections: 0,
      recentlyAdded: [] as Product[],
    };
  }
}

export async function adminGetAllProductsQuick(): Promise<{ slug: string; name: string; image: string }[]> {
  await requireAdminSession();
  try {
    const rows = await sql`
      SELECT slug, name, title, image FROM products 
      ORDER BY COALESCE(name, title) ASC, id DESC
    `;
    return rows.map((r: any) => ({
      slug: r.slug as string,
      name: (r.name || r.title || "") as string,
      image: (r.image || "") as string,
    }));
  } catch (error) {
    console.error("Error adminGetAllProductsQuick:", error);
    return [];
  }
}

function parseVariants(raw: unknown): Variant[] {
  if (!raw) return [];
  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value.filter((v) => v && typeof v === "object") as Variant[];
}

function variantSlugs(variants: Variant[]): string[] {
  return [
    ...new Set(
      variants
        .map((v) => (v.slug || "").trim())
        .filter(Boolean),
    ),
  ];
}

function hasVariantSlug(variants: Variant[], slug: string): boolean {
  return Boolean(slug) && variants.some((v) => v.slug === slug);
}

function makeVariantId(): string {
  return `v${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

type VariantMember = {
  id: number;
  slug: string;
  name: string;
  image: string;
  variants: Variant[];
};

function rowToMember(row: Record<string, unknown>): VariantMember {
  return {
    id: row.id as number,
    slug: String(row.slug || ""),
    name: String(row.name || row.title || row.slug || ""),
    image: String(row.image || ""),
    variants: parseVariants(row.variants),
  };
}

async function fetchProductsBySlugs(slugs: string[]): Promise<VariantMember[]> {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return [];
  try {
    const rows = await sql`
      SELECT id, slug, name, title, image, variants
      FROM products
      WHERE slug = ANY(${unique})
    `;
    return rows.map((row) => rowToMember(row as Record<string, unknown>));
  } catch (err) {
    console.error("fetchProductsBySlugs ANY() failed, fetching one by one:", err);
    const found: VariantMember[] = [];
    for (const slug of unique) {
      const rows = await sql`
        SELECT id, slug, name, title, image, variants
        FROM products
        WHERE slug = ${slug}
        LIMIT 1
      `;
      if (rows[0]) found.push(rowToMember(rows[0] as Record<string, unknown>));
    }
    return found;
  }
}

async function fetchProductsLinkingTo(
  slug: string,
  excludeId: number,
): Promise<VariantMember[]> {
  if (!slug) return [];
  try {
    const rows = await sql`
      SELECT id, slug, name, title, image, variants
      FROM products
      WHERE id <> ${excludeId}
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(variants, '[]'::jsonb)) AS elem
          WHERE elem->>'slug' = ${slug}
        )
    `;
    return rows.map((row) => rowToMember(row as Record<string, unknown>));
  } catch (err) {
    console.error("fetchProductsLinkingTo jsonb failed, falling back:", err);
    const rows = await sql`
      SELECT id, slug, name, title, image, variants
      FROM products
      WHERE id <> ${excludeId}
        AND variants::text LIKE ${"%" + slug + "%"}
    `;
    return rows
      .map((row) => rowToMember(row as Record<string, unknown>))
      .filter((p) => hasVariantSlug(p.variants, slug));
  }
}

async function writeProductVariants(
  product: { id: number; slug: string },
  variants: Variant[],
) {
  await sql`
    UPDATE products SET variants = ${JSON.stringify(variants)}
    WHERE id = ${product.id}
  `;
  revalidatePath(`/product/${product.slug}`);
  revalidatePath(`/admin/products/${product.id}/edit`);
}

async function syncBidirectionalVariants({
  currentProductId,
  currentProductSlug,
  previousProductSlug,
  currentProductTitle,
  currentProductImage,
  nextVariants,
  previousVariants = [],
}: {
  currentProductId: number;
  currentProductSlug: string;
  previousProductSlug?: string;
  currentProductTitle: string;
  currentProductImage: string;
  nextVariants: Variant[];
  previousVariants?: Variant[];
}) {
  try {
    if (!currentProductSlug) return;

    const slugChanged = Boolean(
      previousProductSlug && previousProductSlug !== currentProductSlug,
    );
    const nextLinked = new Set(
      variantSlugs(nextVariants).filter((s) => s !== currentProductSlug),
    );
    const prevLinked = new Set(
      variantSlugs(previousVariants).filter(
        (s) => s !== currentProductSlug && s !== previousProductSlug,
      ),
    );

    const [resolvedProducts, referencingCurrent, referencingPrevious] =
      await Promise.all([
        fetchProductsBySlugs([...nextLinked, ...prevLinked]),
        fetchProductsLinkingTo(currentProductSlug, currentProductId),
        slugChanged
          ? fetchProductsLinkingTo(previousProductSlug!, currentProductId)
          : Promise.resolve([] as VariantMember[]),
      ]);

    const byId = new Map<number, VariantMember>();
    for (const product of [
      ...resolvedProducts,
      ...referencingCurrent,
      ...referencingPrevious,
    ]) {
      byId.set(product.id, product);
    }

    const family = new Map<
      string,
      { slug: string; name: string; image: string }
    >();
    family.set(currentProductSlug, {
      slug: currentProductSlug,
      name: currentProductTitle,
      image: currentProductImage,
    });
    for (const product of resolvedProducts) {
      if (nextLinked.has(product.slug)) {
        family.set(product.slug, {
          slug: product.slug,
          name: product.name,
          image: product.image,
        });
      }
    }

    const familySlugs = new Set(family.keys());
    const unlinkedSlugs = new Set<string>();
    for (const slug of prevLinked) {
      if (!familySlugs.has(slug)) unlinkedSlugs.add(slug);
    }

    const unlinkedIds = new Set<number>();
    for (const product of byId.values()) {
      if (product.id === currentProductId) continue;
      if (familySlugs.has(product.slug)) continue;
      const listedBefore = prevLinked.has(product.slug);
      const referencesCurrent = hasVariantSlug(
        product.variants,
        currentProductSlug,
      );
      const referencesPrevious =
        slugChanged && hasVariantSlug(product.variants, previousProductSlug!);
      if (listedBefore || referencesCurrent || referencesPrevious) {
        unlinkedIds.add(product.id);
        if (product.slug) unlinkedSlugs.add(product.slug);
      }
    }

    for (const product of byId.values()) {
      if (product.id === currentProductId) continue;
      if (!familySlugs.has(product.slug)) continue;

      let variants = product.variants.map((variant) => {
        if (
          variant.slug === currentProductSlug ||
          (slugChanged && variant.slug === previousProductSlug)
        ) {
          return {
            ...variant,
            slug: currentProductSlug,
            name: variant.name || currentProductTitle,
            image: variant.image || currentProductImage,
          };
        }
        return variant;
      });

      variants = variants.filter(
        (variant) => !variant.slug || !unlinkedSlugs.has(variant.slug),
      );

      for (const [otherSlug, other] of family) {
        if (otherSlug === product.slug) continue;
        if (hasVariantSlug(variants, otherSlug)) continue;
        variants.push({
          id: makeVariantId(),
          name: other.name,
          image: other.image,
          slug: otherSlug,
        });
      }

      if (JSON.stringify(variants) !== JSON.stringify(product.variants)) {
        await writeProductVariants(product, variants);
      }
    }

    for (const id of unlinkedIds) {
      const product = byId.get(id);
      if (!product) continue;
      const variants = product.variants.filter((variant) => {
        if (!variant.slug) return true;
        if (variant.slug === currentProductSlug) return false;
        if (slugChanged && variant.slug === previousProductSlug) return false;
        if (familySlugs.has(variant.slug)) return false;
        return true;
      });
      if (JSON.stringify(variants) !== JSON.stringify(product.variants)) {
        await writeProductVariants(product, variants);
      }
    }
  } catch (error) {
    console.error("Error syncBidirectionalVariants:", error);
  }
}

