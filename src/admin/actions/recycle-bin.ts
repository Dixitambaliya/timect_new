"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db/neon";
import { canWrite, canDelete } from "@/admin/lib/constants";
import { requireAdminSession } from "@/admin/lib/session";

export type RecycleBinItem = {
  id: number;
  entityType: "product" | "collection";
  entityId: string;
  entityName: string;
  actionType: "delete" | "update" | "rename";
  snapshot: Record<string, unknown>;
  details: string;
  createdAt: string;
  expiresAt: string;
  hoursRemaining: number;
};

async function assertAdmin() {
  const session = await requireAdminSession();
  if (!canWrite(session.role)) throw new Error("FORBIDDEN");
  return session;
}

/** Record a snapshot to the recycle bin before modifying or deleting */
export async function addToRecycleBin(params: {
  entityType: "product" | "collection";
  entityId: string;
  entityName: string;
  actionType: "delete" | "update" | "rename";
  snapshot: unknown;
  details: string;
}): Promise<void> {
  try {
    await sql`
      INSERT INTO recycle_bin (
        entity_type, entity_id, entity_name, action_type, snapshot, details, created_at, expires_at
      ) VALUES (
        ${params.entityType},
        ${params.entityId},
        ${params.entityName},
        ${params.actionType},
        ${JSON.stringify(params.snapshot)}::jsonb,
        ${params.details},
        NOW(),
        NOW() + INTERVAL '3 days'
      )
    `;
  } catch (err) {
    console.error("addToRecycleBin failed:", err);
  }
}

/** List all active recycle bin items (purges expired entries older than 3 days) */
export async function adminListRecycleBin(): Promise<RecycleBinItem[]> {
  await requireAdminSession();
  try {
    // 1. Auto-purge expired entries older than 3 days
    await sql`DELETE FROM recycle_bin WHERE expires_at < NOW()`;

    // 2. Query remaining entries
    const rows = await sql`
      SELECT
        id, entity_type, entity_id, entity_name, action_type, snapshot, details,
        created_at, expires_at
      FROM recycle_bin
      ORDER BY created_at DESC
      LIMIT 100
    `;

    const now = Date.now();
    return rows.map((r) => {
      const expDate = new Date((r as { expires_at: string }).expires_at);
      const diffMs = Math.max(0, expDate.getTime() - now);
      const hoursRemaining = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));

      return {
        id: Number((r as { id: number }).id),
        entityType: (r as { entity_type: string }).entity_type as "product" | "collection",
        entityId: String((r as { entity_id: string }).entity_id),
        entityName: String((r as { entity_name: string }).entity_name),
        actionType: (r as { action_type: string }).action_type as "delete" | "update" | "rename",
        snapshot: ((r as { snapshot: Record<string, unknown> }).snapshot || {}) as Record<string, unknown>,
        details: String((r as { details: string | null }).details || ""),
        createdAt: String((r as { created_at: string }).created_at),
        expiresAt: String((r as { expires_at: string }).expires_at),
        hoursRemaining,
      };
    });
  } catch (err) {
    console.error("adminListRecycleBin error:", err);
    return [];
  }
}

