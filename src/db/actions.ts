"use server";

import { sql } from "./neon";
import { resolveCatalogFilter } from "./content";
import { formatPrice } from "@/lib/price";
import {
  catalogFilterSqlKeywords,
  productMatchesCatalogFilter,
} from "@/lib/specifications";

export interface Variant {
  id: string;
  name: string;
  image: string;
  slug?: string;
}

export interface SpecificationItem {
  label?: string;
  value?: string;
  [key: string]: any;
}

export interface Specification {
  title: string;
  type: string;
  items?: any[];
  content?: string;
}

export interface Product {
  id: number;
  slug: string;
  name?: string;
  price: string;
  image?: string;
  isMainProduct: boolean;
  isNewArrival: boolean;
  isRecommended: boolean;
  isRelated: boolean;
  
  // Main product fields
  brand?: string;
  title?: string;
  subtitle?: string;
  priceSubtext?: string;
  sizes?: string[];
  images?: string[];
  variants?: Variant[];
  specifications?: Specification[];
  
  // New arrival fields
  tag?: string;
  
  // Recommended fields
  code?: string;
  
  // Related product fields
  collection?: string;
  description?: string;
  gender?: string;
  rating?: number;
  hoverImage?: string;
}

function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name || undefined,
    price: formatPrice(row.price),
    image: row.image || undefined,
    isMainProduct: row.is_main_product,
    isNewArrival: row.is_new_arrival,
    isRecommended: row.is_recommended,
    isRelated: row.is_related,
    
    brand: row.brand || undefined,
    title: row.title || undefined,
    subtitle: row.subtitle || undefined,
    priceSubtext: row.price_subtext || undefined,
    sizes: row.sizes || undefined,
    images: row.images || undefined,
    variants: row.variants || undefined,
    specifications: row.specifications || undefined,
    
    tag: row.tag || undefined,
    
    code: row.code || undefined,
    
    collection: row.collection || undefined,
    description: row.description || undefined,
    gender: row.gender || undefined,
    rating: (() => {
      if (row.rating == null || row.rating === "") return undefined;
      const n = parseFloat(String(row.rating));
      return Number.isFinite(n) ? n : undefined;
    })(),
    hoverImage: row.hover_image || undefined,
  };
}

export async function getMainProduct(): Promise<Product | null> {
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE is_main_product = TRUE 
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return mapRowToProduct(rows[0]);
  } catch (error) {
    console.error("Error fetching main product:", error);
    return null;
  }
}

export async function getNewArrivals(): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE is_new_arrival = TRUE 
      ORDER BY id ASC
    `;
    return rows.map(mapRowToProduct);
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

export async function getRecommended(): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE is_recommended = TRUE 
      ORDER BY id ASC
    `;
    return rows.map(mapRowToProduct);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return [];
  }
}

export async function getRelatedProducts(): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE is_related = TRUE 
      ORDER BY id ASC
    `;
    return rows.map(mapRowToProduct);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE id = ${id}
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return mapRowToProduct(rows[0]);
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const rows = await sql`
      SELECT * FROM products 
      WHERE slug = ${slug}
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return mapRowToProduct(rows[0]);
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    return null;
  }
}

/** Lean card fields only — no variants/specs/images[] (keeps catalog payloads tiny & fast). */
export type CatalogCard = {
  id: number;
  slug: string;
  name?: string;
  title?: string;
  price: string;
  image?: string;
  hoverImage?: string;
  brand?: string;
  collection?: string;
  tag?: string;
  code?: string;
  gender?: string;
  rating?: number;
  isMainProduct: boolean;
};

function mapRowToCatalogCard(row: any): CatalogCard {
  return {
    id: row.id,
    slug: row.slug || "",
    name: row.name || undefined,
    title: row.title || undefined,
    price: formatPrice(row.price),
    image: row.image || undefined,
    hoverImage: row.hover_image || undefined,
    brand: row.brand || undefined,
    collection: row.collection || undefined,
    tag: row.tag || undefined,
    code: row.code || undefined,
    gender: row.gender || undefined,
    rating: (() => {
      if (row.rating == null || row.rating === "") return undefined;
      const n = parseFloat(String(row.rating));
      return Number.isFinite(n) ? n : undefined;
    })(),
    isMainProduct: Boolean(row.is_main_product),
  };
}

