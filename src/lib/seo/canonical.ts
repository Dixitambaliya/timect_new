import { absoluteUrl } from "./site-config";

/** Canonicals never include query strings, fragments, or trailing slashes (except home). */
export function canonicalUrl(path: string): string {
  const url = new URL(absoluteUrl(path));
  url.search = "";
  url.hash = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}
