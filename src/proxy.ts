import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_COOKIE, ADMIN_MAX_INACTIVITY_SECONDS } from "@/admin/lib/constants";

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_JWT_SECRET ||
    process.env.JWT_SECRET ||
    "timect-dev-admin-jwt-secret-change-me";
  return new TextEncoder().encode(secret);
}

/**
 * Next.js 16 Proxy (formerly middleware).
 * Protects /admin/* except /admin/login.
 * Does not touch storefront routes.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  let valid = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      if (payload.sub && payload.email && payload.role) {
        const now = Math.floor(Date.now() / 1000);
        const iat = payload.iat || 0;
        // Invalidate if inactive for more than 90 days
        if (now - iat <= ADMIN_MAX_INACTIVITY_SECONDS) {
          valid = true;
        }
      }
    } catch {
      valid = false;
    }
  }

  // Authenticated users visiting login → dashboard
  if (isLogin && valid) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Unauthenticated users on protected admin routes → login
  if (!isLogin && !valid) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const res = NextResponse.redirect(loginUrl);
    // Clear stale cookie if present
    if (token) {
      res.cookies.set(ADMIN_COOKIE, "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
      });
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
