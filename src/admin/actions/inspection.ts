"use server";

import { revalidatePath } from "next/cache";
import { canWrite } from "@/admin/lib/constants";
import { requireAdminSession } from "@/admin/lib/session";
import { sql } from "@/db/neon";

export async function adminGetInspectionRestriction(): Promise<boolean> {
  await requireAdminSession();
  const rows = await sql`SELECT value FROM cms_settings WHERE key = 'restrict_inspection' LIMIT 1`;
  return rows[0]?.value === true;
}

export async function adminSaveInspectionRestriction(enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireAdminSession();
    if (!canWrite(session.role)) return { ok: false, error: "You don't have permission to change this setting." };
    if (typeof enabled !== "boolean") return { ok: false, error: "Invalid setting." };
    await sql`
      INSERT INTO cms_settings (key, value, updated_at)
      VALUES ('restrict_inspection', ${JSON.stringify(enabled)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    console.error("adminSaveInspectionRestriction:", err);
    return { ok: false, error: "Could not save the setting." };
  }
}
