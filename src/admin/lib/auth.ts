import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import {
  ADMIN_COOKIE,
  ADMIN_TOKEN_MAX_AGE_SECONDS,
  type AdminRole,
} from "./constants";

export type AdminSessionPayload = JWTPayload & {
  sub: string;
  email: string;
  fullName: string;
  role: AdminRole;
};

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_JWT_SECRET ||
    process.env.JWT_SECRET ||
    // Dev fallback -set ADMIN_JWT_SECRET in production
    "timect-dev-admin-jwt-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function signAdminToken(payload: {
  id: number;
  email: string;
  fullName: string;
  role: AdminRole;
}): Promise<string> {
  return new SignJWT({
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.id))
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_TOKEN_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.sub || !payload.email || !payload.role) return null;
    return payload as AdminSessionPayload;
  } catch {
    return null;
  }
}

export function adminCookieOptions(maxAge = ADMIN_TOKEN_MAX_AGE_SECONDS) {
  return {
    name: ADMIN_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export { ADMIN_COOKIE };
