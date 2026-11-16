"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db/neon";
import { canWrite } from "@/admin/lib/constants";
import { requireAdminSession } from "@/admin/lib/session";
import {
  DEFAULT_STOREFRONT,
  mergeStorefront,
  STOREFRONT_SETTING_KEY,
  type StorefrontSettings,
  type WhatsAppButtonSettings,
} from "@/data/storefront";

export async function adminGetStorefront(): Promise<StorefrontSettings> {
  await requireAdminSession();
  try {
    const rows = await sql`SELECT value FROM cms_settings WHERE key = ${STOREFRONT_SETTING_KEY} LIMIT 1`;
    return mergeStorefront(rows[0] ? (rows[0] as { value: Partial<StorefrontSettings> }).value : null);
  } catch {
    return mergeStorefront(null);
  }
}

function clean(s: unknown, max = 2000): string {
  return String(s ?? "").trim().slice(0, max);
}

export async function adminSaveStorefront(
  input: StorefrontSettings,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await requireAdminSession();
    if (!canWrite(session.role)) return { ok: false, error: "You don't have permission to edit the storefront." };

    const heroSlides = (input.heroSlides || [])
      .map((s, i) => ({
        id: clean(s.id, 80) || `slide-${i + 1}`,
        eyebrow: clean(s.eyebrow, 200),
        title: clean(s.title, 120),
        subtitle: clean(s.subtitle, 120),
        description: clean(s.description, 600),
        price: clean(s.price, 60),
        image: clean(s.image, 2000),
        href: clean(s.href, 500) || "/watches",
        buttonLabel: clean(s.buttonLabel, 60) || "Explore",
        specs: (s.specs || [])
          .map((sp) => ({ label: clean(sp.label, 60), value: clean(sp.value, 120) }))
          .filter((sp) => sp.label && sp.value)
          .slice(0, 6),
      }))
      .filter((s) => s.title && s.image);
    if (!heroSlides.length) return { ok: false, error: "Add at least one hero slide with a title and image." };

    const value: StorefrontSettings = {
      announcement: (input.announcement || []).map((m) => clean(m, 160)).filter(Boolean).slice(0, 8),
      heroSlides,
      banners: (input.banners || [])
        .map((b, i) => ({
          id: clean(b.id, 80) || `banner-${i + 1}`,
          title: clean(b.title, 120),
          text: clean(b.text, 400),
          image: clean(b.image, 2000),
          href: clean(b.href, 500) || "/watches",
          buttonLabel: clean(b.buttonLabel, 60) || "Explore",
        }))
        .filter((b) => b.title && b.image)
        .slice(0, 4),
      statement: { heading: clean(input.statement?.heading, 200), text: clean(input.statement?.text, 1000) },
      quote: { text: clean(input.quote?.text, 200), author: clean(input.quote?.author, 80) },
      contact: {
        careEmail: clean(input.contact?.careEmail, 200),
        serviceEmail: clean(input.contact?.serviceEmail, 200),
        phone: clean(input.contact?.phone, 50),
        hours: clean(input.contact?.hours, 120),
        whatsapp: clean(input.contact?.whatsapp, 30).replace(/[^\d+]/g, ""),
      },
      whatsappButton: {
        enabled: input.whatsappButton?.enabled !== undefined ? Boolean(input.whatsappButton.enabled) : true,
        buttonText: clean(input.whatsappButton?.buttonText, 80) || "Ask on WhatsApp",
        phoneNumber: clean(input.whatsappButton?.phoneNumber || input.contact?.whatsapp, 30).replace(/[^\d+]/g, ""),
        messageTemplate:
          clean(input.whatsappButton?.messageTemplate, 500)
            .replace(/\s*\{image\}/g, "")
            .replace(/\s*Image:\s*\{image\}/gi, "")
            .replace(/\s*Image:\s*https?:\/\/\S+/gi, "")
            .trim() || "Hi Timect, I would like to enquire about {name} ({price}). {url}",
        corporateMessage: clean(input.whatsappButton?.corporateMessage, 500) || "Hi Timect, I'd like help with a corporate gifting order.",
        conciergeMessage: clean(input.whatsappButton?.conciergeMessage, 500) || "Hi Timect, I have a question about your watches.",
      },
      social: {
        instagram: clean(input.social?.instagram, 300),
        facebook: clean(input.social?.facebook, 300),
        youtube: clean(input.social?.youtube, 300),
      },
    };

    await sql`
      INSERT INTO cms_settings (key, value, updated_at)
      VALUES (${STOREFRONT_SETTING_KEY}, ${JSON.stringify(value)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
    try {
      await sql`
        INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id)
        VALUES (${session.id}, 'update', 'storefront', ${STOREFRONT_SETTING_KEY})
      `;
    } catch {
      /* optional */
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    console.error("adminSaveStorefront:", err);
    return { ok: false, error: "Save failed. Make sure the admin migration has been run." };
  }
}

export async function adminGetWhatsAppSettings(): Promise<WhatsAppButtonSettings> {
  const sf = await adminGetStorefront();
  return sf.whatsappButton || DEFAULT_STOREFRONT.whatsappButton!;
}

export async function adminSaveWhatsAppSettings(
  input: Partial<WhatsAppButtonSettings>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await requireAdminSession();
    if (!canWrite(session.role)) return { ok: false, error: "You don't have permission to edit storefront settings." };

    const sf = await adminGetStorefront();
    const currentWp = sf.whatsappButton || DEFAULT_STOREFRONT.whatsappButton!;

    const updatedWp: WhatsAppButtonSettings = {
      enabled: input.enabled !== undefined ? Boolean(input.enabled) : currentWp.enabled,
      buttonText: clean(input.buttonText, 80) || currentWp.buttonText || "Ask on WhatsApp",
      phoneNumber: clean(input.phoneNumber !== undefined ? input.phoneNumber : currentWp.phoneNumber, 30).replace(/[^\d+]/g, ""),
      messageTemplate:
        clean(input.messageTemplate, 500)
          .replace(/\s*\{image\}/g, "")
          .replace(/\s*Image:\s*\{image\}/gi, "")
          .replace(/\s*Image:\s*https?:\/\/\S+/gi, "")
          .trim() || currentWp.messageTemplate,
      corporateMessage: clean(input.corporateMessage, 500) || currentWp.corporateMessage,
      conciergeMessage: clean(input.conciergeMessage, 500) || currentWp.conciergeMessage,
    };

    sf.whatsappButton = updatedWp;
    if (updatedWp.phoneNumber) {
      sf.contact.whatsapp = updatedWp.phoneNumber;
    }

    const res = await adminSaveStorefront(sf);
    if (res.ok) {
      revalidatePath("/", "layout");
      revalidatePath("/watches", "layout");
      revalidatePath("/product/[slug]", "page");
      revalidatePath("/corporate-gifting", "page");
    }
    return res;
  } catch (err) {
    console.error("adminSaveWhatsAppSettings:", err);
    return { ok: false, error: "Failed to update WhatsApp settings." };
  }
}
