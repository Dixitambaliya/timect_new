import type { Metadata } from "next";
import { canonicalUrl } from "./canonical";
import { absoluteUrl, SITE_CONFIG } from "./site-config";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
};

export function createPageMetadata({ title, description, path, image, noIndex, keywords }: PageMetadataInput): Metadata {
  const canonical = canonicalUrl(path);
  const socialImage = absoluteUrl(image || SITE_CONFIG.logo);
  const fullTitle = /timect/i.test(title) ? title : `${title} | ${SITE_CONFIG.name}`;
  return {
    title: { absolute: fullTitle },
    description,
    ...(keywords?.length ? { keywords } : {}),
    category: "Watches",
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      url: canonical,
      title: fullTitle,
      description,
      images: [{ url: socialImage, alt: `${SITE_CONFIG.name} watches` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [socialImage],
    },
  };
}
