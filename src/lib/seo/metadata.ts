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

export function toOpenGraphImage(url: string): string {
  if (!url) return url;
  // If it's a Cloudinary image, generate a 1200x630 1.91:1 banner (< 50KB) to ensure WhatsApp & social platforms render a full-width large card preview
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    if (!url.includes("/image/upload/c_")) {
      return url.replace("/image/upload/", "/image/upload/c_pad,b_white,w_1200,h_630,q_auto:good,f_jpg/");
    }
  }
  return url;
}

export function createPageMetadata({ title, description, path, image, noIndex, keywords }: PageMetadataInput): Metadata {
  const canonical = canonicalUrl(path);
  const rawImage = absoluteUrl(image || SITE_CONFIG.logo);
  const socialImage = toOpenGraphImage(rawImage);
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
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [socialImage],
    },
  };
}
