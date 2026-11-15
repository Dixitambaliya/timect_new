import type { Product, Specification, Variant } from "@/db/actions";
import { formatPrice } from "@/lib/price";

/** Map DB snake_case row → Product (shared with storefront model) */
export function mapRowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as number,
    slug: (row.slug as string) || "",
    status: row.status === "draft" ? "draft" : "published",
    name: (row.name as string) || undefined,
    price: formatPrice(row.price as string),
    image: (row.image as string) || undefined,
    isMainProduct: Boolean(row.is_main_product),
    isNewArrival: Boolean(row.is_new_arrival),
    isRecommended: Boolean(row.is_recommended),
    isRelated: Boolean(row.is_related),
    brand: (row.brand as string) || undefined,
    title: (row.title as string) || undefined,
    subtitle: (row.subtitle as string) || undefined,
    priceSubtext: (row.price_subtext as string) || undefined,
    sizes: (row.sizes as string[]) || undefined,
    images: (row.images as string[]) || undefined,
    variants: (row.variants as Variant[]) || undefined,
    specifications: (row.specifications as Specification[]) || undefined,
    tag: (row.tag as string) || undefined,
    code: (row.code as string) || undefined,
    collection: (row.collection as string) || undefined,
    description: (row.description as string) || undefined,
    gender: (row.gender as string) || undefined,
    rating: (() => {
      if (row.rating == null || row.rating === "") return undefined;
      const n = parseFloat(String(row.rating));
      return Number.isFinite(n) ? n : undefined;
    })(),
    hoverImage: (row.hover_image as string) || undefined,
  };
}

/** Full editable product payload used by the admin form */
export type ProductInput = {
  status?: "published" | "draft";
  name?: string;
  slug?: string;
  brand?: string;
  collection?: string;
  code?: string;
  description?: string;
  tag?: string;
  gender?: string;
  price: string;
  priceSubtext?: string;
  title?: string;
  subtitle?: string;
  isMainProduct?: boolean;
  isNewArrival?: boolean;
  isRecommended?: boolean;
  isRelated?: boolean;
  image?: string;
  hoverImage?: string;
  images?: string[];
  sizes?: string[];
  variants?: Variant[];
  specifications?: Specification[];
  rating?: number;
};

export function emptyProductInput(): ProductInput {
  return {
    status: "published",
    name: "",
    slug: "",
    brand: "",
    collection: "",
    code: "",
    description: "",
    tag: "",
    gender: "Unisex",
    price: "",
    priceSubtext: "",
    title: "",
    subtitle: "",
    isMainProduct: false,
    isNewArrival: false,
    isRecommended: false,
    isRelated: false,
    image: "",
    hoverImage: "",
    images: [],
    sizes: [],
    variants: [],
    specifications: [],
    rating: 4.5,
  };
}

export function productToInput(p: Product): ProductInput {
  return {
    status: p.status,
    name: p.name || p.title || "",
    slug: p.slug || "",
    brand: p.brand || "",
    collection: p.collection || "",
    code: p.code || "",
    description: p.description || p.subtitle || "",
    tag: p.tag || "",
    gender: p.gender || "Unisex",
    price: p.price || "",
    priceSubtext: p.priceSubtext || "",
    title: p.title || p.name || "",
    subtitle: p.subtitle || p.description || "",
    isMainProduct: p.isMainProduct,
    isNewArrival: p.isNewArrival,
    isRecommended: p.isRecommended,
    isRelated: p.isRelated,
    image: p.image || p.images?.[0] || "",
    hoverImage: p.hoverImage || "",
    images: p.images?.length ? [...p.images] : p.image ? [p.image] : [],
    sizes: p.sizes ? [...p.sizes] : [],
    variants: p.variants ? p.variants.map((v) => ({ ...v })) : [],
    specifications: p.specifications
      ? JSON.parse(JSON.stringify(p.specifications))
      : [],
    rating: p.rating ?? 4.5,
  };
}
