"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db/neon";
import { ensureInquiryTables } from "@/db/inquiries";
import { canDelete, canWrite } from "@/admin/lib/constants";
import { requireAdminSession } from "@/admin/lib/session";

export type MessageStatus = "new" | "read" | "archived";

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  productSlug?: string;
  status: MessageStatus;
  createdAt: string;
};

export type Subscriber = { id: number; email: string; createdAt: string };

function mapMessage(r: Record<string, unknown>): ContactMessage {
  return {
    id: r.id as number,
    name: String(r.name || ""),
    email: String(r.email || ""),
    phone: (r.phone as string) || undefined,
    subject: (r.subject as string) || undefined,
    message: String(r.message || ""),
    productSlug: (r.product_slug as string) || undefined,
    status: (r.status as MessageStatus) || "new",
    createdAt: String(r.created_at),
  };
}

export async function adminListMessages(
  opts: { status?: MessageStatus | "all"; search?: string; page?: number; pageSize?: number } = {},
): Promise<{ items: ContactMessage[]; total: number; counts: Record<MessageStatus | "all", number> }> {
  await requireAdminSession();
  const empty = { items: [], total: 0, counts: { all: 0, new: 0, read: 0, archived: 0 } };
  try {
    await ensureInquiryTables();
    const rows = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC`;
    let items = rows.map((r) => mapMessage(r as Record<string, unknown>));
    const counts = {
      all: items.filter((m) => m.status !== "archived").length,
      new: items.filter((m) => m.status === "new").length,
      read: items.filter((m) => m.status === "read").length,
      archived: items.filter((m) => m.status === "archived").length,
    };
    const status = opts.status || "all";
    items = status === "all" ? items.filter((m) => m.status !== "archived") : items.filter((m) => m.status === status);
    const search = (opts.search || "").trim().toLowerCase();
    if (search) {
      items = items.filter((m) =>
        [m.name, m.email, m.subject, m.message, m.productSlug, m.phone].filter(Boolean).join(" ").toLowerCase().includes(search),
      );
    }
    const pageSize = Math.min(100, Math.max(5, opts.pageSize || 20));
    const page = Math.max(1, opts.page || 1);
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, counts };
  } catch (err) {
    console.error("adminListMessages:", err);
    return empty;
  }
}

export async function adminUnreadMessageCount(): Promise<number> {
  try {
    await ensureInquiryTables();
    const rows = await sql`SELECT COUNT(*)::int AS n FROM contact_messages WHERE status = 'new'`;
    return Number((rows[0] as { n: number }).n || 0);
  } catch {
    return 0;
  }
}

export async function adminSetMessageStatus(
  ids: number[],
  status: MessageStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await requireAdminSession();
    if (!canWrite(session.role)) return { ok: false, error: "You don't have permission to do that." };
    for (const id of ids) {
      await sql`UPDATE contact_messages SET status = ${status} WHERE id = ${id}`;
    }
    revalidatePath("/admin/inbox");
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    console.error("adminSetMessageStatus:", err);
    return { ok: false, error: "Update failed." };
  }
}

export async function adminDeleteMessages(ids: number[]): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await requireAdminSession();
    if (!canDelete(session.role)) return { ok: false, error: "You don't have permission to delete." };
    for (const id of ids) {
      await sql`DELETE FROM contact_messages WHERE id = ${id}`;
    }
    revalidatePath("/admin/inbox");
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    console.error("adminDeleteMessages:", err);
    return { ok: false, error: "Delete failed." };
  }
}

export async function adminListSubscribers(search = ""): Promise<Subscriber[]> {
  await requireAdminSession();
  try {
    await ensureInquiryTables();
    const rows = await sql`SELECT * FROM newsletter_subscribers ORDER BY created_at DESC`;
    const q = search.trim().toLowerCase();
    return rows
      .map((r) => ({
        id: (r as { id: number }).id,
        email: String((r as { email: string }).email),
        createdAt: String((r as { created_at: string }).created_at),
      }))
      .filter((s) => !q || s.email.includes(q));
  } catch (err) {
    console.error("adminListSubscribers:", err);
    return [];
  }
}

export async function adminDeleteSubscriber(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await requireAdminSession();
    if (!canDelete(session.role)) return { ok: false, error: "You don't have permission to delete." };
    await sql`DELETE FROM newsletter_subscribers WHERE id = ${id}`;
    revalidatePath("/admin/inbox");
    return { ok: true };
  } catch (err) {
    console.error("adminDeleteSubscriber:", err);
    return { ok: false, error: "Delete failed." };
  }
}
