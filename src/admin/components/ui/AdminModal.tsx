"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/** Fuse modal for admin forms (portaled with .admin-portal tokens). */
export default function AdminModal({
  open,
  title,
  onClose,
  children,
  footer,
  width = "max-w-lg",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;
  return createPortal(
    <div className="admin-portal fixed inset-0 z-[250] flex items-end justify-center p-2 md:items-center md:p-4" role="presentation">
      <button type="button" aria-label="Close" className="absolute inset-0 animate-fade-in bg-[#23232314] backdrop-blur-[12px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex max-h-[calc(100vh-32px)] w-full ${width} animate-rise-in flex-col rounded-fuse bg-[var(--admin-surface)] shadow-[var(--admin-shadow-lg)]`}
      >
        <div className="flex items-center justify-between px-6 pb-2 pt-6">
          <h3 className="text-[20px] font-bold text-[var(--admin-heading)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-fuse-md border border-[var(--admin-line-strong)] text-[var(--admin-ink)] hover:border-[#8c8c8c]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="admin-scrollbar flex-1 overflow-y-auto px-6 py-4 text-[var(--admin-ink)]">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 pb-6 pt-2">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