/**
 * Fast catalog listing for the watches page.
 * - Lean columns only (text + thumbnail URL)
 * - pageSize+1 trick → no blocking COUNT round-trip
 * - Single query for the common category/sort path
 */
export async function getCatalogCards(filters: {
  search?: string;
  genders?: string[];
  brands?: string[];
  priceMin?: number;
  priceMax?: number;
  category?: string;
  filter?: string;
  spec?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ products: CatalogCard[]; total: number; hasMore: boolean }> {
  try {
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.min(48, Math.max(1, filters.pageSize || 9));
    const offset = (page - 1) * pageSize;
    const limit = pageSize + 1; // +1 to detect hasMore without COUNT

    const catalogFilter = await resolveCatalogFilter(filters.filter);
    const noExtraFilters =
      !filters.search?.trim() &&
      !(filters.brands && filters.brands.length) &&
      !catalogFilter &&
      !(filters.spec || "").trim() &&
      (filters.priceMin === undefined || filters.priceMin <= 0) &&
      (filters.priceMax === undefined || filters.priceMax >= 250000);

    const genders = (filters.genders || []).filter(Boolean);
    const singleGender =
      genders.length === 1 &&
      ["Men", "Women", "Unisex"].includes(genders[0]);

    // Gender-only path (For Him / For Her) — lean SQL, no full-table JS scan
    if (noExtraFilters && singleGender && (!filters.category || filters.category === "all")) {
      const g = genders[0];
      const rows = await sql`
        SELECT id, slug, name, title, price, image, hover_image,
               brand, collection, tag, code, gender, rating, is_main_product
        FROM products
        WHERE gender = ${g}
        ORDER BY id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const hasMore = rows.length > pageSize;
      const pageRows = hasMore ? rows.slice(0, pageSize) : rows;
      return {
        products: pageRows.map(mapRowToCatalogCard),
        total: hasMore ? offset + pageRows.length + 1 : offset + pageRows.length,
        hasMore,
      };
    }

    const simplePath = noExtraFilters && genders.length === 0;

    if (simplePath) {
      const cat = filters.category || "all";
      const sortBy = filters.sortBy || "newest";
      let rows: any[];

      // Prefer simple id sort (index-friendly). Price sort only when requested.
      if (cat === "new") {
        if (sortBy === "price-asc") {
          rows = await sql`
            SELECT id, slug, name, title, price, image, hover_image,
                   brand, collection, tag, code, gender, rating, is_main_product
            FROM products WHERE is_new_arrival = TRUE
            ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric ASC NULLS LAST, id DESC
            LIMIT ${limit} OFFSET ${offset}`;
        } else if (sortBy === "price-desc") {
          rows = await sql`
            SELECT id, slug, name, title, price, image, hover_image,
                   brand, collection, tag, code, gender, rating, is_main_product
            FROM products WHERE is_new_arrival = TRUE
            ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric DESC NULLS LAST, id DESC
            LIMIT ${limit} OFFSET ${offset}`;
        } else {
          rows = await sql`
            SELECT id, slug, name, title, price, image, hover_image,
                   brand, collection, tag, code, gender, rating, is_main_product
            FROM products WHERE is_new_arrival = TRUE
            ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
        }
      } else if (cat === "recommended") {
        if (sortBy === "price-asc") {
          rows = await sql`
            SELECT id, slug, name, title, price, image, hover_image,
                   brand, collection, tag, code, gender, rating, is_main_product
            FROM products WHERE is_recommended = TRUE
            ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric ASC NULLS LAST, id DESC
            LIMIT ${limit} OFFSET ${offset}`;
        } else if (sortBy === "price-desc") {
          rows = await sql`
            SELECT id, slug, name, title, price, image, hover_image,
                   brand, collection, tag, code, gender, rating, is_main_product
            FROM products WHERE is_recommended = TRUE
            ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric DESC NULLS LAST, id DESC
            LIMIT ${limit} OFFSET ${offset}`;
        } else {
          rows = await sql`
            SELECT id, slug, name, title, price, image, hover_image,
                   brand, collection, tag, code, gender, rating, is_main_product
            FROM products WHERE is_recommended = TRUE
            ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
        }
      } else if (cat === "related") {
        if (sortBy === "price-asc") {
          rows = await sql`
            SELECT id, slug, name, title, price, image, hover_image,
                   brand, collection, tag, code, gender, rating, is_main_product
            FROM products WHERE is_related = TRUE
            ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric ASC NULLS LAST, id DESC
            LIMIT ${limit} OFFSET ${offset}`;
        } else if (sortBy === "price-desc") {
          rows = await sql`
            SELECT id, slug, name, title, price, image, hover_image,
                   brand, collection, tag, code, gender, rating, is_main_product
            FROM products WHERE is_related = TRUE
            ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric DESC NULLS LAST, id DESC
            LIMIT ${limit} OFFSET ${offset}`;
        } else {
          rows = await sql`
            SELECT id, slug, name, title, price, image, hover_image,
                   brand, collection, tag, code, gender, rating, is_main_product
            FROM products WHERE is_related = TRUE
            ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
        }
      } else if (sortBy === "price-asc") {
        rows = await sql`
          SELECT id, slug, name, title, price, image, hover_image,
                 brand, collection, tag, code, gender, rating, is_main_product
          FROM products
          ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric ASC NULLS LAST, id DESC
          LIMIT ${limit} OFFSET ${offset}`;
      } else if (sortBy === "price-desc") {
        rows = await sql`
          SELECT id, slug, name, title, price, image, hover_image,
                 brand, collection, tag, code, gender, rating, is_main_product
          FROM products
          ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric DESC NULLS LAST, id DESC
          LIMIT ${limit} OFFSET ${offset}`;
      } else {
        rows = await sql`
          SELECT id, slug, name, title, price, image, hover_image,
                 brand, collection, tag, code, gender, rating, is_main_product
          FROM products
          ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
      }

      const hasMore = rows.length > pageSize;
      const pageRows = hasMore ? rows.slice(0, pageSize) : rows;
      const products = pageRows.map(mapRowToCatalogCard);
      // Exact total only when we know the end; otherwise "at least" so UI can show progress
      const total = hasMore
        ? offset + products.length + 1
        : offset + products.length;

      return { products, total, hasMore };
    }

    // Complex filters: reuse full filter pipeline, then project to cards
    const full = await getFilteredProducts(filters);
    return {
      products: full.products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        title: p.title,
        price: p.price,
        image: p.image,
        hoverImage: p.hoverImage,
        brand: p.brand,
        collection: p.collection,
        tag: p.tag,
        code: p.code,
        gender: p.gender,
        rating: p.rating,
        isMainProduct: p.isMainProduct,
      })),
      total: full.total,
      hasMore: full.hasMore,
    };
  } catch (error) {
    console.error("Error getCatalogCards:", error);
    return { products: [], total: 0, hasMore: false };
  }
}

export async function getFilteredProducts(filters: {
  search?: string;
  genders?: string[];
  brands?: string[];
  priceMin?: number;
  priceMax?: number;
  category?: string; // 'all', 'new', 'recommended', 'related'
  /**
   * Shop-by-category / collection slug (e.g. quartz-precision, blue).
   * Matched against products.specifications JSONB + related text fields.
   */
  filter?: string;
  /**
   * Optional free-form specification keyword(s), comma-separated.
   * Example: "Quartz,Chronograph" — any match in specifications JSONB.
   */
  spec?: string;
  sortBy?: string; // 'newest' | 'price-asc' | 'price-desc'
  page?: number;
  pageSize?: number;
}): Promise<{ products: Product[]; total: number; hasMore: boolean }> {
  try {
    const catalogFilter = await resolveCatalogFilter(filters.filter);
    const sqlKeywords = catalogFilter
      ? catalogFilterSqlKeywords(catalogFilter)
      : [];
    const freeSpecKeywords = (filters.spec || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.min(48, Math.max(1, filters.pageSize || 20));
    const offset = (page - 1) * pageSize;

    // Fast path: only category pill + sort (no search / brands / specs / gender / price)
    // → SQL LIMIT so the first batch paints without scanning the whole table in JS.
    const simplePath =
      !filters.search?.trim() &&
      !(filters.genders && filters.genders.length) &&
      !(filters.brands && filters.brands.length) &&
      !catalogFilter &&
      freeSpecKeywords.length === 0 &&
      (filters.priceMin === undefined || filters.priceMin <= 0) &&
      (filters.priceMax === undefined || filters.priceMax >= 250000);

    if (simplePath) {
      const cat = filters.category || "all";
      const sortBy = filters.sortBy || "newest";
      const limit = pageSize + 1;
      let rows: any[];

      if (cat === "new") {
        if (sortBy === "price-asc") {
          rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products WHERE is_new_arrival = TRUE ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric ASC NULLS LAST, id DESC LIMIT ${limit} OFFSET ${offset}`;
        } else if (sortBy === "price-desc") {
          rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products WHERE is_new_arrival = TRUE ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric DESC NULLS LAST, id DESC LIMIT ${limit} OFFSET ${offset}`;
        } else {
          rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products WHERE is_new_arrival = TRUE ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
        }
      } else if (cat === "recommended") {
        if (sortBy === "price-asc") {
          rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products WHERE is_recommended = TRUE ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric ASC NULLS LAST, id DESC LIMIT ${limit} OFFSET ${offset}`;
        } else if (sortBy === "price-desc") {
          rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products WHERE is_recommended = TRUE ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric DESC NULLS LAST, id DESC LIMIT ${limit} OFFSET ${offset}`;
        } else {
          rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products WHERE is_recommended = TRUE ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
        }
      } else if (cat === "related") {
        if (sortBy === "price-asc") {
          rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products WHERE is_related = TRUE ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric ASC NULLS LAST, id DESC LIMIT ${limit} OFFSET ${offset}`;
        } else if (sortBy === "price-desc") {
          rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products WHERE is_related = TRUE ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric DESC NULLS LAST, id DESC LIMIT ${limit} OFFSET ${offset}`;
        } else {
          rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products WHERE is_related = TRUE ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
        }
      } else if (sortBy === "price-asc") {
        rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric ASC NULLS LAST, id DESC LIMIT ${limit} OFFSET ${offset}`;
      } else if (sortBy === "price-desc") {
        rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products ORDER BY NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric DESC NULLS LAST, id DESC LIMIT ${limit} OFFSET ${offset}`;
      } else {
        rows = await sql`SELECT id, slug, name, title, price, image, hover_image, brand, collection, tag, code, gender, rating, is_main_product, is_new_arrival, is_recommended, is_related FROM products ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
      }

      const hasMore = rows.length > pageSize;
      const pageRows = hasMore ? rows.slice(0, pageSize) : rows;
      const products = pageRows.map(mapRowToProduct);
      const total = hasMore
        ? offset + products.length + 1
        : offset + products.length;
      return { products, total, hasMore };
    }

    // Complex path: PostgreSQL JSONB pre-filter, then JS refine.
    let rows;
    const prefilterKeywords = [...sqlKeywords, ...freeSpecKeywords];

    if (prefilterKeywords.length > 0) {
      // Regex any-of for JSONB text + catalog fields (GIN index helps specs lookups at scale)
      const escaped = prefilterKeywords
        .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
      const pattern = `(${escaped})`;
      rows = await sql`
        SELECT * FROM products
        WHERE
          COALESCE(specifications::text, '') ~* ${pattern}
          OR COALESCE(name, '') ~* ${pattern}
          OR COALESCE(title, '') ~* ${pattern}
          OR COALESCE(subtitle, '') ~* ${pattern}
          OR COALESCE(description, '') ~* ${pattern}
          OR COALESCE(collection, '') ~* ${pattern}
          OR COALESCE(brand, '') ~* ${pattern}
        ORDER BY id DESC
      `;
    } else {
      rows = await sql`SELECT * FROM products ORDER BY id DESC`;
    }

    let products = rows.map(mapRowToProduct);

    // 1. Filter by category pill (homepage sections)
    if (filters.category && filters.category !== "all") {
      if (filters.category === "new") {
        products = products.filter((p) => p.isNewArrival);
      } else if (filters.category === "recommended") {
        products = products.filter((p) => p.isRecommended);
      } else if (filters.category === "related") {
        products = products.filter((p) => p.isRelated);
      }
    }

    // 2. Catalog filter from shop-by-category / collection cards (specifications JSONB)
    if (catalogFilter) {
      products = products.filter((p) =>
        productMatchesCatalogFilter(p, catalogFilter),
      );
    }

    // 3. Free-form spec keywords (any match against flattened specifications)
    if (freeSpecKeywords.length > 0) {
      products = products.filter((p) => {
        const blob = [
          JSON.stringify(p.specifications || []),
          p.name,
          p.title,
          p.description,
          p.collection,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return freeSpecKeywords.some((kw) => blob.includes(kw.toLowerCase()));
      });
    }

    // Helper to clean price string to number for comparison
    const parsePrice = (priceStr: string): number => {
      const cleaned = priceStr.replace(/[^\d.]/g, "");
      return cleaned ? parseFloat(cleaned) : 0;
    };

    // 4. Filter by price range
    if (filters.priceMin !== undefined) {
      products = products.filter(
        (p) => parsePrice(p.price) >= (filters.priceMin || 0),
      );
    }
    if (filters.priceMax !== undefined) {
      products = products.filter(
        (p) => parsePrice(p.price) <= (filters.priceMax || Infinity),
      );
    }

    // 5. Filter by gender
    if (filters.genders && filters.genders.length > 0) {
      products = products.filter(
        (p) => p.gender && filters.genders!.includes(p.gender),
      );
    }

    // 6. Filter by brand
    if (filters.brands && filters.brands.length > 0) {
      products = products.filter((p) => {
        const productBrand = p.brand || p.collection || "Seiko";
        return filters.brands!.some((b) =>
          productBrand.toLowerCase().includes(b.toLowerCase()),
        );
      });
    }

    // 7. Filter by search query (includes specifications JSON)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      products = products.filter((p) => {
        const name = (p.name || p.title || "").toLowerCase();
        const brand = (p.brand || p.collection || "").toLowerCase();
        const subtitle = (p.subtitle || p.description || "").toLowerCase();
        const specs = JSON.stringify(p.specifications || []).toLowerCase();
        return (
          name.includes(q) ||
          brand.includes(q) ||
          subtitle.includes(q) ||
          specs.includes(q)
        );
      });
    }

    // 8. Sort
    if (filters.sortBy) {
      if (filters.sortBy === "price-asc") {
        products.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
      } else if (filters.sortBy === "price-desc") {
        products.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
      } else if (filters.sortBy === "newest") {
        products.sort((a, b) => b.id - a.id);
      }
    }

    const total = products.length;
    const start = offset;
    const paginatedProducts = products.slice(start, start + pageSize);

    return {
      products: paginatedProducts,
      total,
      hasMore: start + pageSize < total,
    };
  } catch (error) {
    console.error("Error filtering products:", error);
    return {
      products: [],
      total: 0,
      hasMore: false,
    };
  }
}

export async function getProductSlugByImage(imageUrl: string): Promise<string | null> {
  try {
    const rows = await sql`
      SELECT slug FROM products 
      WHERE image = ${imageUrl} OR images @> ${JSON.stringify([imageUrl])}::jsonb
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return rows[0].slug as string;
  } catch (error) {
    console.error("Error fetching product slug by image:", error);
    return null;
  }
}



