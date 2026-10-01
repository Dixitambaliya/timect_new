"use client";

import { useEffect, useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import type { AdminSession } from "@/admin/lib/session";
import { ToastProvider } from "@/admin/hooks/useToast";

const THEME_KEY = "timect-admin-theme";

export default function AdminShell({
  user,
  children,
  search,
  onSearch,
  searchPlaceholder,
  unread = 0,
}: {
  user: AdminSession;
  children: ReactNode;
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  unread?: number;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(THEME_KEY) === "dark") setDark(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  // Mirror the theme on <html> so portaled dialogs (outside .admin-root) match.
  useEffect(() => {
    document.documentElement.dataset.adminTheme = dark ? "dark" : "light";
    return () => {
      delete document.documentElement.dataset.adminTheme;
    };
  }, [dark]);

  const toggleDark = () => {
    setDark((d) => {
      try {
        localStorage.setItem(THEME_KEY, d ? "light" : "dark");
      } catch {
        /* storage unavailable */
      }
      return !d;
    });
  };

  return (
    <ToastProvider>
      <div className={`admin-root flex min-h-screen gap-3 p-2 md:p-3 ${dark ? "admin-dark" : ""}`}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} unread={unread} />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <TopNavbar
            user={user}
            dark={dark}
            onToggleDark={toggleDark}
            onMenu={() => setSidebarOpen(true)}
            search={search}
            onSearch={onSearch}
            searchPlaceholder={searchPlaceholder}
          />
          <main className="flex-1 px-1 pb-6 pt-2 md:px-2 lg:px-3">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
