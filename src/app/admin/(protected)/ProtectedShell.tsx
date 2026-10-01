"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminShell from "@/admin/components/layout/AdminShell";
import type { AdminSession } from "@/admin/lib/session";

export default function ProtectedShell({
  user,
  unread,
  children,
}: {
  user: AdminSession;
  unread: number;
  children: ReactNode;
}) {
  const [search, setSearch] = useState("");
  const pathname = usePathname();

  // Clear top-nav search when landing on the products list (e.g. after Publish)
  // so leftover / autofilled text never hides the full catalog.
  useEffect(() => {
    if (pathname === "/admin/products") {
      setSearch("");
    }
  }, [pathname]);

  useEffect(() => {
    const onClear = () => setSearch("");
    window.addEventListener("admin:clear-search", onClear);
    return () => window.removeEventListener("admin:clear-search", onClear);
  }, []);

  return (
    <AdminShell
      user={user}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search products, media…"
      unread={unread}
    >
      {/* Pass search via context-like data attribute for client pages that need it */}
      <div data-admin-search={search}>{children}</div>
    </AdminShell>
  );
}
