import type { MetadataRoute } from "next";
import { sql } from "@/db/neon";
import { absoluteUrl } from "@/lib/seo/site-config";
import { isValidPublicSlug } from "@/lib/seo/seo-validation";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: absoluteUrl("/watches"), changeFrequency: "weekly", priority: 0.9 },
  { url: absoluteUrl("/corporate-gifting"), changeFrequency: "monthly", priority: 0.7 },
  { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
  { url: absoluteUrl("/faqs"), changeFrequency: "monthly", priority: 0.7 },
  { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const rows = await sql`SELECT slug, image FROM products WHERE slug IS NOT NULL ORDER BY id ASC`;
    const seen = new Set<string>();
    const products: MetadataRoute.Sitemap = [];
    for (const row of rows) {
      const slug = row.slug;
      if (!isValidPublicSlug(slug) || seen.has(slug)) continue;
      seen.add(slug);
      products.push({
        url: absoluteUrl(`/product/${slug}`),
        changeFrequency: "weekly",
        priority: 0.8,
        ...(typeof row.image === "string" && /^https?:\/\//.test(row.image) ? { images: [row.image] } : {}),
      });
    }
    return [...staticRoutes, ...products];
  } catch (error) {
    console.error("Unable to build product sitemap:", error);
    return staticRoutes;
  }
}
