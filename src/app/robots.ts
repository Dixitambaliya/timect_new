import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_CONFIG } from "@/lib/seo/site-config";

const privatePaths = ["/admin", "/admin/", "/api", "/api/", "/search"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      { userAgent: ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "ClaudeBot"], allow: "/", disallow: privatePaths },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_CONFIG.url,
  };
}
