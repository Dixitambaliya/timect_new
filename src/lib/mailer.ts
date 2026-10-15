import nodemailer, { type Transporter } from "nodemailer";

/**
 * SMTP mailer (nodemailer). Configure via env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, [SMTP_SECURE], [MAIL_FROM]
 * If SMTP isn't configured, sending is skipped (and logged) so forms keep working.
 */

let transporter: Transporter | null = null;

export function isMailerConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter(): Transporter {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT || 587);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  if (!isMailerConfigured()) {
    console.warn("sendMail: SMTP not configured, skipping email:", opts.subject);
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM || `"Timect" <${process.env.SMTP_USER}>`,
      ...opts,
    });
    return true;
  } catch (err) {
    console.error("sendMail:", err);
    return false;
  }
}
