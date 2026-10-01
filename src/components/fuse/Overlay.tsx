"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/cx";
import { useEscape, usePresence, useScrollLock } from "./hooks";
import { CloseIcon } from "./icons";

/** Blurred page scrim used behind every Fuse drawer / modal. */
function Scrim({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <div
      aria-hidden
      onClick={onClick}
      className={cx(
        "fixed inset-0 bg-[#23232314] transition-[opacity,backdrop-filter] duration-400",
        visible ? "opacity-100 backdrop-blur-[12px]" : "opacity-0 backdrop-blur-0",
      )}
    />
  );
}

function useFocusTrap(active: boolean, ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const t = setTimeout(() => {
      const f =
        el.querySelector<HTMLElement>("[data-autofocus]") ||
        el.querySelector<HTMLElement>("button, a, input, select, textarea");
      f?.focus({ preventScroll: true });
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = [
        ...el.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input, select, textarea"),
      ].filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      el.removeEventListener("keydown", onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [active, ref]);
}

/**
 * Inset frosted drawer (16px from the viewport edges, 16px radius) that slides
 * in from the side — the signature Fuse panel used for menu, search and filters.
 */
export function Drawer({
  open,
  onClose,
  side = "left",
  width = "md:w-[600px]",
  label,
  className,
  children,
  aside,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  width?: string;
  label: string;
  className?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  const { mounted, visible } = usePresence(open, 500);
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  useEscape(open, onClose);
  useFocusTrap(open, panel);
  if (!mounted) return null;
  const from = side === "left" ? "-translate-x-[calc(100%+32px)]" : "translate-x-[calc(100%+32px)]";
  return createPortal(
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={label}>
      <Scrim visible={visible} onClick={onClose} />
      <div
        className={cx(
          "absolute inset-y-2 flex gap-4 md:inset-y-4",
          side === "left" ? "left-2 md:left-4" : "right-2 flex-row-reverse md:right-4",
          "max-w-[calc(100vw-16px)] md:max-w-[calc(100vw-32px)]",
        )}
      >
        <div
          ref={panel}
          className={cx(
            "frost relative flex h-full w-[calc(100vw-16px)] flex-col overflow-hidden rounded-fuse shadow-[0_20px_60px_rgba(0,0,0,.12)] transition-transform duration-[550ms] ease-fuse-out",
            width,
            visible ? "translate-x-0" : from,
            className,
          )}
        >
          {children}
        </div>
        {aside && (
          <div
            className={cx(
              "hidden h-full transition-[transform,opacity] delay-100 duration-[550ms] ease-fuse-out lg:block",
              visible ? "translate-x-0 opacity-100" : cx(from, "opacity-0"),
            )}
          >
            {aside}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function Modal({
  open,
  onClose,
  label,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const { mounted, visible } = usePresence(open, 450);
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  useEscape(open, onClose);
  useFocusTrap(open, panel);
  if (!mounted) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-2 md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <Scrim visible={visible} onClick={onClose} />
      <div
        ref={panel}
        className={cx(
          "frost relative max-h-[calc(100vh-16px)] w-full overflow-hidden rounded-fuse shadow-[0_24px_80px_rgba(0,0,0,.18)] transition-[transform,opacity] duration-400 ease-fuse-out md:max-h-[calc(100vh-48px)]",
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-[.98] opacity-0",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function CloseButton({
  onClick,
  className,
  label = "Close",
}: {
  onClick: () => void;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cx(
        "inline-flex h-12 w-12 items-center justify-center rounded-fuse-md border border-line bg-white text-ink transition-colors duration-400 hover:border-line-hover md:h-[56px] md:w-[56px]",
        className,
      )}
    >
      <CloseIcon className="h-6 w-6" />
    </button>
  );
}
