export const SITE_NAME = "Timect";

/** Canonical origin. Set NEXT_PUBLIC_SITE_URL in each deployment environment. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://timect.com").replace(/\/$/, "");

/** Serialize JSON-LD safely for inline <script> (escapes `<` to block tag injection). */
export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** "₹ 1,30,000" / "₹225,000.00" → 130000 / 225000 */
export function priceToNumber(price: string | undefined | null): number | null {
  if (!price) return null;
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}
