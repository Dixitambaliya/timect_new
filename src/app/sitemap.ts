import type { MetadataRoute } from "next";
import { sql } from "@/db/neon";
import { absoluteUrl } from "@/lib/seo/site-config";
import { isValidPublicSlug } from "@/lib/seo/seo-validation";
import { getCatalogFilters } from "@/db/content";
import { FIXED_CATALOG_LANDINGS } from "@/lib/seo/catalog-pages";

// Always rebuild the XML from the current database so newly published blog
// posts appear without waiting for a deployment or a cached sitemap refresh.
export const dynamic = "force-dynamic";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: absoluteUrl("/watches"), changeFrequency: "weekly", priority: 0.9 },
  { url: absoluteUrl("/blog"), changeFrequency: "daily", priority: 0.9 },
  { url: absoluteUrl("/corporate-gifting"), changeFrequency: "monthly", priority: 0.7 },
  { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
  { url: absoluteUrl("/faqs"), changeFrequency: "monthly", priority: 0.7 },
  { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const filters = await getCatalogFilters();
    const catalogLandingSlugs = [
      ...Object.keys(FIXED_CATALOG_LANDINGS),
      ...Object.keys(filters).filter((slug) => !["him", "her"].includes(slug)),
    ];
    const catalogLandings: MetadataRoute.Sitemap = Array.from(new Set(catalogLandingSlugs)).map((slug) => ({
      url: absoluteUrl(`/watches/${slug}`),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    const rows = await sql`SELECT slug, image FROM products WHERE status = 'published' AND slug IS NOT NULL ORDER BY id ASC`;
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
    // Fetch published blog posts
    const blogRows = await sql`
      SELECT p.slug, p.updated_at
      FROM blog_posts p
      LEFT JOIN blog_post_seo seo ON seo.blog_post_id = p.id
      WHERE p.status = 'published'
        AND p.slug IS NOT NULL
        AND COALESCE(seo.robots_index, TRUE) = TRUE
      ORDER BY p.published_at DESC
    `;
    const blogPosts: MetadataRoute.Sitemap = blogRows
      .filter((post) => isValidPublicSlug(post.slug))
      .map((post) => ({
        url: absoluteUrl(`/blog/${post.slug}`),
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    // Fetch blog categories
    const catRows = await sql`SELECT slug FROM blog_categories`;
    const blogCategories: MetadataRoute.Sitemap = catRows
      .filter((category) => isValidPublicSlug(category.slug))
      .map((category) => ({
        url: absoluteUrl(`/blog/category/${category.slug}`),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...catalogLandings, ...products, ...blogPosts, ...blogCategories];
  } catch (error) {
    console.error("Unable to build sitemap:", error);
    return staticRoutes;
  }
}
