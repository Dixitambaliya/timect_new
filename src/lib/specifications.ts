import type { CatalogFilter, SpecCriterion } from "@/data/categoryFilters";

/** Minimal product shape for catalog matching (avoids circular import with db/actions). */
export type SpecMatchableProduct = {
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  collection?: string;
  brand?: string;
  code?: string;
  gender?: string;
  tag?: string;
  sizes?: string[];
  specifications?: {
    title: string;
    type: string;
    items?: any[];
    content?: string;
  }[];
};

/**
 * Flatten a specifications JSONB tree into searchable text tokens and structured rows.
 * Supports mixed section shapes used by Timect:
 * - type "details": string[] like "Material: Stainless steel"
 * - type "grid": { label, value }[]
 * - type "text": content string
 */
export function flattenSpecifications(
  specs: SpecMatchableProduct["specifications"] | null | undefined,
): {
  text: string;
  rows: { section: string; label: string; value: string }[];
} {
  const rows: { section: string; label: string; value: string }[] = [];
  if (!specs || !Array.isArray(specs)) {
    return { text: "", rows };
  }

  for (const section of specs) {
    const sectionTitle = (section.title || "").trim();

    if (section.type === "grid" && Array.isArray(section.items)) {
      for (const item of section.items) {
        if (item && typeof item === "object") {
          const label = String(item.label ?? "").trim();
          const value = String(item.value ?? "").trim();
          if (label || value) {
            rows.push({ section: sectionTitle, label, value });
          }
        } else if (typeof item === "string") {
          const parsed = parseDetailLine(item);
          rows.push({
            section: sectionTitle,
            label: parsed.label,
            value: parsed.value,
          });
        }
      }
    } else if (section.type === "details" && Array.isArray(section.items)) {
      for (const item of section.items) {
        if (typeof item === "string") {
          const parsed = parseDetailLine(item);
          rows.push({
            section: sectionTitle,
            label: parsed.label,
            value: parsed.value,
          });
        } else if (item && typeof item === "object") {
          rows.push({
            section: sectionTitle,
            label: String(item.label ?? "").trim(),
            value: String(item.value ?? "").trim(),
          });
        }
      }
    } else if (section.type === "text" && section.content) {
      rows.push({
        section: sectionTitle,
        label: sectionTitle,
        value: String(section.content),
      });
    } else if (Array.isArray(section.items)) {
      // Unknown type -best-effort walk
      for (const item of section.items) {
        if (typeof item === "string") {
          const parsed = parseDetailLine(item);
          rows.push({
            section: sectionTitle,
            label: parsed.label,
            value: parsed.value,
          });
        } else if (item && typeof item === "object") {
          rows.push({
            section: sectionTitle,
            label: String(item.label ?? "").trim(),
            value: String(item.value ?? item.content ?? "").trim(),
          });
        }
      }
    }
  }

  const text = rows
    .map((r) => [r.section, r.label, r.value].filter(Boolean).join(" "))
    .join(" ")
    .toLowerCase();

  return { text, rows };
}

function parseDetailLine(line: string): { label: string; value: string } {
  const idx = line.indexOf(":");
  if (idx === -1) {
    return { label: "", value: line.trim() };
  }
  return {
    label: line.slice(0, idx).trim(),
    value: line.slice(idx + 1).trim(),
  };
}

