"use client";

import { type ReactNode } from "react";
import AdminShell from "@/admin/components/layout/AdminShell";
import type { AdminSession } from "@/admin/lib/session";
import {
  AdminSearchProvider,
  useAdminSearch,
} from "@/admin/context/AdminSearchContext";

function ProtectedShellInner({
  user,
  unread,
  children,
}: {
  user: AdminSession;
  unread: number;
  children: ReactNode;
}) {
  const { search, setSearch, submitSearch } = useAdminSearch();

  return (
    <AdminShell
      user={user}
      search={search}
      onSearch={setSearch}
      onSubmitSearch={submitSearch}
      searchPlaceholder="Search products, media…"
      unread={unread}
    >
      {/* Retain data attribute for backwards compatibility */}
      <div data-admin-search={search}>{children}</div>
    </AdminShell>
  );
}

export default function ProtectedShell({
  user,
  unread,
  children,
}: {
  user: AdminSession;
  unread: number;
  children: ReactNode;
}) {
  return (
    <AdminSearchProvider>
      <ProtectedShellInner user={user} unread={unread}>
        {children}
      </ProtectedShellInner>
    </AdminSearchProvider>
  );
}
