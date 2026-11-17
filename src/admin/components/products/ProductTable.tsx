"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Copy,
  ExternalLink,
  FileText,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Unlink,
  X,
} from "lucide-react";
import type { Product } from "@/db/actions";
import {
  adminBulkDeleteProducts,
  adminBulkUpdateFlags,
  adminBulkUpdateStatus,
  adminDeleteProduct,
  adminDuplicateProduct,
  adminLinkProductsAsVariants,
  adminListProducts,
  adminUnlinkProductsAsVariants,
  type ProductListFilters,
} from "@/admin/actions/products";
import { useAdminSearch } from "@/admin/context/AdminSearchContext";
import { useToast } from "@/admin/hooks/useToast";
import ConfirmDialog from "@/admin/components/ui/ConfirmDialog";
import EmptyState from "@/admin/components/ui/EmptyState";
import Pagination from "@/admin/components/ui/Pagination";
import { TableSkeleton } from "@/admin/components/ui/Skeleton";
import { GENDER_OPTIONS } from "@/admin/lib/constants";
import ProductImportExport from "./ProductImportExport";
import styles from "./ProductTable.module.css";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectOption } from "@/components/ui/select";

export default function ProductTable({
  initialSearch = "",
  initialFlag = "all",
  initialPage = 1,
  initialGender,
  initialStatus = "all",
  initialSort = "newest",
}: {
  initialSearch?: string;
  initialFlag?: ProductListFilters["flag"];
  initialPage?: number;
  initialGender?: string;
  initialStatus?: ProductListFilters["status"];
  initialSort?: ProductListFilters["sortBy"];
}) {
  const { success, error } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const { search, setSearch, clearSearch } = useAdminSearch();
  const [filters, setFilters] = useState<ProductListFilters>({
    search: initialSearch || search,
    flag: initialFlag || "all",
    gender: initialGender,
    status: initialStatus,
    sortBy: initialSort,
    page: initialPage,
    pageSize: 20,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Map<number, Product>>(new Map());
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<
    | null
    | { type: "delete"; id: number }
    | { type: "bulk-delete" }
    | { type: "unlink-variants" }
  >(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const firstFlagSync = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminListProducts(filters);
      setProducts(res.products);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      // Keep selected products intact across pages and searches, but update data if present in latest fetch
      setSelected((prev) => {
        if (prev.size === 0) return prev;
        let changed = false;
        const next = new Map(prev);
        for (const p of res.products) {
          if (next.has(p.id)) {
            next.set(p.id, p);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  // Synchronize global/navbar search with product list filters (debounced to avoid query spamming)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => {
        if (f.search === search) return f;
        return { ...f, search, page: 1 };
      });
    }, search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (firstFlagSync.current) {
      firstFlagSync.current = false;
      return;
    }
    if (initialFlag) {
      setFilters((f) => ({ ...f, flag: initialFlag, page: 1 }));
    }
  }, [initialFlag]);

  const allCurrentPageSelected =
    products.length > 0 && products.every((p) => selected.has(p.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (allCurrentPageSelected) {
        for (const p of products) {
          next.delete(p.id);
        }
      } else {
        for (const p of products) {
          next.set(p.id, p);
        }
      }
      return next;
    });
  };

  const toggle = (product: Product) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.set(product.id, product);
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
          const n = new Map(s);
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
      const res = await adminBulkDeleteProducts(Array.from(selected.keys()));
      if (!res.ok) error(res.error);
      else {
        success(`Deleted ${res.count} product(s)`);
        setSelected(new Map());
        await load();
      }
      setConfirm(null);
    });
  };

  const runBulkFlag = (flags: Parameters<typeof adminBulkUpdateFlags>[1]) => {
    startTransition(async () => {
      const res = await adminBulkUpdateFlags(Array.from(selected.keys()), flags);
      if (!res.ok) error(res.error);
      else {
        success(`Updated ${res.count} product(s)`);
        await load();
      }
    });
  };

  const runBulkStatus = (status: "published" | "draft") => {
    startTransition(async () => {
      const res = await adminBulkUpdateStatus(Array.from(selected.keys()), status);
      if (!res.ok) error(res.error);
      else {
        success(
          status === "draft"
            ? `Drafted ${res.count} product(s)`
            : `Undrafted ${res.count} product(s)`,
        );
        await load();
      }
    });
  };

  const runSingleStatus = (id: number, status: "published" | "draft") => {
    startTransition(async () => {
      const res = await adminBulkUpdateStatus([id], status);
      if (!res.ok) error(res.error);
      else {
        success(status === "draft" ? "Product drafted" : "Product undrafted");
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

  const runMergeVariants = () => {
    if (selected.size < 2) {
      error("Select at least two products to merge as variants");
      return;
    }
    startTransition(async () => {
      const res = await adminLinkProductsAsVariants(Array.from(selected.keys()));
      if (!res.ok) error(res.error);
      else {
        success(`Merged ${res.count} products into one variant family`);
        setSelected(new Map());
        await load();
      }
    });
  };

  const runUnlinkVariants = () => {
    startTransition(async () => {
      const res = await adminUnlinkProductsAsVariants(Array.from(selected.keys()));
      if (!res.ok) error(res.error);
      else {
        success(`Unlinked ${res.count} product(s) from their variant families`);
        setSelected(new Map());
        await load();
      }
      setConfirm(null);
    });
  };

  const selectedProducts = Array.from(selected.values());
  const hasSelected = selectedProducts.length > 0;
  const allDraft = hasSelected && selectedProducts.every((p) => p.status === "draft");
  const allNew = hasSelected && selectedProducts.every((p) => p.isNewArrival);
  const allRec = hasSelected && selectedProducts.every((p) => p.isRecommended);
  const allRel = hasSelected && selectedProducts.every((p) => p.isRelated);

  const productListUrl = (() => {
    const params = new URLSearchParams();
    if ((filters.page || 1) > 1) params.set("page", String(filters.page));
    if (filters.flag && filters.flag !== "all") params.set("flag", filters.flag);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.sortBy && filters.sortBy !== "newest") params.set("sort", filters.sortBy);
    if (filters.search?.trim()) params.set("search", filters.search.trim());
    const query = params.toString();
    return query ? `/admin/products?${query}` : "/admin/products";
  })();

  // Keep the list state in the URL so edit/save, refresh, and browser Back
  // all return to the same page instead of reconstructing page 1.
  useEffect(() => {
    const currentUrl = `${pathname}${window.location.search}`;
    if (currentUrl !== productListUrl) {
      router.replace(productListUrl, { scroll: false });
    }
  }, [pathname, productListUrl, router]);

  return (
    <div className={`${styles.root} space-y-4`}>
      <div className={`${styles.toolbar} flex flex-wrap items-center justify-between gap-3`}>
        <div className={`${styles.filters} flex flex-wrap items-center gap-2`}>
          <div className={`${styles.search} relative min-w-[200px] flex-1 sm:w-64`}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 pr-8"
            />
            {search ? (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 z-[1] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-fuse-sm text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-ink)]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          <Select
            closeOnTriggerClick
            className="admin-input w-auto"
            value={filters.status || "all"}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: e.target.value as ProductListFilters["status"],
                page: 1,
              }))
            }
          >
            <SelectOption value="all">All visibility</SelectOption>
            <SelectOption value="published">Published</SelectOption>
            <SelectOption value="draft">Drafts</SelectOption>
          </Select>
          <Select
            closeOnTriggerClick
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
            <SelectOption value="all">All flags</SelectOption>
            <SelectOption value="main">Main</SelectOption>
            <SelectOption value="new">New arrivals</SelectOption>
            <SelectOption value="recommended">Recommended</SelectOption>
            <SelectOption value="related">Related</SelectOption>
          </Select>
          <Select
            closeOnTriggerClick
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
            <SelectOption value="">All genders</SelectOption>
            {GENDER_OPTIONS.map((g) => (
              <SelectOption key={g} value={g}>
                {g}
              </SelectOption>
            ))}
          </Select>
          <Select
            closeOnTriggerClick
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
            <SelectOption value="newest">Newest</SelectOption>
            <SelectOption value="oldest">Oldest</SelectOption>
            <SelectOption value="name">Name</SelectOption>
            <SelectOption value="price-asc">Price ↑</SelectOption>
            <SelectOption value="price-desc">Price ↓</SelectOption>
          </Select>
        </div>
        <div className={`${styles.actions} flex flex-wrap gap-2`}>
          <ProductImportExport onImported={() => void load()} />
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="admin-card flex flex-wrap items-center gap-2 px-4 py-3">
          <span
            className="text-sm font-medium"
            title={selectedProducts.map((p) => p.name || p.title || p.slug).join(", ")}
          >
            {selected.size} selected
          </span>
          <button
            type="button"
            className="admin-btn admin-btn-ghost text-xs text-[var(--admin-muted)]"
            onClick={() => setSelected(new Map())}
            title="Clear all selected products"
          >
            Clear
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary text-xs"
            disabled={pending || selected.size < 2}
            onClick={runMergeVariants}
            title={selected.size < 2 ? "Select at least two products" : "Merge selected products into one variant family"}
          >
            <Link2 className="h-3.5 w-3.5" />
            Merge variants
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary text-xs"
            disabled={pending}
            onClick={() => setConfirm({ type: "unlink-variants" })}
          >
            <Unlink className="h-3.5 w-3.5" />
            Unlink variants
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary text-xs"
            disabled={pending}
            onClick={() => runBulkStatus(allDraft ? "published" : "draft")}
          >
            {allDraft ? "Undraft" : "Draft"}
          </button>
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

      <div className={`${styles.listCard} admin-card`}>
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
                    clearSearch();
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
          <div>
            <div className={styles.mobileSelection}>
              <label className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
                <Checkbox checked={allCurrentPageSelected} onChange={toggleAll} />
                Select all on this page
              </label>
              <span className="text-xs text-[var(--admin-muted)]">{total} products</span>
            </div>
            <table role="table" className={`${styles.table} w-full text-left text-sm`}>
              <thead className="border-b border-[var(--admin-line)] bg-[var(--admin-bg)] text-xs uppercase tracking-wider text-[var(--admin-muted)]">
                <tr>
                  <th className="px-4 py-3">
                    <Checkbox
                      checked={allCurrentPageSelected}
                      onChange={toggleAll}
                      aria-label="Select all on this page"
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
                        <Checkbox
                          checked={selected.has(p.id)}
                          onChange={() => toggle(p)}
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
                            {p.variants?.some((variant) => variant.slug) && (
                              <div className="my-1.5 flex max-w-[460px] flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                                  Variants
                                </span>
                                {p.variants
                                  .filter((variant) => variant.slug)
                                  .slice(0, 4)
                                  .map((variant) => (
                                    <span
                                      key={variant.slug}
                                      className="inline-flex max-w-[150px] items-center gap-1.5 rounded-full border border-[var(--admin-line)] bg-[var(--admin-bg)] px-2 py-1 text-[10px]"
                                      title={`${variant.name} · ${variant.slug}`}
                                    >
                                      {variant.image && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={variant.image} alt="" className="h-4 w-4 rounded-full object-cover" />
                                      )}
                                      {variant.colorHex && (
                                        <span
                                          className="h-3 w-3 rounded-full border border-black/20"
                                          style={{ backgroundColor: variant.colorHex }}
                                          aria-hidden="true"
                                        />
                                      )}
                                      <span className="truncate">{variant.name}</span>
                                    </span>
                                  ))}
                                {p.variants.filter((variant) => variant.slug).length > 4 && (
                                  <span className="text-[10px] text-[var(--admin-muted)]">
                                    +{p.variants.filter((variant) => variant.slug).length - 4} more
                                  </span>
                                )}
                              </div>
                            )}
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
                          {p.status === "draft" && <Flag>Draft</Flag>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--admin-muted)]">
                        {p.gender || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${p.id}/edit?returnTo=${encodeURIComponent(productListUrl)}`}
                            className="admin-btn admin-btn-ghost px-2"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          {p.status === "published" && (
                            <a
                              href={`/product/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-btn admin-btn-ghost px-2"
                              title="Preview"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
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
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--admin-bg)]"
                                onClick={() => {
                                  setMenuId(null);
                                  runSingleStatus(
                                    p.id,
                                    p.status === "draft" ? "published" : "draft",
                                  );
                                }}
                              >
                                <FileText className="h-3.5 w-3.5" />
                                {p.status === "draft" ? "Undraft" : "Draft"}
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
            : confirm?.type === "unlink-variants"
              ? `Unlink ${selected.size} product(s)?`
            : "Delete this product?"
        }
        description={
          confirm?.type === "unlink-variants"
            ? "The selected watches will become independent products. Their product data and catalog entries will not be deleted."
            : "This cannot be undone. The product will be removed from the catalog."
        }
        confirmLabel={confirm?.type === "unlink-variants" ? "Unlink" : "Delete"}
        danger={confirm?.type !== "unlink-variants"}
        loading={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === "delete") runDelete(confirm.id);
          if (confirm?.type === "bulk-delete") runBulkDelete();
          if (confirm?.type === "unlink-variants") runUnlinkVariants();
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
