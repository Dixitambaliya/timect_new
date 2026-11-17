"use server";
import { adminServerPath } from "@/admin/lib/server-routing";


import { redirect } from "next/navigation";
import { sql } from "@/db/neon";
import {
  hashPassword,
  signAdminToken,
  verifyPassword,
} from "@/admin/lib/auth";
import {
  ADMIN_REMEMBER_ME_SECONDS,
  ADMIN_SESSION_SECONDS,
  type AdminRole,
} from "@/admin/lib/constants";
import {
  clearAdminSessionCookie,
  getAdminSession,
  requireAdminSession,
  setAdminSessionCookie,
  type AdminSession,
} from "@/admin/lib/session";

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

export async function loginAdmin(
  _prev: LoginResult | null,
  formData: FormData,
): Promise<LoginResult> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  try {
    const rows = await sql`
      SELECT id, full_name, email, password_hash, role, is_active
      FROM admin_users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { ok: false, error: "Invalid email or password." };
    }

    const user = rows[0] as {
      id: number;
      full_name: string;
      email: string;
      password_hash: string;
      role: AdminRole;
      is_active: boolean;
    };

    if (!user.is_active) {
      return { ok: false, error: "This account has been deactivated." };
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return { ok: false, error: "Invalid email or password." };
    }

    const rememberMe =
      formData.get("rememberMe") === "on" ||
      formData.get("rememberMe") === "true";
    const maxAge = rememberMe
      ? ADMIN_REMEMBER_ME_SECONDS
      : ADMIN_SESSION_SECONDS;

    const token = await signAdminToken(
      {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
      { rememberMe, maxAge },
    );

    await setAdminSessionCookie(token, maxAge);

    await sql`
      UPDATE admin_users
      SET last_login = NOW(), updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Soft audit (ignore if table missing during first boot)
    try {
      await sql`
        INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id)
        VALUES (${user.id}, 'login', 'admin_user', ${String(user.id)})
      `;
    } catch {
      /* optional */
    }
  } catch (err) {
    console.error("loginAdmin error:", err);
    return {
      ok: false,
      error:
        "Unable to sign in. Ensure the admin database tables are migrated.",
    };
  }

  const requested = String(formData.get("next") || "");
  const subdomain = (await adminServerPath("/admin")) === "/";
  const safe = requested.startsWith("/") && !requested.startsWith("//") &&
    !/[\\\r\n]/.test(requested) && (subdomain || /^\/admin(?:\/|$|\?)/.test(requested));
  const target = safe ? requested : "/admin/dashboard";
  redirect(await adminServerPath(target));
}

export async function logoutAdmin(): Promise<void> {
  try {
    const session = await getAdminSession();
    if (session) {
      await sql`
        INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id)
        VALUES (${session.id}, 'logout', 'admin_user', ${String(session.id)})
      `;
    }
  } catch {
    /* ignore */
  }
  await clearAdminSessionCookie();
  redirect(await adminServerPath("/admin/login"));
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  return getAdminSession();
}

export async function changeAdminPassword(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const session = await requireAdminSession();
    const current = String(formData.get("currentPassword") || "");
    const next = String(formData.get("newPassword") || "");
    const confirm = String(formData.get("confirmPassword") || "");

    if (next.length < 8) {
      return { ok: false, error: "New password must be at least 8 characters." };
    }
    if (next !== confirm) {
      return { ok: false, error: "Passwords do not match." };
    }

    const rows = await sql`
      SELECT password_hash FROM admin_users WHERE id = ${session.id} LIMIT 1
    `;
    if (rows.length === 0) return { ok: false, error: "User not found." };

    const valid = await verifyPassword(
      current,
      (rows[0] as { password_hash: string }).password_hash,
    );
    if (!valid) return { ok: false, error: "Current password is incorrect." };

    const hash = await hashPassword(next);
    await sql`
      UPDATE admin_users
      SET password_hash = ${hash}, updated_at = NOW()
      WHERE id = ${session.id}
    `;
    return { ok: true };
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
}
