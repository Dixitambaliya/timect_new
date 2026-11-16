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

/** Distinct product.collection values with counts */
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
    return rows.map((r) => ({
      name: String((r as { name: string }).name),
      productCount: Number((r as { product_count: number }).product_count),
      sampleImage:
        ((r as { sample_image?: string }).sample_image as string) || undefined,
    }));
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

export async function adminRenameCollection(
  from: string,
  to: string,
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    await assertWrite();
    const next = to.trim();
    if (!from.trim() || !next) {
      return { ok: false, error: "Both names are required." };
    }
    const result = await sql`
      UPDATE products SET collection = ${next}
      WHERE collection = ${from}
      RETURNING id
    `;
    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath("/admin/collections");
    return { ok: true, count: result.length };
  } catch (err) {
    console.error("adminRenameCollection:", err);
    return { ok: false, error: "Rename failed." };
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
