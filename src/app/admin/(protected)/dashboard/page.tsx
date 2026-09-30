import Link from "next/link";
import {
  Layers,
  Package,
  Plus,
  Sparkles,
  Star,
  Link2,
} from "lucide-react";
import { adminGetDashboardStats } from "@/admin/actions/products";
import Breadcrumbs from "@/admin/components/layout/Breadcrumbs";

export default async function AdminDashboardPage() {
  const stats = await adminGetDashboardStats();

  const cards = [
    {
      label: "Total products",
      value: stats.total,
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "New arrivals",
      value: stats.newArrivals,
      icon: Sparkles,
      href: "/admin/products?flag=new",
    },
    {
      label: "Recommended",
      value: stats.recommended,
      icon: Star,
      href: "/admin/products?flag=recommended",
    },
    {
      label: "Related",
      value: stats.related,
      icon: Link2,
      href: "/admin/products?flag=related",
    },
    {
      label: "Collections",
      value: stats.collections,
      icon: Layers,
      href: "/admin/collections",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumbs items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Dashboard" }]} />
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Catalog overview and quick actions
          </p>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          <Plus className="h-4 w-4" />
          New product
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="admin-card group p-5 transition hover:border-[var(--admin-accent)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
                  {c.label}
                </span>
                <Icon className="h-4 w-4 text-[var(--admin-muted)] group-hover:text-[var(--admin-accent)]" />
              </div>
              <p className="text-3xl font-semibold tabular-nums">{c.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="admin-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--admin-line)] px-5 py-4">
            <h2 className="text-sm font-semibold">Recently added</h2>
            <Link
              href="/admin/products"
              className="text-xs font-medium text-[var(--admin-muted)] hover:text-[var(--admin-ink)]"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-[var(--admin-line)]">
            {stats.recentlyAdded.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-[var(--admin-muted)]">
                No products yet
              </p>
            ) : (
              stats.recentlyAdded.map((p) => {
                const title =
                  p.name || p.title || p.collection || "Untitled";
                const img = p.image || p.images?.[0];
                return (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}/edit`}
                    className="flex items-center gap-3 px-5 py-3 transition hover:bg-[var(--admin-bg)]"
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[var(--admin-bg)]">
                      {img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{title}</p>
                      <p className="truncate text-xs text-[var(--admin-muted)]">
                        {p.price}
                        {p.slug ? ` · ${p.slug}` : ""}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="admin-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Quick actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/products/new"
              className="admin-btn admin-btn-secondary w-full justify-start"
            >
              <Plus className="h-4 w-4" />
              Create product
            </Link>
            <Link
              href="/admin/media"
              className="admin-btn admin-btn-secondary w-full justify-start"
            >
              Upload media
            </Link>
            <Link
              href="/admin/collections"
              className="admin-btn admin-btn-secondary w-full justify-start"
            >
              Manage collections
            </Link>
            <a
              href="/watches"
              target="_blank"
              rel="noreferrer"
              className="admin-btn admin-btn-ghost w-full justify-start"
            >
              Open storefront
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
