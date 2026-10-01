import { cache } from "react";
import { sql } from "./neon";
import {
  CATALOG_FILTERS,
  SHOP_BY_CATEGORY,
  type CatalogFilter,
} from "@/data/categoryFilters";
import {
  mergeStorefront,
  STOREFRONT_SETTING_KEY,
  type StorefrontSettings,
} from "@/data/storefront";

/**
 * Public, read-only content for the storefront. Everything here is backed by
 * cms_settings (managed in the admin panel) with the static catalog data as a
 * fallback, so the site keeps working before the admin migration has run.
 */

export type ShopCategory = {
  slug: string;
  label: string;
  image: string;
  bg?: string;
};

async function readSetting<T>(key: string): Promise<T | null> {
  try {
    const rows = await sql`
      SELECT value FROM cms_settings WHERE key = ${key} LIMIT 1
    `;
    if (rows.length === 0) return null;
    return (rows[0] as { value: T }).value;
  } catch {
    return null;
  }
}

export const getStorefront = cache(async (): Promise<StorefrontSettings> => {
  const stored = await readSetting<Partial<StorefrontSettings>>(
    STOREFRONT_SETTING_KEY,
  );
  return mergeStorefront(stored);
});

export const getShopCategories = cache(async (): Promise<ShopCategory[]> => {
  const stored = await readSetting<ShopCategory[]>("shop_by_category");
  if (Array.isArray(stored) && stored.length) {
    return stored.filter((c) => c && c.slug && c.label);
  }
  return SHOP_BY_CATEGORY.map((c) => ({ ...c }));
});

export const getCatalogFilters = cache(
  async (): Promise<Record<string, CatalogFilter>> => {
    const stored = await readSetting<Record<string, CatalogFilter>>(
      "catalog_filters",
    );
    if (stored && typeof stored === "object" && Object.keys(stored).length) {
      // Keep built-in gender filters (him / her) available even if an admin
      // removed them, since homepage banners link to them.
      return { him: CATALOG_FILTERS.him, her: CATALOG_FILTERS.her, ...stored };
    }
    return CATALOG_FILTERS;
  },
);

export async function resolveCatalogFilter(
  slug: string | null | undefined,
): Promise<CatalogFilter | null> {
  if (!slug) return null;
  const filters = await getCatalogFilters();
  return filters[slug] ?? null;
}

export type CatalogFacets = {
  brands: string[];
  maxPrice: number;
};

/** Brand / collection names and price ceiling taken from live products. */
export const getCatalogFacets = cache(async (): Promise<CatalogFacets> => {
  try {
    const rows = await sql`
      SELECT DISTINCT TRIM(v) AS name FROM (
        SELECT brand AS v FROM products
        UNION ALL
        SELECT collection AS v FROM products
      ) t
      WHERE v IS NOT NULL AND TRIM(v) <> ''
      ORDER BY 1
    `;
    const priceRows = await sql`
      SELECT MAX(NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric) AS max
      FROM products
    `;
    const rawMax = Number((priceRows[0] as { max: string | null })?.max || 0);
    // Round up to a clean slider ceiling
    const step = 50000;
    const maxPrice = Math.max(step, Math.ceil(rawMax / step) * step);
    return {
      brands: rows.map((r) => String((r as { name: string }).name)),
      maxPrice,
    };
  } catch (err) {
    console.error("getCatalogFacets:", err);
    return { brands: [], maxPrice: 250000 };
  }
});
