import Link from "next/link";
import { ArrowRight, Gift, Inbox, Layers, Package, Palette, Plus, Sparkles, Star, Upload } from "lucide-react";
import { adminGetDashboardStats } from "@/admin/actions/products";
import { adminListMessages } from "@/admin/actions/inbox";
import { adminRecentActivity } from "@/admin/actions/users";
import { PageHeader } from "@/admin/components/layout/Breadcrumbs";
import { catalogThumbUrl } from "@/lib/catalog-image";

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (!Number.isFinite(d)) return "";
  const s = Math.max(0, (Date.now() - d) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function AdminDashboardPage() {
  const [stats, inbox, activity] = await Promise.all([
    adminGetDashboardStats(),
    adminListMessages({ status: "all", pageSize: 5 }),
    adminRecentActivity(8),
  ]);

  const cards = [
    { label: "Total products", value: stats.total, icon: Package, href: "/admin/products" },
    { label: "New arrivals", value: stats.newArrivals, icon: Sparkles, href: "/admin/products?flag=new" },
    { label: "Recommended", value: stats.recommended, icon: Star, href: "/admin/products?flag=recommended" },
    { label: "Collections", value: stats.collections, icon: Layers, href: "/admin/collections" },
    { label: "Corporate gifts", value: stats.corporateGifting, icon: Gift, href: "/admin/corporate-gifting" },
    { label: "Unread messages", value: inbox.counts.new, icon: Inbox, href: "/admin/inbox" },
  ];

  const quick = [
    { href: "/admin/products/new", label: "Create product", icon: Plus },
    { href: "/admin/storefront", label: "Edit homepage", icon: Palette },
    { href: "/admin/media", label: "Upload media", icon: Upload },
    { href: "/admin/collections", label: "Manage collections", icon: Layers },
    { href: "/admin/corporate-gifting", label: "Corporate gifting", icon: Gift },
  ];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Dashboard" }]}
        title="Dashboard"
        description="Catalog overview, enquiries and quick actions"
        actions={
          <>
            <Link href="/admin/storefront" className="admin-btn admin-btn-secondary">
              <Palette className="h-4 w-4" />
              Storefront
            </Link>
            <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
              <Plus className="h-4 w-4" />
              New product
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="admin-card group flex animate-rise-in flex-col p-5 transition-[border-color] duration-400 hover:!border-[var(--admin-accent-border)]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-fuse-md bg-[var(--admin-bg)] text-[var(--admin-heading)]">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--admin-muted)] transition-transform duration-400 group-hover:translate-x-1" />
              </div>
              <p className="text-[36px] font-bold leading-none tabular-nums text-[var(--admin-heading)]">{c.value}</p>
              <p className="mt-2 text-[14px] font-medium text-[var(--admin-muted)]">{c.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <div className="admin-card xl:col-span-2">
          <div className="flex items-center justify-between px-6 pb-2 pt-5">
            <h2 className="text-[18px] font-bold">Recently added</h2>
            <Link href="/admin/products" className="link-hover text-[13px] font-semibold text-[var(--admin-muted)]">
              View all
            </Link>
          </div>
          {stats.recentlyAdded.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-[var(--admin-muted)]">No products yet</p>
          ) : (
            <ul className="grid gap-2 p-3 sm:grid-cols-2">
              {stats.recentlyAdded.map((p) => {
                const title = p.name || p.title || p.collection || "Untitled";
                const img = p.image || p.images?.[0];
                return (
                  <li key={p.id}>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="flex items-center gap-3 rounded-fuse-md bg-[var(--admin-bg)] p-2 transition-colors hover:bg-[var(--admin-accent-soft)]"
                    >
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-white">
                        {img && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={catalogThumbUrl(img, 120)} alt="" className="h-full w-full object-contain p-1" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold">{title}</span>
                        <span className="block truncate text-[12px] text-[var(--admin-muted)]">{p.price}</span>
                      </span>
                      <span className="flex gap-1 pr-2">
                        {p.isNewArrival && <span className="admin-badge">New</span>}
                        {p.isRecommended && <span className="admin-badge admin-badge-success">Rec</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="admin-card p-5">
          <h2 className="mb-4 text-[18px] font-bold">Quick actions</h2>
          <div className="space-y-2">
            {quick.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-fuse-md border border-[var(--admin-line-strong)] bg-[var(--admin-surface-2)] px-4 py-3 text-[14px] font-semibold transition-colors duration-400 hover:border-[#8c8c8c] hover:bg-[var(--admin-surface)]"
              >
                <Icon className="h-4 w-4 text-[var(--admin-heading)]" />
                <span className="flex-1">{label}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-400 group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-card xl:col-span-2">
          <div className="flex items-center justify-between px-6 pb-2 pt-5">
            <h2 className="text-[18px] font-bold">Latest enquiries</h2>
            <Link href="/admin/inbox" className="link-hover text-[13px] font-semibold text-[var(--admin-muted)]">
              Open inbox
            </Link>
          </div>
          {inbox.items.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-[var(--admin-muted)]">
              No messages yet — contact form submissions will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--admin-line)] px-3 pb-3">
              {inbox.items.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/inbox?open=${m.id}`} className="flex items-start gap-3 rounded-fuse-md px-3 py-3 hover:bg-[var(--admin-bg)]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--admin-accent-soft)] text-[13px] font-bold text-[var(--admin-heading)]">
                      {m.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[14px] font-semibold">{m.name}</span>
                        {m.status === "new" && <span className="admin-badge admin-badge-warning">New</span>}
                      </span>
                      <span className="block truncate text-[13px] text-[var(--admin-muted)]">{m.subject || m.message}</span>
                    </span>
                    <span className="shrink-0 text-[12px] text-[var(--admin-muted)]">{timeAgo(m.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-card p-5">
          <h2 className="mb-4 text-[18px] font-bold">Team activity</h2>
          {activity.length === 0 ? (
            <p className="py-6 text-sm text-[var(--admin-muted)]">No activity recorded yet.</p>
          ) : (
            <ol className="relative space-y-4 border-s border-[var(--admin-line)] ps-5">
              {activity.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -start-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--admin-accent-border)]" />
                  <p className="text-[14px]">
                    <span className="font-semibold">{a.adminName || "Someone"}</span>{" "}
                    <span className="text-[var(--admin-muted)]">
                      {a.action.replace("_", " ")} {a.entityType?.replace("_", " ")}
                      {a.entityId && a.entityType === "product" ? ` #${a.entityId}` : ""}
                    </span>
                  </p>
                  <p className="text-[12px] text-[var(--admin-muted)]">{timeAgo(a.createdAt)}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
