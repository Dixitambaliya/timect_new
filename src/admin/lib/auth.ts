import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import {
  ADMIN_COOKIE,
  ADMIN_MAX_INACTIVITY_SECONDS,
  ADMIN_REMEMBER_ME_SECONDS,
  ADMIN_SESSION_SECONDS,
  ADMIN_TOKEN_MAX_AGE_SECONDS,
  type AdminRole,
} from "./constants";

export type AdminSessionPayload = JWTPayload & {
  sub: string;
  email: string;
  fullName: string;
  role: AdminRole;
  rememberMe?: boolean;
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

export async function signAdminToken(
  payload: {
    id: number;
    email: string;
    fullName: string;
    role: AdminRole;
  },
  options?: {
    rememberMe?: boolean;
    maxAge?: number;
  },
): Promise<string> {
  const maxAge =
    options?.maxAge ??
    (options?.rememberMe ? ADMIN_REMEMBER_ME_SECONDS : ADMIN_SESSION_SECONDS);

  return new SignJWT({
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
    rememberMe: Boolean(options?.rememberMe),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.id))
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getJwtSecret());
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.sub || !payload.email || !payload.role) return null;

    // Inactivity check: if token was issued more than 90 days ago, invalidate it
    const now = Math.floor(Date.now() / 1000);
    const iat = payload.iat || 0;
    if (now - iat > ADMIN_MAX_INACTIVITY_SECONDS) {
      return null;
    }

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
