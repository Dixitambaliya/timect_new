"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Fuse modal confirm dialog. Portaled to document.body (with .admin-portal
 * tokens) so sticky/backdrop-filter ancestors can't break fixed positioning.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel, loading]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="admin-portal fixed inset-0 z-[300] flex items-end justify-center p-2 md:items-center md:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-[#23232314] backdrop-blur-[12px]"
        aria-label="Close dialog"
        onClick={() => {
          if (!loading) onCancel();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        className="relative z-10 w-full max-w-md animate-rise-in rounded-fuse bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow-lg)] md:p-8"
      >
        {danger && (
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-fuse-md bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]">
            <AlertTriangle className="h-5 w-5" />
          </span>
        )}
        <h3 id="admin-confirm-title" className="text-[20px] font-bold text-[var(--admin-heading)]">
          {title}
        </h3>
        {description && <p className="mt-2 text-[15px] leading-relaxed text-[var(--admin-muted)]">{description}</p>}
        <div className="mt-8 grid grid-cols-2 gap-2">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`admin-btn ${danger ? "admin-btn-danger" : "admin-btn-primary"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
