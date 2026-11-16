import type { Product } from "@/db/actions";
import { flattenSpecifications } from "@/lib/specifications";
import { canonicalUrl } from "./canonical";
import { absoluteUrl, SEO_IDS, SITE_CONFIG } from "./site-config";
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
  return clean(product.title || product.name) || "Timect watch";
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

export function productMetaDescription(product: Product): string {
  const name = productName(product);
  const movement = specValue(product, [/movement type/i, /movement$/i]);
  const caseSize = specValue(product, [/dimension/i, /case diameter/i]);
  const details = [movement, caseSize, product.collection].filter(Boolean).join(", ");
  return `Explore the ${name}${details ? ` with ${details}` : ""} from Timect Watches. View images, specifications, price, and enquire on the official website.`.slice(0, 180);
}

function numericPrice(value: string): number | null {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function productSchemas(product: Product): JsonLdValue[] {
  const name = productName(product);
  const url = canonicalUrl(`/product/${encodeURIComponent(product.slug)}`);
  const images = [product.image, ...(product.images || [])].filter((image): image is string => Boolean(image));
  const rows = flattenSpecifications(product.specifications).rows.filter((row) => row.value);
  const price = numericPrice(product.price);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name,
    url,
    description: productSeoDescription(product),
    ...(images.length ? { image: Array.from(new Set(images)).map(absoluteUrl) } : {}),
    ...(product.code ? { sku: product.code, mpn: product.code } : {}),
    brand: product.brand && !/^(timect|timect)( watches?)?$/i.test(product.brand)
      ? { "@type": "Brand", name: product.brand }
      : { "@id": SEO_IDS.brand, "@type": "Brand", name: SITE_CONFIG.name },
    ...(product.collection ? { category: product.collection } : {}),
    ...(price ? {
      offers: {
        "@type": "Offer",
        url,
        price,
        priceCurrency: SITE_CONFIG.currency,
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": SEO_IDS.organization },
      },
    } : {}),
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
