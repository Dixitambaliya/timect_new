"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db/neon";
import { GIFT_SAMPLES, type GiftSample } from "@/data/giftSamples";
import { canWrite } from "@/admin/lib/constants";
import { requireAdminSession } from "@/admin/lib/session";
import { slugify } from "@/admin/lib/slug";

const SETTING_KEY = "corporate_gifting";
let inMemoryItems: GiftSample[] | null = null;

async function assertWrite() {
  const session = await requireAdminSession();
  if (!canWrite(session.role)) throw new Error("FORBIDDEN");
  return session;
}

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  if (inMemoryItems !== null && key === SETTING_KEY) {
    return inMemoryItems as unknown as T;
  }
  try {
    const rows = await sql`
      SELECT value FROM cms_settings WHERE key = ${key} LIMIT 1
    `;
    if (rows.length === 0) return fallback;
    return (rows[0] as { value: T }).value as T;
  } catch {
    return inMemoryItems !== null ? (inMemoryItems as unknown as T) : fallback;
  }
}

async function setSetting(key: string, value: unknown) {
  if (key === SETTING_KEY && Array.isArray(value)) {
    inMemoryItems = value as GiftSample[];
  }
  try {
    await sql`
      INSERT INTO cms_settings (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
    `;
  } catch {
    /* safe in-memory fallback */
  }
}

/** Public reader for the storefront corporate gifting experience */
export async function publicGetCorporateGiftingItems(): Promise<GiftSample[]> {
  const items = await getSetting<GiftSample[]>(SETTING_KEY, GIFT_SAMPLES);
  if (!Array.isArray(items) || items.length === 0) {
    return GIFT_SAMPLES;
  }
  return items;
}

/** Admin reader for managing corporate gifting items */
export async function adminGetCorporateGiftingItems(): Promise<GiftSample[]> {
  await requireAdminSession();
  const items = await getSetting<GiftSample[]>(SETTING_KEY, GIFT_SAMPLES);
  if (!Array.isArray(items) || items.length === 0) {
    return GIFT_SAMPLES;
  }
  return items;
}

export type GiftItemInput = {
  name: string;
  title?: string;
  price: string;
  image: string;
  hoverImage?: string;
  brand?: string;
  collection?: string;
  gender?: string;
  accentColor?: string;
  subtitle?: string;
  caseSize?: string;
  specifications?: { label: string; value: string }[];
};

export async function adminCreateCorporateGiftingItem(
  input: GiftItemInput
): Promise<{ ok: true; item: GiftSample } | { ok: false; error: string }> {
  try {
    await assertWrite();

    if (!input.name?.trim()) {
      return { ok: false, error: "Name is required." };
    }
    if (!input.price?.trim()) {
      return { ok: false, error: "Price is required." };
    }
    if (!input.image?.trim()) {
      return { ok: false, error: "Image URL is required." };
    }

    const current = await adminGetCorporateGiftingItems();
    const nextId = Math.max(9000, ...current.map((i) => i.id || 0)) + 1;
    const baseSlug = slugify(input.name) || `gift-${nextId}`;
    const slug = current.some((i) => i.slug === baseSlug)
      ? `${baseSlug}-${Date.now().toString().slice(-4)}`
      : baseSlug;

    const newItem: GiftSample = {
      id: nextId,
      slug,
      name: input.name.trim(),
      title: input.title?.trim() || undefined,
      price: input.price.trim(),
      image: input.image.trim(),
      hoverImage: input.hoverImage?.trim() || undefined,
      brand: input.brand?.trim() || "Timect",
      collection: input.collection?.trim() || "Corporate",
      gender: input.gender?.trim() || "Unisex",
      accentColor: input.accentColor?.trim() || "#4a5d6e",
      caseSize: input.caseSize?.trim() || undefined,
      subtitle: input.subtitle?.trim() || undefined,
      specifications: input.specifications?.filter((s) => s.label && s.value) || [],
      isMainProduct: false,
      isNewArrival: true,
      isRecommended: true,
      isRelated: false,
    };

    const updatedList = [newItem, ...current];
    await setSetting(SETTING_KEY, updatedList);

    revalidatePath("/corporate-gifting");
    revalidatePath("/admin/corporate-gifting");
    revalidatePath("/admin/dashboard");

    return { ok: true, item: newItem };
  } catch (err) {
    console.error("adminCreateCorporateGiftingItem:", err);
    return { ok: false, error: "Failed to create corporate gift item." };
  }
}

export async function adminUpdateCorporateGiftingItem(
  id: number,
  input: GiftItemInput
): Promise<{ ok: true; item: GiftSample } | { ok: false; error: string }> {
  try {
    await assertWrite();

    if (!input.name?.trim()) {
      return { ok: false, error: "Name is required." };
    }
    if (!input.price?.trim()) {
      return { ok: false, error: "Price is required." };
    }
    if (!input.image?.trim()) {
      return { ok: false, error: "Image URL is required." };
    }

    const current = await adminGetCorporateGiftingItems();
    const index = current.findIndex((i) => i.id === id);
    if (index === -1) {
      return { ok: false, error: "Gift item not found." };
    }

    const existing = current[index];
    const updatedItem: GiftSample = {
      ...existing,
      name: input.name.trim(),
      title: input.title?.trim() || undefined,
      price: input.price.trim(),
      image: input.image.trim(),
      hoverImage: input.hoverImage?.trim() || undefined,
      brand: input.brand?.trim() || existing.brand || "Timect",
      collection: input.collection?.trim() || undefined,
      gender: input.gender?.trim() || existing.gender || "Unisex",
      accentColor: input.accentColor?.trim() || undefined,
      caseSize: input.caseSize?.trim() || undefined,
      subtitle: input.subtitle?.trim() || undefined,
      specifications: input.specifications?.filter((s) => s.label && s.value) || [],
    };

    current[index] = updatedItem;
    await setSetting(SETTING_KEY, current);

    revalidatePath("/corporate-gifting");
    revalidatePath("/admin/corporate-gifting");
    revalidatePath("/admin/dashboard");

    return { ok: true, item: updatedItem };
  } catch (err) {
    console.error("adminUpdateCorporateGiftingItem:", err);
    return { ok: false, error: "Failed to update corporate gift item." };
  }
}

export async function adminDeleteCorporateGiftingItem(
  id: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await assertWrite();

    const current = await adminGetCorporateGiftingItems();
    const filtered = current.filter((i) => i.id !== id);

    if (filtered.length === current.length) {
      return { ok: false, error: "Item not found." };
    }

    await setSetting(SETTING_KEY, filtered);

    revalidatePath("/corporate-gifting");
    revalidatePath("/admin/corporate-gifting");
    revalidatePath("/admin/dashboard");

    return { ok: true };
  } catch (err) {
    console.error("adminDeleteCorporateGiftingItem:", err);
    return { ok: false, error: "Failed to delete item." };
  }
}
