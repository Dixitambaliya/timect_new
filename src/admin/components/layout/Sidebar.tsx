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
  BookOpen,
  Activity,
  MessageCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { TIMECT_LOGO } from "@/data/storefront";

type SubItem = {
  href: string;
  label: string;
};

type Item = {
  href: string;
  label: string;
  icon: any;
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
    ],
  },
  {
    title: "Blogs",
    items: [
      { href: "/admin/blog", label: "Articles", icon: BookOpen },
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
          open ? "translate-x-0" : "-translate-x-[calc(100%+24px)] max-lg:pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-2.5 pt-3.5 sm:px-5 sm:pb-3 sm:pt-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={TIMECT_LOGO} alt="" className="h-8 w-8 shrink-0 rounded-full bg-white object-contain" />
            <span className="font-chivo text-[18px] font-black uppercase tracking-[0.14em] text-[var(--admin-heading)]">
              Timect
            </span>
            <span className="admin-badge text-[10px]">Admin</span>
          </Link>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-fuse-md hover:bg-[var(--admin-bg)] lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="no-scrollbar flex-1 space-y-2.5 2xl:space-y-4 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-2.5 pb-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isChildActive = item.children?.some((c) => pathname === c.href);
                  const isParentActive =
                    pathname === item.href ||
                    (!item.children && item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                  const active = isParentActive || isChildActive;
                  const Icon = item.icon;
                  const count = "badge" in item && item.badge === "inbox" ? unread : 0;
                  return (
                    <li key={item.href} className="space-y-0.5">
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`group flex items-center gap-2.5 rounded-fuse-md border px-2.5 py-1.5 text-[13.5px] transition-colors duration-300 ${
                          isParentActive && !isChildActive
                            ? "border-[var(--admin-accent-border)] bg-[var(--admin-accent-soft)] font-semibold text-[var(--admin-heading)]"
                            : active
                              ? "border-transparent font-semibold text-[var(--admin-heading)]"
                              : "border-transparent font-medium text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-ink)]"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                        <span className="flex-1">{item.label}</span>
                        {count > 0 && (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--admin-accent)] px-1 text-[10px] font-bold text-[var(--admin-surface)]">
                            {count > 99 ? "99+" : count}
                          </span>
                        )}
                      </Link>
                      {item.children && (
                        <ul className="ms-3 space-y-0.5 border-s border-[var(--admin-line)] ps-2.5 pt-0.5 pb-0.5">
                          {item.children.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className={`flex items-center gap-2 rounded-fuse-sm px-2 py-1 text-[12px] transition ${
                                    childActive
                                      ? "bg-[var(--admin-accent-soft)] font-semibold text-[var(--admin-heading)]"
                                      : "font-medium text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-ink)]"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      childActive ? "bg-[var(--admin-accent)]" : "bg-[var(--admin-line-strong)]"
                                    }`}
                                  />
                                  <span>{child.label}</span>
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

        <div className="p-2.5 pt-1.5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-fuse-md bg-[var(--admin-accent)] px-3.5 py-2 text-[13px] font-semibold text-[var(--admin-surface)] transition-opacity hover:opacity-90 shadow-sm"
          >
            View storefront
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </aside>
    </>
  );
}
