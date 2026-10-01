"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Gift,
  ImageIcon,
  Inbox,
  Layers,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  Users,
  X,
} from "lucide-react";
import { TIMECT_LOGO } from "@/data/storefront";

const GROUPS = [
  {
    title: "Catalog",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/collections", label: "Collections", icon: Layers },
      { href: "/admin/corporate-gifting", label: "Corporate Gifting", icon: Gift },
      { href: "/admin/media", label: "Media", icon: ImageIcon },
    ],
  },
  {
    title: "Storefront",
    items: [
      { href: "/admin/storefront", label: "Homepage & content", icon: Palette },
      { href: "/admin/inbox", label: "Inbox", icon: Inbox, badge: "inbox" as const },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/users", label: "Team", icon: Users },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar({
  open,
  onClose,
  unread = 0,
}: {
  open: boolean;
  onClose: () => void;
  unread?: number;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#23232314] backdrop-blur-[12px] lg:hidden"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      )}

      <aside
        className={`admin-sidebar-panel fixed inset-y-2 left-2 z-50 flex w-[272px] flex-col rounded-fuse shadow-[0_20px_60px_rgba(0,0,0,.12)] transition-transform duration-[550ms] ease-fuse-out lg:sticky lg:top-3 lg:h-[calc(100vh-24px)] lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-[calc(100%+24px)]"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={TIMECT_LOGO} alt="" className="h-9 w-9 rounded-full bg-white object-contain" />
            <span className="font-chivo text-[20px] font-black uppercase tracking-[0.16em] text-[var(--admin-heading)]">
              Timect
            </span>
            <span className="admin-badge">Admin</span>
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-fuse-md hover:bg-[var(--admin-bg)] lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="admin-scrollbar flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  const count = "badge" in item && item.badge === "inbox" ? unread : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`group flex items-center gap-3 rounded-fuse-md border px-3 py-2.5 text-[15px] font-semibold transition-colors duration-400 ${
                          active
                            ? "border-[var(--admin-accent-border)] bg-[var(--admin-accent-soft)] text-[var(--admin-heading)]"
                            : "border-transparent text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-ink)]"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
                        <span className="flex-1">{item.label}</span>
                        {count > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--admin-accent)] px-1.5 text-[11px] text-[var(--admin-surface)]">
                            {count > 99 ? "99+" : count}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-fuse-md bg-[var(--admin-accent)] px-4 py-3 text-[14px] font-semibold text-[var(--admin-surface)] transition-opacity hover:opacity-90"
          >
            View storefront
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </aside>
    </>
  );
}