/** Full searchable blob for a product (specs + catalog fields). */
export function productSearchBlob(product: SpecMatchableProduct): string {
  const { text: specText } = flattenSpecifications(product.specifications);
  const parts = [
    product.name,
    product.title,
    product.subtitle,
    product.description,
    product.collection,
    product.brand,
    product.code,
    product.gender,
    product.tag,
    ...(product.sizes || []),
    specText,
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function includesInsensitive(haystack: string, needle: string): boolean {
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function criterionMatches(
  rows: { section: string; label: string; value: string }[],
  blob: string,
  criterion: SpecCriterion,
): boolean {
  const values = criterion.values.filter(Boolean);
  if (values.length === 0) return true;

  const scopedRows = rows.filter((row) => {
    if (criterion.section && !includesInsensitive(row.section, criterion.section)) {
      return false;
    }
    if (criterion.label && !includesInsensitive(row.label, criterion.label)) {
      return false;
    }
    return true;
  });

  // Prefer structured rows when section/label scoping is used
  if (criterion.section || criterion.label) {
    return values.some((v) =>
      scopedRows.some(
        (row) =>
          includesInsensitive(row.value, v) ||
          includesInsensitive(row.label, v) ||
          includesInsensitive(`${row.label} ${row.value}`, v),
      ),
    );
  }

  // Unscoped: match structured rows OR full product blob
  return values.some(
    (v) =>
      scopedRows.some(
        (row) =>
          includesInsensitive(row.value, v) ||
          includesInsensitive(row.label, v) ||
          includesInsensitive(row.section, v),
      ) || includesInsensitive(blob, v),
  );
}

function groupMatches(
  rows: { section: string; label: string; value: string }[],
  blob: string,
  group: SpecCriterion[],
): boolean {
  return group.every((c) => criterionMatches(rows, blob, c));
}

/**
 * Returns true if the product satisfies a catalog category filter definition.
 */
export function productMatchesCatalogFilter(
  product: SpecMatchableProduct,
  filter: CatalogFilter,
): boolean {
  // Gender gate (when specified)
  if (filter.genders && filter.genders.length > 0) {
    if (!product.gender || !filter.genders.includes(product.gender)) {
      // Allow keyword path for ladies etc. when gender missing but text matches
      if (!filter.keywordsAny?.length && !filter.anyOfGroups?.length) {
        return false;
      }
      // If only genders defined, fail; if other criteria exist, still require gender when set on product
      if (!filter.anyOfGroups?.length && !filter.keywordsAny?.length && !filter.keywordsAll?.length) {
        return false;
      }
      if (product.gender && !filter.genders.includes(product.gender)) {
        // For combined filters like rose-ladies, gender is a hard gate when present
        if (filter.slug === "rose-ladies" || filter.slug === "ladies" || filter.slug === "him" || filter.slug === "her") {
          return false;
        }
      }
    }
  }

  // Gender-only filters (him / her)
  if (
    filter.genders &&
    !filter.anyOfGroups?.length &&
    !filter.keywordsAny?.length &&
    !filter.keywordsAll?.length
  ) {
    return !!product.gender && filter.genders.includes(product.gender);
  }

  const { rows } = flattenSpecifications(product.specifications);
  const blob = productSearchBlob(product);

  let matched = false;

  if (filter.anyOfGroups && filter.anyOfGroups.length > 0) {
    matched = filter.anyOfGroups.some((group) => groupMatches(rows, blob, group));
  }

  if (!matched && filter.keywordsAny && filter.keywordsAny.length > 0) {
    matched = filter.keywordsAny.some((kw) => includesInsensitive(blob, kw));
  }

  if (filter.keywordsAll && filter.keywordsAll.length > 0) {
    const allOk = filter.keywordsAll.every((kw) => includesInsensitive(blob, kw));
    if (filter.anyOfGroups?.length || filter.keywordsAny?.length) {
      matched = matched && allOk;
    } else {
      matched = allOk;
    }
  }

  // Gender soft-and for ladies when already matched by keywords
  if (matched && filter.genders && filter.genders.length > 0 && product.gender) {
    if (
      filter.slug === "ladies" ||
      filter.slug === "rose-ladies" ||
      filter.slug === "him" ||
      filter.slug === "her"
    ) {
      return filter.genders.includes(product.gender);
    }
  }

  return matched;
}

/**
 * Keywords used for a PostgreSQL JSONB pre-filter (ILIKE / regex).
 * Keeps SQL result sets small before precise JS matching.
 */
export function catalogFilterSqlKeywords(filter: CatalogFilter): string[] {
  const set = new Set<string>();
  for (const kw of filter.keywordsAny || []) set.add(kw);
  for (const kw of filter.keywordsAll || []) set.add(kw);
  for (const group of filter.anyOfGroups || []) {
    for (const c of group) {
      for (const v of c.values) {
        // Skip ultra-generic tokens for SQL prefilter
        if (v.length >= 3 && v.toLowerCase() !== "mm") set.add(v);
      }
    }
  }
  return Array.from(set);
}
