export const ADMIN_HOST = "admin.timectwatches.com";
export const PUBLIC_HOSTS = ["timectwatches.com", "www.timectwatches.com"];

export function isAdminHost(host: string) {
  return host.toLowerCase().split(":")[0] === ADMIN_HOST;
}

export function isAdminPath(path: string) {
  return path === "/admin" || path.startsWith("/admin/");
}

export function adminPath(path: string, subdomain: boolean) {
  if (!subdomain || !/^\/admin(?=[/?#]|$)/.test(path)) return path;
  const result = path.slice(6);
  return !result || result.startsWith("?") || result.startsWith("#") ? `/${result}` : result;
}
