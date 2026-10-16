"use server";

import { sql } from "@/db/neon";
import type { Product, Variant } from "@/db/actions";
import {
  emptyProductInput,
  mapRowToProduct,
  productToInput,
  type ProductInput,
} from "@/admin/lib/product-mapper";
import { slugify } from "@/admin/lib/slug";
import { canWrite } from "@/admin/lib/constants";
import { requireAdminSession } from "@/admin/lib/session";
import { buildProductWorkbook, parseProductWorkbook } from "@/admin/lib/product-sheet";
import { adminCreateProduct, adminUpdateProduct } from "@/admin/actions/products";

export type ImportRowResult = {
  row: number;
  name: string;
  handle: string;
  action: "create" | "update" | "error";
  message?: string;
};

export type ImportResult =
  | {
      ok: true;
      dryRun: boolean;
      created: number;
      updated: number;
      failed: number;
      rows: ImportRowResult[];
    }
  | { ok: false; error: string };

async function allProducts(): Promise<Product[]> {
  const rows = await sql`SELECT * FROM products ORDER BY id ASC`;
  return rows.map((r) => mapRowToProduct(r as Record<string, unknown>));
}

/** Download every product as a Shopify-style .xlsx (base64 for the client to save). */
export async function adminExportProducts(
  template = false,
): Promise<{ ok: true; base64: string; filename: string } | { ok: false; error: string }> {
  try {
    await requireAdminSession();
    const products = template ? [] : await allProducts();
    const buf = await buildProductWorkbook(products);
    const date = new Date().toISOString().slice(0, 10);
    return {
      ok: true,
      base64: buf.toString("base64"),
      filename: template ? "timect-products-template.xlsx" : `timect-products-${date}.xlsx`,
    };
  } catch (err) {
    console.error("adminExportProducts:", err);
    return { ok: false, error: "Export failed." };
  }
}

/**
 * Upsert products from an uploaded workbook. Rows are matched to existing
 * products by Handle (or, when Handle is blank, by the URL their name would
 * produce), so re-uploading an edited export updates products in place.
 * With dryRun the file is only checked and nothing is written.
 */
export async function adminImportProducts(formData: FormData, dryRun = false): Promise<ImportResult> {
  try {
    const session = await requireAdminSession();
    if (!canWrite(session.role)) return { ok: false, error: "You don't have permission to edit products." };

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an .xlsx file to upload." };

    const parsed = await parseProductWorkbook(await file.arrayBuffer());
    if (parsed.error) return { ok: false, error: parsed.error };
    if (!parsed.rows.length) return { ok: false, error: "The sheet has no product rows." };

    const existing = await allProducts();
    const bySlug = new Map(existing.map((p) => [p.slug, p]));
    const claimed = new Set<number | string>();
    const results: ImportRowResult[] = [];
    /** handle written in the sheet → product id after import (for resolving Variants) */
    const idByHandle = new Map<string, number>();
    const variantJobs: { id: number; handles: string[]; row: ImportRowResult }[] = [];

    for (const r of parsed.rows) {
      const name = (r.input.name || r.input.title || "").trim();
      const res: ImportRowResult = { row: r.row, name, handle: r.handle, action: "error" };
      results.push(res);
      if (r.error) {
        res.message = r.error;
        continue;
      }

      const target = r.handle ? bySlug.get(r.handle) : bySlug.get(slugify(name));
      const claimKey = target ? target.id : `new:${slugify(name)}`;
      if (claimed.has(claimKey)) {
        res.message = "Another row in this file already targets this product.";
        continue;
      }
      claimed.add(claimKey);

      const base: ProductInput = target ? productToInput(target) : emptyProductInput();
      const input: ProductInput = { ...base, ...r.input };
      if (!target) input.variants = [];
      if (r.input.name && !("title" in r.input)) input.title = r.input.name;
      if (!input.price) {
        res.message = "Price is required.";
        continue;
      }
      if (!(input.name || input.title)) {
        res.message = "Name is required.";
        continue;
      }
      res.action = target ? "update" : "create";
      res.handle = target?.slug || slugify(name);

      if (dryRun) continue;

      let id: number;
      if (target) {
        const saved = await adminUpdateProduct(target.id, input);
        if (!saved.ok) {
          res.action = "error";
          res.message = saved.error;
          continue;
        }
        id = target.id;
      } else {
        const saved = await adminCreateProduct(input);
        if (!saved.ok) {
          res.action = "error";
          res.message = saved.error;
          continue;
        }
        id = saved.id;
      }
      if (r.handle) idByHandle.set(r.handle, id);
      if (r.variantHandles) variantJobs.push({ id, handles: r.variantHandles, row: res });
    }

    if (!dryRun && variantJobs.length) {
      // Second pass: link variants once every row exists, so rows can reference each other.
      const fresh = await allProducts();
      const byId = new Map(fresh.map((p) => [p.id, p]));
      const freshBySlug = new Map(fresh.map((p) => [p.slug, p]));
      const resolve = (h: string) => {
        const id = idByHandle.get(h);
        return (id != null ? byId.get(id) : undefined) ?? freshBySlug.get(h) ?? freshBySlug.get(slugify(h));
      };

      for (const job of variantJobs) {
        // Re-read: linking an earlier row may already have updated this product's variants.
        const rows = await sql`SELECT * FROM products WHERE id = ${job.id} LIMIT 1`;
        if (!rows.length) continue;
        const product = mapRowToProduct(rows[0] as Record<string, unknown>);
        const missing: string[] = [];
        const variants: Variant[] = [];
        for (const h of job.handles) {
          const other = resolve(h);
          if (!other) {
            missing.push(h);
            continue;
          }
          if (other.id === product.id || variants.some((v) => v.slug === other.slug)) continue;
          const prev = product.variants?.find((v) => v.slug === other.slug);
          variants.push(
            prev ?? {
              id: `v${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name: other.title || other.name || other.slug,
              image: other.image || "",
              slug: other.slug,
            },
          );
        }
        const before = (product.variants || []).map((v) => v.slug).filter(Boolean).sort().join(",");
        const after = variants.map((v) => v.slug).sort().join(",");
        if (before !== after) {
          const saved = await adminUpdateProduct(product.id, { ...productToInput(product), variants });
          if (!saved.ok) job.row.message = `Saved, but variants failed: ${saved.error}`;
        }
        if (missing.length && !job.row.message) {
          job.row.message = `Variant handle(s) not found: ${missing.join(", ")}`;
        }
      }
    }

    return {
      ok: true,
      dryRun,
      created: results.filter((r) => r.action === "create").length,
      updated: results.filter((r) => r.action === "update").length,
      failed: results.filter((r) => r.action === "error").length,
      rows: results,
    };
  } catch (err) {
    console.error("adminImportProducts:", err);
    return { ok: false, error: "Import failed." };
  }
}
