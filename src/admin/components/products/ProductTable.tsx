"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { Product } from "@/db/actions";
import {
  adminBulkDeleteProducts,
  adminBulkUpdateFlags,
  adminDeleteProduct,
  adminDuplicateProduct,
  adminListProducts,
  type ProductListFilters,
} from "@/admin/actions/products";
import { useToast } from "@/admin/hooks/useToast";
import ConfirmDialog from "@/admin/components/ui/ConfirmDialog";
import EmptyState from "@/admin/components/ui/EmptyState";
import Pagination from "@/admin/components/ui/Pagination";
import { TableSkeleton } from "@/admin/components/ui/Skeleton";
import { GENDER_OPTIONS } from "@/admin/lib/constants";
import ProductImportExport from "./ProductImportExport";

export default function ProductTable({
  initialSearch = "",
  initialFlag = "all",
}: {
  initialSearch?: string;
  initialFlag?: ProductListFilters["flag"];
}) {
  const { success, error } = useToast();
  const [filters, setFilters] = useState<ProductListFilters>({
    search: initialSearch,
    flag: initialFlag || "all",
    sortBy: "newest",
    page: 1,
    pageSize: 20,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<
    | null
    | { type: "delete"; id: number }
    | { type: "bulk-delete" }
  >(null);
  const [menuId, setMenuId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminListProducts(filters);
      setProducts(res.products);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setFilters((f) => ({ ...f, search: initialSearch, page: 1 }));
  }, [initialSearch]);

  useEffect(() => {
    if (initialFlag) {
      setFilters((f) => ({ ...f, flag: initialFlag, page: 1 }));
    }
  }, [initialFlag]);

  const toggleAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  };

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runDelete = (id: number) => {
    startTransition(async () => {
      const res = await adminDeleteProduct(id);
      if (!res.ok) error(res.error);
      else {
        success("Product deleted");
        setSelected((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
        await load();
      }
      setConfirm(null);
    });
  };

  const runBulkDelete = () => {
    startTransition(async () => {
      const res = await adminBulkDeleteProducts(Array.from(selected));
      if (!res.ok) error(res.error);
      else {
        success(`Deleted ${res.count} product(s)`);
        setSelected(new Set());
        await load();
      }
      setConfirm(null);
    });
  };

  const runBulkFlag = (flags: Parameters<typeof adminBulkUpdateFlags>[1]) => {
    startTransition(async () => {
      const res = await adminBulkUpdateFlags(Array.from(selected), flags);
      if (!res.ok) error(res.error);
      else {
        success(`Updated ${res.count} product(s)`);
        await load();
      }
    });
  };

  const runDuplicate = (id: number) => {
    startTransition(async () => {
      const res = await adminDuplicateProduct(id);
      if (!res.ok) error(res.error);
      else {
        success("Product duplicated");
        await load();
      }
      setMenuId(null);
    });
  };

  const selectedProducts = products.filter((p) => selected.has(p.id));
  const hasSelected = selectedProducts.length > 0;
  const allNew = hasSelected && selectedProducts.every((p) => p.isNewArrival);
  const allRec = hasSelected && selectedProducts.every((p) => p.isRecommended);
  const allRel = hasSelected && selectedProducts.every((p) => p.isRelated);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select
            className="admin-input w-auto"
            value={filters.flag || "all"}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                flag: e.target.value as ProductListFilters["flag"],
                page: 1,
              }))
            }
          >
            <option value="all">All flags</option>
            <option value="main">Main</option>
            <option value="new">New arrivals</option>
            <option value="recommended">Recommended</option>
            <option value="related">Related</option>
          </select>
          <select
            className="admin-input w-auto"
            value={filters.gender || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                gender: e.target.value || undefined,
                page: 1,
              }))
            }
          >
            <option value="">All genders</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            className="admin-input w-auto"
            value={filters.sortBy || "newest"}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                sortBy: e.target.value as ProductListFilters["sortBy"],
                page: 1,
              }))
            }
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <ProductImportExport onImported={() => void load()} />
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="admin-card flex flex-wrap items-center gap-2 px-4 py-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button
            type="button"
            className="admin-btn admin-btn-secondary text-xs"
            disabled={pending}
            onClick={() => runBulkFlag({ isNewArrival: !allNew })}
          >
            {allNew ? "Unmark new" : "Mark new"}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary text-xs"
            disabled={pending}
            onClick={() => runBulkFlag({ isRecommended: !allRec })}
          >
            {allRec ? "Unmark recommended" : "Mark recommended"}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary text-xs"
            disabled={pending}
            onClick={() => runBulkFlag({ isRelated: !allRel })}
          >
            {allRel ? "Unmark related" : "Mark related"}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-danger text-xs"
            disabled={pending}
            onClick={() => setConfirm({ type: "bulk-delete" })}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}

      <div className="admin-card overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : products.length === 0 ? (
          <EmptyState
            title={
              filters.search?.trim()
                ? "No products match your search"
                : "No products found"
            }
            description={
              filters.search?.trim()
                ? `Nothing matched “${filters.search.trim()}”. Clear search or adjust filters.`
                : "Try adjusting filters or create your first product."
            }
            action={
              filters.search?.trim() ||
              (filters.flag && filters.flag !== "all") ||
              filters.gender ? (
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    window.dispatchEvent(new Event("admin:clear-search"));
                    setFilters((f) => ({
                      ...f,
                      search: "",
                      flag: "all",
                      gender: undefined,
                      page: 1,
                    }));
                  }}
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  href="/admin/products/new"
                  className="admin-btn admin-btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Add product
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[var(--admin-line)] bg-[var(--admin-bg)] text-xs uppercase tracking-wider text-[var(--admin-muted)]">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        products.length > 0 &&
                        selected.size === products.length
                      }
                      onChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Flags</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const title = p.name || p.title || p.collection || "Untitled";
                  const img = p.image || p.images?.[0];
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-[var(--admin-line)] last:border-0 hover:bg-[var(--admin-bg)]/60"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggle(p.id)}
                          aria-label={`Select ${title}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--admin-bg)]">
                            {img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={img}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{title}</p>
                            <p className="truncate text-xs text-[var(--admin-muted)]">
                              {p.slug}
                              {p.collection ? ` · ${p.collection}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{p.price}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.isMainProduct && <Flag>Main</Flag>}
                          {p.isNewArrival && <Flag>New</Flag>}
                          {p.isRecommended && <Flag>Rec</Flag>}
                          {p.isRelated && <Flag>Rel</Flag>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--admin-muted)]">
                        {p.gender || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="admin-btn admin-btn-ghost px-2"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <a
                            href={`/product/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-btn admin-btn-ghost px-2"
                            title="Preview"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost px-2"
                            onClick={() =>
                              setMenuId(menuId === p.id ? null : p.id)
                            }
                            aria-label="More"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {menuId === p.id && (
                            <div className="admin-card absolute right-0 top-full z-20 mt-1 w-40 py-1 shadow-lg">
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--admin-bg)]"
                                onClick={() => runDuplicate(p.id)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Duplicate
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--admin-danger)] hover:bg-[var(--admin-bg)]"
                                onClick={() => {
                                  setMenuId(null);
                                  setConfirm({ type: "delete", id: p.id });
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={filters.page || 1}
        totalPages={totalPages}
        total={total}
        onChange={(page) => setFilters((f) => ({ ...f, page }))}
      />

      <ConfirmDialog
        open={confirm != null}
        title={
          confirm?.type === "bulk-delete"
            ? `Delete ${selected.size} products?`
            : "Delete this product?"
        }
        description="This cannot be undone. The product will be removed from the catalog."
        confirmLabel="Delete"
        danger
        loading={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === "delete") runDelete(confirm.id);
          if (confirm?.type === "bulk-delete") runBulkDelete();
        }}
      />
    </div>
  );
}

function Flag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-[var(--admin-accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-ink)]">
      {children}
    </span>
  );
}
