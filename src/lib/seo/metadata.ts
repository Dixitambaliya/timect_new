import type { Metadata } from "next";
import { canonicalUrl } from "./canonical";
import { absoluteUrl, SITE_CONFIG } from "./site-config";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
};

export function createPageMetadata({ title, description, path, image, noIndex }: PageMetadataInput): Metadata {
  const canonical = canonicalUrl(path);
  const socialImage = absoluteUrl(image || SITE_CONFIG.logo);
  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      url: canonical,
      title,
      description,
      images: [{ url: socialImage, alt: `${SITE_CONFIG.name} watches` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}
