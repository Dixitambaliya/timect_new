import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  verifyAdminToken,
  type AdminSessionPayload,
} from "./auth";
import type { AdminRole } from "./constants";

export type AdminSession = {
  id: number;
  email: string;
  fullName: string;
  role: AdminRole;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAdminToken(token);
  if (!payload?.sub) return null;

  return {
    id: Number(payload.sub),
    email: String(payload.email),
    fullName: String(payload.fullName || ""),
    role: payload.role as AdminRole,
  };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function setAdminSessionCookie(
  token: string,
  maxAge?: number,
): Promise<void> {
  const jar = await cookies();
  const opts = adminCookieOptions(maxAge);
  jar.set(opts.name, token, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function sessionFromPayload(
  payload: AdminSessionPayload,
): AdminSession {
  return {
    id: Number(payload.sub),
    email: String(payload.email),
    fullName: String(payload.fullName || ""),
    role: payload.role as AdminRole,
  };
}
