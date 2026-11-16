const FALLBACK_SITE_URL = "https://www.timectwatches.com";

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
  name: "Timect Watches",
  shortName: "Timect",
  legalName: "Timect Watches",
  alternateNames: ["TIMECT", "Timect Watch", "Timect Watches India"],
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  title: "Timect Watches | Official Website",
  description:
    "Discover Timect Watches on the official website. Explore men's and women's wristwatches, chronographs, quartz timepieces, new arrivals, and corporate watch gifts.",
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
  brand: absoluteUrl("/#brand"),
  website: absoluteUrl("/#website"),
} as const;
