"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ShopCategory } from "@/db/content";
import type { StorefrontSettings } from "@/data/storefront";

type Panel = "menu" | "search" | null;

type SiteContextValue = {
  categories: ShopCategory[];
  storefront: StorefrontSettings;
  whatsappNumber: string;
  panel: Panel;
  openPanel: (p: Exclude<Panel, null>) => void;
  closePanel: () => void;
  quickView: string | null;
  openQuickView: (slug: string) => void;
  closeQuickView: () => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

/** Global storefront state: shop data from the CMS + which overlay is open. */
export function SiteProvider({
  categories,
  storefront,
  whatsappNumber,
  children,
}: {
  categories: ShopCategory[];
  storefront: StorefrontSettings;
  whatsappNumber: string;
  children: ReactNode;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const [quickView, setQuickView] = useState<string | null>(null);

  const value = useMemo<SiteContextValue>(
    () => ({
      categories,
      storefront,
      whatsappNumber,
      panel,
      openPanel: (p) => {
        setQuickView(null);
        setPanel(p);
      },
      closePanel: () => setPanel(null),
      quickView,
      openQuickView: (slug) => {
        setPanel(null);
        setQuickView(slug);
      },
      closeQuickView: () => setQuickView(null),
    }),
    [categories, storefront, whatsappNumber, panel, quickView],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}

/** Build a WhatsApp deep link for a product / general enquiry. */
export function whatsappLink(number: string, message: string): string {
  const digits = (number || "").replace(/[^\d]/g, "") || "919999999999";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
