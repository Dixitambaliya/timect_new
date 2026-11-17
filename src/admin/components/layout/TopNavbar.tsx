"use client";

import { useState, useTransition } from "react";
import { LogOut, Menu, Moon, Search, Sun, X } from "lucide-react";
import { logoutAdmin } from "@/admin/actions/auth";
import type { AdminSession } from "@/admin/lib/session";
import ConfirmDialog from "@/admin/components/ui/ConfirmDialog";

const iconBtn =
  "flex h-9 w-9 shrink-0 sm:h-11 sm:w-11 items-center justify-center rounded-fuse-md border border-[var(--admin-line-strong)] bg-[var(--admin-surface-2)] text-[var(--admin-ink)] transition-colors duration-400 hover:border-[#8c8c8c] hover:bg-[var(--admin-surface)]";

export default function TopNavbar({
  user,
  dark,
  onToggleDark,
  onMenu,
  search,
  onSearch,
  onSubmitSearch,
  searchPlaceholder = "Search…",
}: {
  user: AdminSession;
  dark: boolean;
  onToggleDark: () => void;
  onMenu: () => void;
  search?: string;
  onSearch?: (v: string) => void;
  onSubmitSearch?: (v: string) => void;
  searchPlaceholder?: string;
}) {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [pending, startTransition] = useTransition();
  const searchValue = search || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitSearch) {
      onSubmitSearch(searchValue);
    }
  };

  return (
    <header className="flex h-14 md:h-[68px] items-center gap-2.5 sm:gap-3 rounded-fuse border border-[var(--admin-line)] bg-[var(--admin-surface)] px-3 shadow-sm md:px-4">
      <button type="button" className={`${iconBtn} lg:hidden`} onClick={onMenu} aria-label="Open menu">
        <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {onSearch && (
        <form
          role="search"
          onSubmit={handleSubmit}
          className="relative min-w-0 flex-1 md:max-w-lg"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" aria-hidden />
          <input
            type="text"
            role="searchbox"
            name="admin_catalog_search"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmitSearch?.(searchValue);
              }
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="admin-input h-9 w-full min-w-0 !border-transparent !bg-[var(--admin-bg)] !text-base sm:h-11 sm:!text-sm"
            style={{ paddingLeft: "2.6rem", paddingRight: "2.6rem" }}
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="absolute right-2 top-1/2 z-[1] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-fuse-sm text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-ink)]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </form>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button type="button" className={iconBtn} onClick={onToggleDark} aria-label="Toggle dark mode" title="Toggle theme">
          {dark ? <Sun className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> : <Moon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />}
        </button>

        <div className="hidden items-center gap-3 rounded-fuse-md bg-[var(--admin-bg)] py-1.5 pl-1.5 pr-4 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--admin-accent)] text-sm font-bold text-[var(--admin-surface)]">
            {(user.fullName || user.email).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold text-[var(--admin-ink)]">{user.fullName || "Admin"}</p>
            <p className="truncate text-[11px] capitalize text-[var(--admin-muted)]">{user.role.replace("_", " ")}</p>
          </div>
        </div>

        <button type="button" className={iconBtn} title="Log out" aria-label="Log out" onClick={() => setConfirmLogout(true)}>
          <LogOut className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        description="Are you sure you want to log out of the Timect admin panel?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        danger
        loading={pending}
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => startTransition(async () => {
          await logoutAdmin();
        })}
      />
    </header>
  );
}
