import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken } from "@/admin/lib/auth";
import { ADMIN_COOKIE } from "@/admin/lib/constants";
import { ADMIN_HOST, PUBLIC_HOSTS, adminPath, isAdminHost, isAdminPath } from "@/admin/lib/routing";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.nextUrl.hostname.toLowerCase();
  const subdomain = isAdminHost(host);
  if (PUBLIC_HOSTS.includes(host) && isAdminPath(pathname)) {
    const target = request.nextUrl.clone();
    target.protocol = "https:";
    target.host = ADMIN_HOST;
    target.port = "";
    target.pathname = adminPath(pathname, true);
    return NextResponse.redirect(target, 307);
  }
  // Keep APIs and framework assets on their existing paths.
  if (subdomain && (pathname === "/api" || pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") || ["/favicon.ico", "/icon.png", "/apple-icon.png", "/robots.txt", "/sitemap.xml"].includes(pathname))) {
    return NextResponse.next();
  }
  if (subdomain && isAdminPath(pathname)) {
    const target = request.nextUrl.clone();
    target.pathname = adminPath(pathname, true);
    return NextResponse.redirect(target, 307);
  }
  if (!subdomain && !isAdminPath(pathname)) return NextResponse.next();
  const internalPath = subdomain ? `/admin${pathname === "/" ? "" : pathname}` : pathname;
  const visiblePath = (path: string) => adminPath(path, subdomain);
  const isLogin = internalPath === "/admin/login" || internalPath.startsWith("/admin/login/");
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const valid = token ? Boolean(await verifyAdminToken(token)) : false;
  if (isLogin && valid) {
    return NextResponse.redirect(new URL(visiblePath("/admin/dashboard"), request.url));
  }
  if (!isLogin && !valid) {
    const target = new URL(visiblePath("/admin/login"), request.url);
    target.searchParams.set("next", pathname + request.nextUrl.search);
    const response = NextResponse.redirect(target);
    if (token) response.cookies.set(ADMIN_COOKIE, "", {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0,
    });
    return response;
  }
  if (subdomain) {
    const target = request.nextUrl.clone();
    target.pathname = internalPath;
    return NextResponse.rewrite(target);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
