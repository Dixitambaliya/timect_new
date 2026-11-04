import type { StorefrontSettings } from "@/data/storefront";
import { createElement } from "react";
import { absoluteUrl, SEO_IDS, SITE_CONFIG } from "./site-config";

export type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

export function serializeJsonLd(value: JsonLdValue): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: JsonLdValue }) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: serializeJsonLd(data) },
  });
}

export function siteGraph(storefront: StorefrontSettings): JsonLdValue {
  const sameAs = Object.values(storefront.social).filter((url) => /^https?:\/\//i.test(url));
  const contactEmail = storefront.contact.careEmail || storefront.contact.serviceEmail;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": SEO_IDS.organization,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: { "@type": "ImageObject", url: absoluteUrl(SITE_CONFIG.logo) },
        ...(contactEmail ? { email: contactEmail } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": SEO_IDS.website,
        url: SITE_CONFIG.url,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        publisher: { "@id": SEO_IDS.organization },
        inLanguage: SITE_CONFIG.language,
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl("/search")}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function webPageSchema(input: { name: string; description: string; path: string; type?: string }): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": input.type || "WebPage",
    "@id": `${absoluteUrl(input.path)}#webpage`,
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    isPartOf: { "@id": SEO_IDS.website },
    about: { "@id": SEO_IDS.organization },
    inLanguage: SITE_CONFIG.language,
  };
}
