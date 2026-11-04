"use server";

import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { sql } from "@/db/neon";
import { canDelete, canWrite } from "@/admin/lib/constants";
import { requireAdminSession } from "@/admin/lib/session";

export type MediaItem = {
  id: number;
  url: string;
  publicId?: string;
  filename?: string;
  folder: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  altText?: string;
  createdAt?: string;
};

/** Max single file size (50MB -matches serverActions.bodySizeLimit). */
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

function mapMedia(row: Record<string, unknown>): MediaItem {
  return {
    id: row.id as number,
    url: row.url as string,
    publicId: (row.public_id as string) || undefined,
    filename: (row.filename as string) || undefined,
    folder: (row.folder as string) || "general",
    mimeType: (row.mime_type as string) || undefined,
    sizeBytes: (row.size_bytes as number) || undefined,
    width: (row.width as number) || undefined,
    height: (row.height as number) || undefined,
    altText: (row.alt_text as string) || undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
  };
}

async function assertWrite() {
  const session = await requireAdminSession();
  if (!canWrite(session.role)) throw new Error("FORBIDDEN");
  return session;
}

/**
 * Upload an image for the admin media library / product editor.
 * Prefers Cloudinary (returns a short CDN URL). Large base64 payloads
 * are never stored on products when Cloudinary is configured.
 */
export async function adminUploadMedia(formData: FormData): Promise<
  | { ok: true; item: MediaItem }
  | { ok: false; error: string }
> {
  try {
    await assertWrite();

    const file = formData.get("file") as File | null;
    const folder =
      String(formData.get("folder") || "general").trim() || "general";
    const altText = String(formData.get("altText") || "").trim();

    if (!file || file.size === 0) {
      return { ok: false, error: "No file provided." };
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return {
        ok: false,
        error: `File is too large (max ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))}MB).`,
      };
    }

    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];
    // Some browsers send empty type -allow and infer later
    if (file.type && !allowed.includes(file.type.toLowerCase())) {
      return {
        ok: false,
        error: "Unsupported file type. Use JPG, PNG, WebP, GIF, SVG, or AVIF.",
      };
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    let url = "";
    let publicId: string | null = null;
    let width: number | null = null;
    let height: number | null = null;

    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "image/jpeg";

    if (cloudName && apiKey && apiSecret) {
      // Cloudinary accepts data-URI file payloads server-side reliably
      const dataUri = `data:${mime};base64,${bytes.toString("base64")}`;
      const timestamp = Math.floor(Date.now() / 1000);
      const folderPath = `timect/admin/${folder}`;
      // Signature: params alphabetically + secret (no file in signature)
      const toSign = `folder=${folderPath}&timestamp=${timestamp}${apiSecret}`;
      const signature = createHash("sha1").update(toSign).digest("hex");

      const body = new FormData();
      body.append("file", dataUri);
      body.append("api_key", apiKey);
      body.append("timestamp", String(timestamp));
      body.append("signature", signature);
      body.append("folder", folderPath);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body },
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Cloudinary upload failed:", text);
        return {
          ok: false,
          error:
            "Cloudinary upload failed. Check CLOUDINARY_* credentials and try again.",
        };
      }

      const json = (await res.json()) as {
        secure_url: string;
        public_id: string;
        width?: number;
        height?: number;
      };
      url = json.secure_url;
      publicId = json.public_id;
      width = json.width ?? null;
      height = json.height ?? null;
    } else {
      // No Cloudinary: only allow small previews as data URLs (product save would explode)
      const softLimit = 400 * 1024; // 400KB
      if (file.size > softLimit) {
        return {
          ok: false,
          error:
            "CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET are required for large images. Set them in .env, or paste a Cloudinary/CDN URL instead.",
        };
      }
      url = `data:${mime};base64,${bytes.toString("base64")}`;
    }

    const rows = await sql`
      INSERT INTO media_library (
        url, public_id, filename, folder, mime_type, size_bytes, width, height, alt_text
      ) VALUES (
        ${url},
        ${publicId},
        ${file.name || "upload"},
        ${folder},
        ${mime || null},
        ${file.size},
        ${width},
        ${height},
        ${altText || null}
      )
      RETURNING *
    `;

    revalidatePath("/admin/media");
    return { ok: true, item: mapMedia(rows[0] as Record<string, unknown>) };
  } catch (err) {
    console.error("adminUploadMedia:", err);
    return { ok: false, error: "Upload failed." };
  }
}

