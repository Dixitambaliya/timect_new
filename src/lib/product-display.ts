/** Split catalog names like `Presage Classic Series … - HCC008J1` into title + reference. */
export function splitProductName(name: string | undefined | null, code?: string | null) {
  const raw = (name || "").trim();
  const m = raw.match(/^(.*?)\s+[-–—]\s+([A-Z0-9][A-Z0-9-]{3,})$/);
  if (m) return { title: m[1].replace(/^"|"$/g, ""), reference: code || m[2] };
  return { title: raw, reference: code || "" };
}

/** All-caps catalog strings ("HYDROCONQUEST EXCLUSIVE EDITION") read better in title case at display sizes. */
export function displayCase(s: string) {
  if (!s || s !== s.toUpperCase() || !/[A-Z]{4,}/.test(s)) return s;
  return s.toLowerCase().replace(/(^|[\s\-–—(/"])([a-z])/g, (_, pre: string, c: string) => pre + c.toUpperCase());
}
