"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db/neon";
import {
  CATALOG_FILTERS,
  SHOP_BY_CATEGORY,
  type CatalogFilter,
} from "@/data/categoryFilters";
import { canWrite } from "@/admin/lib/constants";
import { requireAdminSession } from "@/admin/lib/session";
import { slugify } from "@/admin/lib/slug";

export type ShopCategoryCard = {
  slug: string;
  label: string;
  image: string;
  bg?: string;
};

export type CollectionSummary = {
  name: string;
  productCount: number;
  sampleImage?: string;
};

export type CollectionProductItem = {
  id: number;
  name: string;
  price: string;
  image?: string;
  collection?: string;
  slug: string;
};

async function assertWrite() {
  const session = await requireAdminSession();
  if (!canWrite(session.role)) throw new Error("FORBIDDEN");
  return session;
}

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const rows = await sql`
      SELECT value FROM cms_settings WHERE key = ${key} LIMIT 1
    `;
    if (rows.length === 0) return fallback;
    return (rows[0] as { value: T }).value as T;
  } catch {
    return fallback;
  }
}

async function setSetting(key: string, value: unknown) {
  await sql`
    INSERT INTO cms_settings (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

/** Distinct product.collection values with counts, merged with custom collections */
export async function adminListCollections(): Promise<CollectionSummary[]> {
  await requireAdminSession();
  try {
    const rows = await sql`
      SELECT
        collection AS name,
        COUNT(*)::int AS product_count,
        (ARRAY_AGG(image) FILTER (WHERE image IS NOT NULL))[1] AS sample_image
      FROM products
      WHERE collection IS NOT NULL AND TRIM(collection) <> ''
      GROUP BY collection
      ORDER BY collection ASC
    `;
    const map = new Map<string, CollectionSummary>();
    for (const r of rows) {
      const name = String((r as { name: string }).name).trim();
      if (!name) continue;
      map.set(name, {
        name,
        productCount: Number((r as { product_count: number }).product_count),
        sampleImage:
          ((r as { sample_image?: string }).sample_image as string) || undefined,
      });
    }

    const custom = await getSetting<string[]>("custom_collections", []);
    if (Array.isArray(custom)) {
      for (const name of custom) {
        const trimmed = String(name).trim();
        if (trimmed && !map.has(trimmed)) {
          map.set(trimmed, {
            name: trimmed,
            productCount: 0,
            sampleImage: undefined,
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error("adminListCollections:", err);
    return [];
  }
}

/** Distinct product.tag values */
export async function adminListTags(): Promise<string[]> {
  await requireAdminSession();
  try {
    const rows = await sql`
      SELECT DISTINCT TRIM(tag) AS tag
      FROM products
      WHERE tag IS NOT NULL AND TRIM(tag) <> ''
      ORDER BY tag ASC
    `;
    return rows.map((r) => String((r as { tag: string }).tag)).filter(Boolean);
  } catch (err) {
    console.error("adminListTags:", err);
    return [];
  }
}

export async function adminCreateCollection(
  name: string,
): Promise<{ ok: true; name: string } | { ok: false; error: string }> {
  try {
    await assertWrite();
    const trimmed = name.trim();
    if (!trimmed) {
      return { ok: false, error: "Collection name cannot be empty." };
    }
    const current = await getSetting<string[]>("custom_collections", []);
    const list = Array.isArray(current) ? [...current] : [];
    if (!list.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      list.push(trimmed);
      await setSetting("custom_collections", list);
    }
    revalidatePath("/admin/collections");
    revalidatePath("/admin/products");
    return { ok: true, name: trimmed };
  } catch (err) {
    console.error("adminCreateCollection:", err);
    return { ok: false, error: "Failed to create collection." };
  }
}

export async function adminRenameCollection(
  from: string,
  to: string,
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    await assertWrite();
    const oldName = from.trim();
    const next = to.trim();
    if (!oldName || !next) {
      return { ok: false, error: "Both names are required." };
    }
    const result = await sql`
      UPDATE products SET collection = ${next}
      WHERE collection = ${oldName}
      RETURNING id
    `;
    const current = await getSetting<string[]>("custom_collections", []);
    if (Array.isArray(current)) {
      const updated = current.map((c) =>
        c.toLowerCase() === oldName.toLowerCase() ? next : c,
      );
      if (!updated.some((c) => c.toLowerCase() === next.toLowerCase())) {
        updated.push(next);
      }
      await setSetting("custom_collections", updated);
    }
    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath("/admin/collections");
    revalidatePath("/admin/products");
    return { ok: true, count: result.length };
  } catch (err) {
    console.error("adminRenameCollection:", err);
    return { ok: false, error: "Rename failed." };
  }
}

export async function adminDeleteCollection(
  name: string,
): Promise<{ ok: true; unassignedCount: number } | { ok: false; error: string }> {
  try {
    await assertWrite();
    const trimmed = name.trim();
    if (!trimmed) {
      return { ok: false, error: "Collection name is required." };
    }
    const result = await sql`
      UPDATE products SET collection = NULL
      WHERE collection = ${trimmed}
      RETURNING id
    `;
    const current = await getSetting<string[]>("custom_collections", []);
    if (Array.isArray(current)) {
      const updated = current.filter(
        (c) => c.toLowerCase() !== trimmed.toLowerCase(),
      );
      await setSetting("custom_collections", updated);
    }
    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath("/admin/collections");
    revalidatePath("/admin/products");
    return { ok: true, unassignedCount: result.length };
  } catch (err) {
    console.error("adminDeleteCollection:", err);
    return { ok: false, error: "Failed to delete collection." };
  }
}

export async function adminGetCollectionProducts(
  collectionName: string,
): Promise<CollectionProductItem[]> {
  await requireAdminSession();
  try {
    const trimmed = collectionName.trim();
    if (!trimmed) return [];
    const rows = await sql`
      SELECT id, name, title, price, image, collection, slug
      FROM products
      WHERE collection = ${trimmed}
      ORDER BY id DESC
    `;
    return rows.map((r) => ({
      id: Number((r as { id: number }).id),
      name: String(
        (r as { name: string | null; title: string | null }).name ||
          (r as { title: string | null }).title ||
          "Untitled",
      ),
      price: String((r as { price: string }).price || ""),
      image: ((r as { image: string | null }).image as string) || undefined,
      collection:
        ((r as { collection: string | null }).collection as string) || undefined,
      slug: String((r as { slug: string }).slug || ""),
    }));
  } catch (err) {
    console.error("adminGetCollectionProducts:", err);
    return [];
  }
}

export async function adminAddProductsToCollection(
  collectionName: string,
  productIds: number[],
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    await assertWrite();
    const trimmed = collectionName.trim();
    if (!trimmed) return { ok: false, error: "Collection name is required." };
    if (!productIds.length) return { ok: false, error: "No products selected." };

    const result = await sql`
      UPDATE products SET collection = ${trimmed}
      WHERE id = ANY(${productIds})
      RETURNING id
    `;

    const current = await getSetting<string[]>("custom_collections", []);
    const list = Array.isArray(current) ? [...current] : [];
    if (!list.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      list.push(trimmed);
      await setSetting("custom_collections", list);
    }

    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath("/admin/collections");
    revalidatePath("/admin/products");
    return { ok: true, count: result.length };
  } catch (err) {
    console.error("adminAddProductsToCollection:", err);
    return { ok: false, error: "Failed to add products to collection." };
  }
}

export async function adminRemoveProductFromCollection(
  productId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await assertWrite();
    await sql`
      UPDATE products SET collection = NULL
      WHERE id = ${productId}
    `;
    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath("/admin/collections");
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (err) {
    console.error("adminRemoveProductFromCollection:", err);
    return { ok: false, error: "Failed to remove product." };
  }
}

export async function adminSearchProductsForCollection(
  query = "",
  excludeCollection?: string,
): Promise<CollectionProductItem[]> {
  await requireAdminSession();
  try {
    const q = query.trim().toLowerCase();
    const rows = await sql`
      SELECT id, name, title, price, image, collection, slug
      FROM products
      ORDER BY id DESC
      LIMIT 100
    `;
    let items: CollectionProductItem[] = rows.map((r) => ({
      id: Number((r as { id: number }).id),
      name: String(
        (r as { name: string | null; title: string | null }).name ||
          (r as { title: string | null }).title ||
          "Untitled",
      ),
      price: String((r as { price: string }).price || ""),
      image: ((r as { image: string | null }).image as string) || undefined,
      collection:
        ((r as { collection: string | null }).collection as string) || undefined,
      slug: String((r as { slug: string }).slug || ""),
    }));

    if (excludeCollection) {
      items = items.filter((p) => p.collection !== excludeCollection);
    }

    if (q) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.collection && p.collection.toLowerCase().includes(q)),
      );
    }

    return items;
  } catch (err) {
    console.error("adminSearchProductsForCollection:", err);
    return [];
  }
}

export async function adminGetShopByCategory(): Promise<ShopCategoryCard[]> {
  await requireAdminSession();
  const stored = await getSetting<ShopCategoryCard[]>(
    "shop_by_category",
    [...SHOP_BY_CATEGORY] as ShopCategoryCard[],
  );
  return Array.isArray(stored) ? stored : [...SHOP_BY_CATEGORY];
}

export async function adminSaveShopByCategory(
  cards: ShopCategoryCard[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await assertWrite();
    const cleaned = cards
      .map((c) => ({
        slug: slugify(c.slug || c.label) || "category",
        label: c.label.trim(),
        image: c.image.trim(),
        bg: c.bg || "linear-gradient(160deg,#161616,#000)",
      }))
      .filter((c) => c.label);
    await setSetting("shop_by_category", cleaned);
    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath("/admin/collections");
    return { ok: true };
  } catch (err) {
    console.error("adminSaveShopByCategory:", err);
    return { ok: false, error: "Save failed." };
  }
}

export async function adminGetCatalogFilters(): Promise<
  Record<string, CatalogFilter>
> {
  await requireAdminSession();
  const stored = await getSetting<Record<string, CatalogFilter>>(
    "catalog_filters",
    CATALOG_FILTERS,
  );
  return stored && typeof stored === "object" ? stored : CATALOG_FILTERS;
}

export async function adminSaveCatalogFilters(
  filters: Record<string, CatalogFilter>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await assertWrite();
    // Normalize keys to slug
    const next: Record<string, CatalogFilter> = {};
    for (const [key, f] of Object.entries(filters)) {
      const slug = slugify(f.slug || key) || key;
      next[slug] = { ...f, slug };
    }
    await setSetting("catalog_filters", next);
    revalidatePath("/watches");
    revalidatePath("/admin/collections");
    return { ok: true };
  } catch (err) {
    console.error("adminSaveCatalogFilters:", err);
    return { ok: false, error: "Save failed." };
  }
}