/** Restore or rollback a recycle bin item */
export async function adminRestoreRecycleBinItem(
  id: number,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  try {
    await assertAdmin();

    const rows = await sql`
      SELECT * FROM recycle_bin WHERE id = ${id} LIMIT 1
    `;
    if (rows.length === 0) {
      return { ok: false, error: "Recycle bin item not found or expired." };
    }

    const item = rows[0] as {
      id: number;
      entity_type: string;
      entity_id: string;
      entity_name: string;
      action_type: string;
      snapshot: Record<string, unknown>;
    };

    const snapshot = item.snapshot || {};

    if (item.entity_type === "product") {
      if (item.action_type === "delete") {
        // Restore deleted product
        const s = snapshot;
        const slug = String(s.slug || `restored-product-${Date.now()}`);

        await sql`
          INSERT INTO products (
            slug, status, is_main_product, is_new_arrival, is_recommended, is_related,
            name, price, original_price, price_subtext, image, brand, title, subtitle,
            sizes, images, variants, specifications,
            tag, code, collection, description, gender, rating, hover_image
          ) VALUES (
            ${slug},
            ${(s.status as string) || "published"},
            ${Boolean(s.is_main_product)},
            ${Boolean(s.is_new_arrival)},
            ${Boolean(s.is_recommended)},
            ${Boolean(s.is_related)},
            ${(s.name as string) || null},
            ${(s.price as string) || "₹0"},
            ${(s.original_price as string) || (s.price_subtext as string) || null},
            ${(s.original_price as string) || (s.price_subtext as string) || null},
            ${(s.image as string) || null},
            ${(s.brand as string) || null},
            ${(s.name as string) || (s.title as string) || null},
            ${(s.subtitle as string) || null},
            ${JSON.stringify(s.sizes || [])}::jsonb,
            ${JSON.stringify(s.images || [])}::jsonb,
            ${JSON.stringify(s.variants || [])}::jsonb,
            ${JSON.stringify(s.specifications || [])}::jsonb,
            ${(s.tag as string) || null},
            ${(s.code as string) || null},
            ${(s.collection as string) || null},
            ${(s.description as string) || null},
            ${(s.gender as string) || null},
            ${s.rating ? Number(s.rating) : 4.5},
            ${(s.hover_image as string) || null}
          )
        `;
      } else if (item.action_type === "update") {
        // Rollback edited product to previous state
        const s = snapshot;
        const prodId = Number(item.entity_id);

        await sql`
          UPDATE products SET
            slug = ${String(s.slug || "")},
            status = ${(s.status as string) || "published"},
            is_main_product = ${Boolean(s.is_main_product)},
            is_new_arrival = ${Boolean(s.is_new_arrival)},
            is_recommended = ${Boolean(s.is_recommended)},
            is_related = ${Boolean(s.is_related)},
            name = ${(s.name as string) || null},
            price = ${(s.price as string) || "₹0"},
            original_price = ${(s.original_price as string) || (s.price_subtext as string) || null},
            price_subtext = ${(s.original_price as string) || (s.price_subtext as string) || null},
            image = ${(s.image as string) || null},
            brand = ${(s.brand as string) || null},
            title = ${(s.name as string) || (s.title as string) || null},
            subtitle = ${(s.subtitle as string) || null},
            sizes = ${JSON.stringify(s.sizes || [])}::jsonb,
            images = ${JSON.stringify(s.images || [])}::jsonb,
            variants = ${JSON.stringify(s.variants || [])}::jsonb,
            specifications = ${JSON.stringify(s.specifications || [])}::jsonb,
            tag = ${(s.tag as string) || null},
            code = ${(s.code as string) || null},
            collection = ${(s.collection as string) || null},
            description = ${(s.description as string) || null},
            gender = ${(s.gender as string) || null},
            rating = ${s.rating ? Number(s.rating) : 4.5},
            hover_image = ${(s.hover_image as string) || null}
          WHERE id = ${prodId}
        `;
      }
    } else if (item.entity_type === "collection") {
      if (item.action_type === "delete") {
        // Restore deleted collection and reassign its watches
        const colName = String(snapshot.name || item.entity_name);
        const productIds = (snapshot.productIds as number[]) || [];

        if (productIds.length > 0) {
          await sql`
            UPDATE products SET collection = ${colName}
            WHERE id = ANY(${productIds})
          `;
        }

        // Restore to custom_collections in cms_settings
        const customRows = await sql`
          SELECT value FROM cms_settings WHERE key = 'custom_collections' LIMIT 1
        `;
        const list = Array.isArray(customRows[0]?.value) ? (customRows[0].value as string[]) : [];
        if (!list.includes(colName)) {
          list.push(colName);
          await sql`
            INSERT INTO cms_settings (key, value, updated_at)
            VALUES ('custom_collections', ${JSON.stringify(list)}::jsonb, NOW())
            ON CONFLICT (key) DO UPDATE
            SET value = EXCLUDED.value, updated_at = NOW()
          `;
        }
      } else if (item.action_type === "rename") {
        // Rollback renamed collection back to its original name
        const fromName = String(snapshot.from || "");
        const toName = String(snapshot.to || "");

        if (fromName && toName) {
          await sql`
            UPDATE products SET collection = ${fromName}
            WHERE collection = ${toName}
          `;
          const customRows = await sql`
            SELECT value FROM cms_settings WHERE key = 'custom_collections' LIMIT 1
          `;
          const list = Array.isArray(customRows[0]?.value) ? (customRows[0].value as string[]) : [];
          const updated = list.map((c) => (c === toName ? fromName : c));
          await sql`
            INSERT INTO cms_settings (key, value, updated_at)
            VALUES ('custom_collections', ${JSON.stringify(updated)}::jsonb, NOW())
            ON CONFLICT (key) DO UPDATE
            SET value = EXCLUDED.value, updated_at = NOW()
          `;
        }
      }
    }

    // Delete restored item from recycle bin
    await sql`DELETE FROM recycle_bin WHERE id = ${id}`;

    revalidatePath("/");
    revalidatePath("/watches");
    revalidatePath("/admin/products");
    revalidatePath("/admin/collections");
    revalidatePath("/admin/recycle-bin");
    revalidatePath("/admin/dashboard");

    return {
      ok: true,
      message: `"${item.entity_name}" restored successfully.`,
    };
  } catch (err) {
    console.error("adminRestoreRecycleBinItem error:", err);
    return { ok: false, error: "Failed to restore item." };
  }
}

/** Permanently delete an item from the recycle bin immediately */
export async function adminPermanentlyDeleteRecycleBinItem(
  id: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await assertAdmin();
    await sql`DELETE FROM recycle_bin WHERE id = ${id}`;
    revalidatePath("/admin/recycle-bin");
    return { ok: true };
  } catch (err) {
    console.error("adminPermanentlyDeleteRecycleBinItem error:", err);
    return { ok: false, error: "Failed to delete item." };
  }
}

/** Empty the entire recycle bin */
export async function adminClearAllRecycleBin(): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    await assertAdmin();
    const result = await sql`DELETE FROM recycle_bin RETURNING id`;
    revalidatePath("/admin/recycle-bin");
    return { ok: true, count: result.length };
  } catch (err) {
    console.error("adminClearAllRecycleBin error:", err);
    return { ok: false, error: "Failed to clear recycle bin." };
  }
}
