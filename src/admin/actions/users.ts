"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db/neon";
import { hashPassword } from "@/admin/lib/auth";
import { canManageUsers, type AdminRole } from "@/admin/lib/constants";
import { requireAdminSession } from "@/admin/lib/session";

export type AdminUserRow = {
  id: number;
  fullName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
};

const ROLES: AdminRole[] = ["super_admin", "admin", "manager", "viewer"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function assertManager() {
  const session = await requireAdminSession();
  if (!canManageUsers(session.role)) throw new Error("FORBIDDEN");
  return session;
}

/** Only super admins may grant or modify the super_admin role. */
function canAssign(actor: AdminRole, role: AdminRole) {
  return role !== "super_admin" || actor === "super_admin";
}

export async function adminListUsers(): Promise<{ users: AdminUserRow[]; canManage: boolean; selfId: number }> {
  const session = await requireAdminSession();
  try {
    const rows = await sql`
      SELECT id, full_name, email, role, is_active, created_at, last_login
      FROM admin_users ORDER BY id ASC
    `;
    return {
      canManage: canManageUsers(session.role),
      selfId: session.id,
      users: rows.map((r) => {
        const row = r as Record<string, unknown>;
        return {
          id: row.id as number,
          fullName: String(row.full_name || ""),
          email: String(row.email || ""),
          role: row.role as AdminRole,
          isActive: Boolean(row.is_active),
          createdAt: String(row.created_at),
          lastLogin: row.last_login ? String(row.last_login) : undefined,
        };
      }),
    };
  } catch (err) {
    console.error("adminListUsers:", err);
    return { users: [], canManage: canManageUsers(session.role), selfId: session.id };
  }
}

export async function adminCreateUser(input: {
  fullName: string;
  email: string;
  role: AdminRole;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await assertManager();
    const fullName = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    if (fullName.length < 2) return { ok: false, error: "Full name is required." };
    if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
    if (!ROLES.includes(input.role)) return { ok: false, error: "Invalid role." };
    if (!canAssign(session.role, input.role)) return { ok: false, error: "Only a super admin can create super admins." };
    if ((input.password || "").length < 8) return { ok: false, error: "Password must be at least 8 characters." };

    const exists = await sql`SELECT id FROM admin_users WHERE email = ${email} LIMIT 1`;
    if (exists.length) return { ok: false, error: "An account with this email already exists." };

    const hash = await hashPassword(input.password);
    const rows = await sql`
      INSERT INTO admin_users (full_name, email, password_hash, role)
      VALUES (${fullName}, ${email}, ${hash}, ${input.role})
      RETURNING id
    `;
    try {
      await sql`
        INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id)
        VALUES (${session.id}, 'create', 'admin_user', ${String((rows[0] as { id: number }).id)})
      `;
    } catch {
      /* optional */
    }
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") return { ok: false, error: "You don't have permission to manage users." };
    console.error("adminCreateUser:", err);
    return { ok: false, error: "Failed to create user." };
  }
}

export async function adminUpdateUser(
  id: number,
  input: { fullName: string; role: AdminRole; isActive: boolean; password?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await assertManager();
    const rows = await sql`SELECT id, role FROM admin_users WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return { ok: false, error: "User not found." };
    const current = rows[0] as { id: number; role: AdminRole };

    if (!ROLES.includes(input.role)) return { ok: false, error: "Invalid role." };
    if (!canAssign(session.role, input.role) || !canAssign(session.role, current.role)) {
      return { ok: false, error: "Only a super admin can modify super admins." };
    }
    if (id === session.id && (!input.isActive || input.role !== current.role)) {
      return { ok: false, error: "You can't deactivate or change the role of your own account." };
    }
    if (input.fullName.trim().length < 2) return { ok: false, error: "Full name is required." };

    await sql`
      UPDATE admin_users
      SET full_name = ${input.fullName.trim()}, role = ${input.role}, is_active = ${input.isActive}, updated_at = NOW()
      WHERE id = ${id}
    `;
    if (input.password) {
      if (input.password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
      const hash = await hashPassword(input.password);
      await sql`UPDATE admin_users SET password_hash = ${hash}, updated_at = NOW() WHERE id = ${id}`;
    }
    try {
      await sql`
        INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id)
        VALUES (${session.id}, 'update', 'admin_user', ${String(id)})
      `;
    } catch {
      /* optional */
    }
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") return { ok: false, error: "You don't have permission to manage users." };
    console.error("adminUpdateUser:", err);
    return { ok: false, error: "Failed to update user." };
  }
}

export async function adminDeleteUser(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await assertManager();
    if (id === session.id) return { ok: false, error: "You can't delete your own account." };
    const rows = await sql`SELECT role FROM admin_users WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return { ok: false, error: "User not found." };
    if (!canAssign(session.role, (rows[0] as { role: AdminRole }).role)) {
      return { ok: false, error: "Only a super admin can delete super admins." };
    }
    await sql`DELETE FROM admin_users WHERE id = ${id}`;
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") return { ok: false, error: "You don't have permission to manage users." };
    console.error("adminDeleteUser:", err);
    return { ok: false, error: "Failed to delete user." };
  }
}

export type AuditEntry = {
  id: number;
  action: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  adminName?: string;
};

export async function adminRecentActivity(limit = 12): Promise<AuditEntry[]> {
  await requireAdminSession();
  try {
    const rows = await sql`
      SELECT a.id, a.action, a.entity_type, a.entity_id, a.created_at, u.full_name
      FROM audit_logs a LEFT JOIN admin_users u ON u.id = a.admin_user_id
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT ${Math.min(100, Math.max(1, limit))}
    `;
    return rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: row.id as number,
        action: String(row.action),
        entityType: (row.entity_type as string) || undefined,
        entityId: (row.entity_id as string) || undefined,
        createdAt: String(row.created_at),
        adminName: (row.full_name as string) || undefined,
      };
    });
  } catch {
    return [];
  }
}
