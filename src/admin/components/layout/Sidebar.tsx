"use client";

import { useState } from "react";
import Link from "@/admin/lib/navigation";
import { usePathname } from "@/admin/lib/navigation";
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
  BookOpen,
  Activity,
  X,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { TIMECT_LOGO } from "@/data/storefront";

type SubItem = {
  href: string;
  label: string;
};

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: "inbox";
  children?: SubItem[];
};

type Group = {
  title: string;
  items: Item[];
};

const GROUPS: Group[] = [
  {
    title: "Catalog",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/collections", label: "Collections", icon: Layers },
      { href: "/admin/corporate-gifting", label: "Corporate Gifting", icon: Gift },
      { href: "/admin/media", label: "Media", icon: ImageIcon },
      { href: "/admin/recycle-bin", label: "Recycle Bin", icon: RotateCcw },
    ],
  },
  {
    title: "Blogs",
    items: [
      { href: "/admin/blog", label: "Blogs", icon: BookOpen },
    ],
  },
  {
    title: "Storefront",
    items: [
      { href: "/admin/live-visitors", label: "Live Visitors", icon: Activity },
      {
        href: "/admin/storefront",
        label: "Homepage & content",
        icon: Palette,
        children: [
          { href: "/admin/storefront", label: "Homepage sections" },
          { href: "/admin/whatsapp", label: "WhatsApp Button" },
        ],
      },
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
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (label: string, defaultOpen: boolean) => {
    setOpenDropdowns((prev) => {
      const current = prev[label] ?? defaultOpen;
      return { ...prev, [label]: !current };
    });
  };

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
        className={`admin-sidebar-panel fixed top-2 left-2 z-50 flex w-[280px] flex-col rounded-fuse shadow-sm transition-transform duration-300 ease-fuse-out lg:sticky lg:top-3 lg:[--sidebar-inset:0.75rem] lg:translate-x-0 ${
          open ? "translate-x-0 shadow-[0_20px_60px_rgba(0,0,0,.15)]" : "-translate-x-[calc(100%+24px)] max-lg:pointer-events-none"
        }`}
      >
        {/* Brand header */}
        <div className="flex shrink-0 items-center justify-between px-4 pb-2.5 pt-4 sm:px-5 sm:pt-4">
          <Link href="/admin/dashboard" style={{ gap: "0.5rem" }} className="flex items-center gap-[0.5rem]" onClick={onClose}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={TIMECT_LOGO} alt="" className="h-9 w-9 shrink-0 rounded-full bg-white object-contain shadow-xs ring-1 ring-black/5" />
            <span className="font-chivo text-[19px] font-black uppercase tracking-[0.14em] text-[var(--admin-heading)]">
              Timect
            </span>
            <span className="admin-badge text-[10px] px-2 py-0.5">Admin</span>
          </Link>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-fuse-md hover:bg-[var(--admin-bg)] lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="admin-sidebar-nav">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="admin-sidebar-group-title px-3 font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                {group.title}
              </p>
              <ul className="admin-sidebar-items">
                {group.items.map((item) => {
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  const isChildActive = item.children?.some((c) => pathname === c.href);
                  const isParentActive =
                    pathname === item.href ||
                    (!hasChildren && item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                  const active = isParentActive || isChildActive;
                  const Icon = item.icon;
                  const count = "badge" in item && item.badge === "inbox" ? unread : 0;
                  const isOpen = hasChildren ? (openDropdowns[item.label] ?? Boolean(isChildActive)) : false;

                  return (
                    <li key={item.label} className="admin-sidebar-item">
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleDropdown(item.label, Boolean(isChildActive))}
                          style={{ gap: "0.5rem" }}
                          aria-expanded={isOpen}
                          className={`admin-sidebar-link group flex w-full items-center gap-[0.5rem] rounded-fuse-md border px-3.5 text-left transition-colors duration-200 cursor-pointer ${
                            active
                              ? "border-[var(--admin-accent-border)] bg-[var(--admin-accent-soft)] font-semibold text-[var(--admin-heading)]"
                              : "border-transparent font-medium text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-ink)]"
                          }`}
                        >
                          <Icon className="admin-sidebar-icon shrink-0" strokeWidth={1.85} />
                          <span className="flex-1 truncate">{item.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-[var(--admin-muted)] transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            strokeWidth={2}
                          />
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          style={{ gap: "0.5rem" }}
                          className={`admin-sidebar-link group flex items-center gap-[0.5rem] rounded-fuse-md border px-3.5 transition-colors duration-200 ${
                            isParentActive
                              ? "border-[var(--admin-accent-border)] bg-[var(--admin-accent-soft)] font-semibold text-[var(--admin-heading)]"
                              : "border-transparent font-medium text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-ink)]"
                          }`}
                        >
                          <Icon className="admin-sidebar-icon shrink-0" strokeWidth={1.85} />
                          <span className="flex-1 truncate">{item.label}</span>
                          {count > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--admin-accent)] px-1.5 text-[11px] font-bold text-[var(--admin-surface)]">
                              {count > 99 ? "99+" : count}
                            </span>
                          )}
                        </Link>
                      )}

                      {hasChildren && isOpen && (
                        <ul className="admin-sidebar-children ms-4 mt-1 space-y-0.5 border-s border-[var(--admin-line)] ps-3.5">
                          {item.children!.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  style={{ gap: "0.5rem" }}
                                  className={`admin-sidebar-child-link flex items-center gap-[0.5rem] rounded-fuse-sm px-3 py-1.5 transition ${
                                    childActive
                                      ? "bg-[var(--admin-accent-soft)] font-semibold text-[var(--admin-heading)]"
                                      : "font-medium text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-ink)]"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                      childActive ? "bg-[var(--admin-accent)]" : "bg-[var(--admin-line-strong)]"
                                    }`}
                                  />
                                  <span className="truncate">{child.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Storefront button footer */}
        <div className="shrink-0 p-3 pt-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-fuse-md bg-[var(--admin-accent)] px-4 py-3 text-[14px] font-semibold text-[var(--admin-surface)] transition-opacity hover:opacity-90 shadow-sm"
          >
            <span>View storefront</span>
            <ExternalLink className="h-4.5 w-4.5" />
          </a>
        </div>
      </aside>
    </>
  );
}
