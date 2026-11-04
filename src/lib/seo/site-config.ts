const FALLBACK_SITE_URL = "https://timect.com";

function normalizeSiteUrl(value?: string): string {
  const candidate = value?.trim();
  if (!candidate || /localhost|127\.0\.0\.1/i.test(candidate)) return FALLBACK_SITE_URL;
  try {
    const url = new URL(candidate);
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_CONFIG = {
  name: "TIMECT",
  legalName: "TIMECT",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  title: "TIMECT | Precision Watches & Refined Timepieces",
  description:
    "Discover TIMECT watches, thoughtfully designed timepieces with distinctive collections and detailed watch specifications.",
  locale: "en_IN",
  language: "en",
  currency: "INR",
  logo: "/images/timect_logo.png",
} as const;

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, `${SITE_CONFIG.url}/`).toString();
}

export const SEO_IDS = {
  organization: absoluteUrl("/#organization"),
  website: absoluteUrl("/#website"),
} as const;
