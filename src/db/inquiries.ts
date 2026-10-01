"use server";

import { revalidatePath } from "next/cache";
import { sql } from "./neon";

/**
 * Public form handlers: contact messages and newsletter sign-ups.
 * Tables are created on first use (CREATE TABLE IF NOT EXISTS) and also by
 * `npm run db:admin-migrate`, so no destructive migration is required.
 */

let tablesReady = false;

export async function ensureInquiryTables(): Promise<void> {
  if (tablesReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      product_slug TEXT,
      status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'read', 'archived')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  tablesReady = true;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ContactFormState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<"name" | "email" | "message" | "form", string>>;
  values?: { name: string; email: string; phone: string; subject: string; message: string };
} | null;

export async function submitContactMessage(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    phone: String(formData.get("phone") || "").trim(),
    subject: String(formData.get("subject") || "").trim(),
    message: String(formData.get("message") || "").trim(),
  };
  const productSlug = String(formData.get("product") || "").trim() || null;

  // Honeypot: bots fill hidden fields, people don't.
  if (String(formData.get("company") || "").trim()) {
    return { ok: true, message: "Thank you — your message has been sent." };
  }

  const errors: NonNullable<ContactFormState>["errors"] = {};
  if (values.name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(values.email)) errors.email = "Please enter a valid email address.";
  if (values.message.length < 10) {
    errors.message = "Please write a message of at least 10 characters.";
  }
  if (values.message.length > 5000) errors.message = "Message is too long (max 5000 characters).";
  if (Object.keys(errors).length) return { ok: false, errors, values };

  try {
    await ensureInquiryTables();
    await sql`
      INSERT INTO contact_messages (name, email, phone, subject, message, product_slug)
      VALUES (
        ${values.name.slice(0, 200)},
        ${values.email.slice(0, 200)},
        ${values.phone.slice(0, 50) || null},
        ${values.subject.slice(0, 200) || null},
        ${values.message},
        ${productSlug}
      )
    `;
    revalidatePath("/admin/inbox");
    revalidatePath("/admin/dashboard");
    return {
      ok: true,
      message: "Thank you — your message has been sent. Our team will reply within 1–2 business days.",
    };
  } catch (err) {
    console.error("submitContactMessage:", err);
    return {
      ok: false,
      values,
      errors: { form: "We couldn’t send your message right now. Please email us directly." },
    };
  }
}

export type NewsletterState = { ok: boolean; message: string } | null;

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  try {
    await ensureInquiryTables();
    await sql`
      INSERT INTO newsletter_subscribers (email) VALUES (${email})
      ON CONFLICT (email) DO NOTHING
    `;
    revalidatePath("/admin/inbox");
    return { ok: true, message: "Thanks for subscribing — watch your inbox for new releases." };
  } catch (err) {
    console.error("subscribeNewsletter:", err);
    return { ok: false, message: "Subscription failed. Please try again later." };
  }
}
