/**
 * Cloudinary delivery helpers.
 * Product originals are uploaded as multi-megabyte PNGs — never ship them raw.
 * `cld()` injects on-the-fly resizing + automatic AVIF/WebP negotiation.
 */

const UPLOAD_SEGMENT = "/image/upload/";

export type CldOptions = {
  /** Target pixel width (resized with c_limit — never upscaled). */
  w?: number;
  /** Explicit quality; defaults to q_auto. */
  q?: number;
};

export function isCloudinary(src: string | undefined | null): src is string {
  return !!src && src.includes("res.cloudinary.com") && src.includes(UPLOAD_SEGMENT);
}

export function cld(src: string | undefined | null, { w, q }: CldOptions = {}): string {
  if (!src) return "";
  if (!isCloudinary(src)) return src;
  const [head, tail] = src.split(UPLOAD_SEGMENT);
  // Skip if a transformation is already present (first segment isn't the version).
  if (!/^v\d+\//.test(tail)) return src;
  const parts = ["f_auto", q ? `q_${q}` : "q_auto", "c_limit"];
  if (w) parts.push(`w_${Math.round(w)}`);
  return `${head}${UPLOAD_SEGMENT}${parts.join(",")}/${tail}`;
}

/** Responsive srcset for plain <img> elements. */
export function cldSrcSet(src: string | undefined | null, widths: number[] = [480, 800, 1200, 1600]) {
  if (!isCloudinary(src) || cld(src) === src) return undefined; // not transformable / already sized
  return widths.map((w) => `${cld(src, { w })} ${w}w`).join(", ");
}

/** `next/image` loader — only usable from client components. */
export function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!isCloudinary(src)) return src;
  return cld(src, { w: width, q: quality && quality !== 75 ? quality : undefined });
}

/** Brand imagery (Timect-branded photography) shared across the storefront. */
export const BRAND_IMAGES = {
  heroBlue:
    "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048469/timect/Gemini_Generated_Image_hepk3vhepk3vhepk_copy.jpg",
  dayDateBlue: "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048468/timect/daydate_blue.png",
  roseGentsDate: "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048487/timect/rose_gents_date.png",
  goldChronograph: "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048470/timect/gold_truton_chronograph.jpg",
  roseLadies: "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048491/timect/rose_ladies.png",
  /** Local only — not mirrored on Cloudinary. */
  blackWhite: "/images/img_10.jpg",
  forHim: "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048483/timect/man_watch_cat.jpg",
  forHer: "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048495/timect/woman_watch_cat.jpg",
} as const;

/** Logo served locally (transparent PNG, black glyph). Invert via CSS on dark grounds. */
export const LOGO_SRC = "/images/timect_logo.png";
