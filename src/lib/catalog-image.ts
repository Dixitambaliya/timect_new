/** Default catalog placeholder when a product has no image URL. */
export const CATALOG_FALLBACK_IMAGE =
  "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048474/timect/image_4.png";

/**
 * Cloudinary-optimized thumbnail for grid cards (small, auto format/quality).
 * Non-Cloudinary URLs are returned unchanged.
 */
export function catalogThumbUrl(
  url?: string | null,
  width = 480,
): string {
  if (!url) return CATALOG_FALLBACK_IMAGE;
  if (url.startsWith("data:")) return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  // Avoid double-transforming
  if (/\/upload\/[^/]*[fw]_\d+/.test(url)) return url;
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_limit,w_${width}/`,
  );
}

/** Generate width candidates only when Cloudinary can resize the original URL. */
export function catalogThumbSrcSet(url: string | null | undefined, widths: number[]): string | undefined {
  if (!url || widths.length < 2) return undefined;
  if (catalogThumbUrl(url, widths[0]) === catalogThumbUrl(url, widths[1])) return undefined;
  return widths.map((width) => `${catalogThumbUrl(url, width)} ${width}w`).join(", ");
}
