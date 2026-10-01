"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  toast: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastSeq = 0;

/** Solid, high-contrast styles — do not rely on admin CSS vars (they can wash out). */
const TOAST_STYLES: Record<
  ToastKind,
  {
    container: string;
    icon: string;
    text: string;
    close: string;
    Icon: typeof CheckCircle2;
  }
> = {
  success: {
    container:
      "border border-emerald-200 bg-emerald-50 text-emerald-950 shadow-lg shadow-emerald-900/10",
    icon: "text-emerald-600",
    text: "text-emerald-950",
    close: "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-950",
    Icon: CheckCircle2,
  },
  error: {
    container:
      "border border-red-200 bg-red-50 text-red-950 shadow-lg shadow-red-900/10",
    icon: "text-red-600",
    text: "text-red-950",
    close: "text-red-700 hover:bg-red-100 hover:text-red-950",
    Icon: XCircle,
  },
  info: {
    container:
      "border border-slate-200 bg-white text-[var(--admin-heading)] shadow-lg shadow-slate-900/10",
    icon: "text-[var(--admin-muted)]",
    text: "text-[var(--admin-heading)]",
    close: "text-[var(--admin-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-heading)]",
    Icon: Info,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = ++toastSeq;
      setItems((prev) => [...prev, { id, kind, message }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (m) => toast(m, "success"),
      error: (m) => toast(m, "error"),
      info: (m) => toast(m, "info"),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Top-right toast stack — high contrast, readable on light admin UI */}
      <div
        className="pointer-events-none fixed top-4 right-4 z-[200] flex w-[min(100vw-2rem,24rem)] flex-col items-stretch gap-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        {items.map((t) => {
          const style = TOAST_STYLES[t.kind];
          const Icon = style.Icon;
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex w-full items-start gap-3 rounded-fuse-md px-4 py-3.5 text-sm font-medium ${style.container} animate-[admin-toast-in_0.25s_ease-out]`}
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`}
                aria-hidden
              />
              <p className={`flex-1 leading-snug ${style.text}`}>{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className={`-mr-1 -mt-0.5 rounded-lg p-1 transition-colors ${style.close}`}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
