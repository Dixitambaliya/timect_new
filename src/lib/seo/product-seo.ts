import type { Product } from "@/db/actions";
import { flattenSpecifications } from "@/lib/specifications";
import { canonicalUrl } from "./canonical";
import { absoluteUrl } from "./site-config";
import { breadcrumbSchema, webPageSchema, type JsonLdValue } from "./structured-data";

function clean(value?: string): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function specValue(product: Product, patterns: RegExp[]): string | undefined {
  const row = flattenSpecifications(product.specifications).rows.find((item) =>
    patterns.some((pattern) => pattern.test(`${item.section} ${item.label}`)),
  );
  return row?.value || undefined;
}

export function productName(product: Product): string {
  return clean(product.title || product.name) || "TIMECT watch";
}

export function productSeoDescription(product: Product): string {
  const name = productName(product);
  const attributes = [
    product.brand && `${product.brand} brand`,
    product.collection && `${product.collection} collection`,
    specValue(product, [/movement type/i, /movement$/i]),
    specValue(product, [/dimension/i, /case diameter/i]),
    specValue(product, [/dial color/i]),
    specValue(product, [/material/i]),
  ].filter(Boolean);
  const detail = attributes.length ? ` featuring ${attributes.join(", ")}` : "";
  const source = clean(product.description || product.subtitle);
  return (source ? `${name}. ${source}` : `Explore the ${name}${detail} and view its verified watch specifications.`).slice(0, 320);
}

export function productSchemas(product: Product): JsonLdValue[] {
  const name = productName(product);
  const url = canonicalUrl(`/product/${encodeURIComponent(product.slug)}`);
  const images = [product.image, ...(product.images || [])].filter((image): image is string => Boolean(image));
  const rows = flattenSpecifications(product.specifications).rows.filter((row) => row.value);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name,
    url,
    description: productSeoDescription(product),
    ...(images.length ? { image: Array.from(new Set(images)).map(absoluteUrl) } : {}),
    ...(product.code ? { sku: product.code, mpn: product.code } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.collection ? { category: product.collection } : {}),
    additionalProperty: rows.slice(0, 30).map((row) => ({
      "@type": "PropertyValue",
      name: row.label || row.section,
      value: row.value,
    })),
  };
  return [
    schema,
    webPageSchema({ name, description: productSeoDescription(product), path: `/product/${product.slug}`, type: "ItemPage" }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Watches", path: "/watches" },
      { name, path: `/product/${product.slug}` },
    ]),
  ];
}