/** Register an external URL into the media library (no re-upload) */
export async function adminRegisterMediaUrl(input: {
  url: string;
  folder?: string;
  filename?: string;
  altText?: string;
}): Promise<{ ok: true; item: MediaItem } | { ok: false; error: string }> {
  try {
    await assertWrite();
    const url = input.url.trim();
    if (!url) return { ok: false, error: "URL is required." };

    // Block huge data URLs from being registered into products
    if (url.startsWith("data:") && url.length > 500_000) {
      return {
        ok: false,
        error:
          "Data URLs are too large. Upload via Cloudinary or paste a short CDN URL.",
      };
    }

    const rows = await sql`
      INSERT INTO media_library (url, filename, folder, alt_text)
      VALUES (
        ${url},
        ${input.filename || url.split("/").pop() || "image"},
        ${input.folder || "external"},
        ${input.altText || null}
      )
      RETURNING *
    `;
    revalidatePath("/admin/media");
    return { ok: true, item: mapMedia(rows[0] as Record<string, unknown>) };
  } catch (err) {
    console.error("adminRegisterMediaUrl:", err);
    return { ok: false, error: "Failed to register media." };
  }
}

export async function adminListMedia(
  opts: {
    search?: string;
    folder?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<{ items: MediaItem[]; total: number; folders: string[] }> {
  await requireAdminSession();
  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.min(100, Math.max(12, opts.pageSize || 24));
  const search = (opts.search || "").trim().toLowerCase();
  const folder = (opts.folder || "").trim();

  try {
    const all = await sql`SELECT * FROM media_library ORDER BY id DESC`;
    let items = all.map((r) => mapMedia(r as Record<string, unknown>));
    const folders = Array.from(new Set(items.map((i) => i.folder))).sort();

    if (folder) items = items.filter((i) => i.folder === folder);
    if (search) {
      items = items.filter((i) =>
        [i.filename, i.url, i.altText, i.folder]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search),
      );
    }

    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      folders,
    };
  } catch (err) {
    console.error("adminListMedia:", err);
    return { items: [], total: 0, folders: [] };
  }
}

export async function adminDeleteMedia(
  id: number,
): Promise<
  | { ok: true; storageDeleted: boolean }
  | { ok: false; error: string }
> {
  try {
    const session = await requireAdminSession();
    if (!canDelete(session.role)) throw new Error("FORBIDDEN");

    const rows =
      await sql`SELECT * FROM media_library WHERE id = ${id} LIMIT 1`;
    if (rows.length === 0) return { ok: false, error: "Not found." };

    const item = rows[0] as { public_id?: string };
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    let storageDeleted = false;

    if (item.public_id) {
      if (!cloudName || !apiKey || !apiSecret) {
        return {
          ok: false,
          error: "Cloudinary credentials are missing. The hosted image was not deleted.",
        };
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const toSign = `public_id=${item.public_id}&timestamp=${timestamp}${apiSecret}`;
      const signature = createHash("sha1").update(toSign).digest("hex");
      const body = new URLSearchParams({
        public_id: item.public_id,
        api_key: apiKey,
        timestamp: String(timestamp),
        signature,
      });
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        { method: "POST", body },
      ).catch(() => null);

      if (!response?.ok) {
        return {
          ok: false,
          error: "Cloudinary could not delete the hosted image. Please try again.",
        };
      }

      const result = (await response.json()) as { result?: string };
      if (result.result !== "ok" && result.result !== "not found") {
        return {
          ok: false,
          error: "Cloudinary did not confirm deletion. The library item was kept.",
        };
      }
      storageDeleted = true;
    }

    await sql`DELETE FROM media_library WHERE id = ${id}`;
    revalidatePath("/admin/media");
    return { ok: true, storageDeleted };
  } catch (err) {
    console.error("adminDeleteMedia:", err);
    return { ok: false, error: "Delete failed." };
  }
}

export async function adminUpdateMedia(
  id: number,
  data: { altText?: string; folder?: string; filename?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await assertWrite();
    await sql`
      UPDATE media_library SET
        alt_text = COALESCE(${data.altText ?? null}, alt_text),
        folder = COALESCE(${data.folder ?? null}, folder),
        filename = COALESCE(${data.filename ?? null}, filename),
        updated_at = NOW()
      WHERE id = ${id}
    `;
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (err) {
    console.error("adminUpdateMedia:", err);
    return { ok: false, error: "Update failed." };
  }
}
