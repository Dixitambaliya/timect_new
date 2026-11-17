/**
 * Utility to format price strings to always have the rupee symbol (₹) and clean/proper formatting.
 */
export function formatPrice(price: string | number | undefined | null): string {
  if (price === undefined || price === null) return "";
  const priceStr = String(price).trim();
  if (!priceStr) return "";

  const cleaned = priceStr.replace(/[^\d.]/g, "");
  if (!cleaned) {
    return priceStr.startsWith("₹") ? priceStr : `₹${priceStr}`;
  }

  const num = parseFloat(cleaned);
  if (isNaN(num)) {
    return priceStr.startsWith("₹") ? priceStr : `₹${priceStr}`;
  }

  try {
    const hasDecimal = priceStr.includes(".");
    const formatter = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: hasDecimal ? 2 : 0,
      maximumFractionDigits: 2,
    });
    return `₹${formatter.format(num)}`;
  } catch (e) {
    return priceStr.startsWith("₹") ? priceStr : `₹${priceStr}`;
  }
}

/** Storefront label: zero / missing prices read as "Price on request". */
export function displayPrice(price: string | number | undefined | null): string {
  const n = parseFloat(String(price ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? formatPrice(price) : "Price on request";
}

export function parsePriceNumber(price: string | number | undefined | null): number {
  if (price === undefined || price === null) return 0;
  const cleaned = String(price).replace(/[^\d.]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function isNumericPrice(price: string | number | undefined | null): boolean {
  if (!price) return false;
  const num = parsePriceNumber(price);
  return num > 0;
}

export function calculateDiscount(
  currentPrice: string | number | undefined | null,
  originalPrice: string | number | undefined | null,
): number {
  const current = parsePriceNumber(currentPrice);
  const original = parsePriceNumber(originalPrice);
  if (original <= 0 || current <= 0 || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}
