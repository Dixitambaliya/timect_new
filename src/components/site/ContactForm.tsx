"use client";

import { useActionState } from "react";
import { submitContactMessage, type ContactFormState } from "@/db/inquiries";
import { cx } from "@/lib/cx";
import { ArrowRight, Check } from "@/components/fuse/icons";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[14px] font-semibold text-heading">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-[14px] text-attention">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ContactForm({
  productSlug,
  defaultSubject,
}: {
  productSlug?: string;
  defaultSubject?: string;
}) {
  const [state, action, pending] = useActionState<ContactFormState, FormData>(submitContactMessage, null);

  if (state?.ok) {
    return (
      <div className="flex min-h-[420px] animate-rise-in flex-col items-center justify-center gap-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-heading">
          <Check className="h-8 w-8" />
        </span>
        <h3 className="fuse-h5">Message sent</h3>
        <p className="max-w-sm text-muted">{state.message}</p>
      </div>
    );
  }

  const v = state?.values;
  const e = state?.errors || {};

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {productSlug && <input type="hidden" name="product" value={productSlug} />}
      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Name" error={e.name}>
          <input id="name" name="name" defaultValue={v?.name} autoComplete="name" placeholder="Your name" className="field" aria-invalid={!!e.name} aria-describedby={e.name ? "name-error" : undefined} required />
        </Field>
        <Field id="email" label="Email" error={e.email}>
          <input id="email" name="email" type="email" defaultValue={v?.email} autoComplete="email" placeholder="you@example.com" className="field" aria-invalid={!!e.email} aria-describedby={e.email ? "email-error" : undefined} required />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="phone" label="Phone (optional)">
          <input id="phone" name="phone" type="tel" defaultValue={v?.phone} autoComplete="tel" placeholder="+91" className="field" />
        </Field>
        <Field id="subject" label="Subject">
          <input id="subject" name="subject" defaultValue={v?.subject ?? defaultSubject} placeholder="Order, service, product question…" className="field" />
        </Field>
      </div>
      <Field id="message" label="Message" error={e.message}>
        <textarea
          id="message"
          name="message"
          rows={6}
          defaultValue={v?.message}
          placeholder="How can we help with your Timect watch?"
          className={cx("field resize-y")}
          aria-invalid={!!e.message}
          aria-describedby={e.message ? "message-error" : undefined}
          required
        />
      </Field>
      {e.form && <p className="rounded-fuse-md bg-[#fdeceb] px-4 py-3 text-[14px] text-attention">{e.form}</p>}
      <button type="submit" className="btn-secondary mt-2 w-full" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
        {!pending && <ArrowRight className="h-5 w-5" />}
      </button>
    </form>
  );
}
