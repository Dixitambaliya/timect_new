"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Clock,
  History,
  Layers,
  Loader2,
  Package,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Breadcrumbs from "@/admin/components/layout/Breadcrumbs";
import {
  adminClearAllRecycleBin,
  adminListRecycleBin,
  adminPermanentlyDeleteRecycleBinItem,
  adminRestoreRecycleBinItem,
  type RecycleBinItem,
} from "@/admin/actions/recycle-bin";
import { useToast } from "@/admin/hooks/useToast";
import AdminModal from "@/admin/components/ui/AdminModal";

type FilterTab = "all" | "product" | "collection";

export default function RecycleBinPage() {
  const { success, error } = useToast();
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<FilterTab>("all");

  // Restore confirmation modal
  const [restoreTarget, setRestoreTarget] = useState<RecycleBinItem | null>(null);

  // Permanently delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<RecycleBinItem | null>(null);

  // Empty bin confirmation modal
  const [emptyBinOpen, setEmptyBinOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminListRecycleBin();
      setItems(data);
    } catch {
      error("Failed to load recycle bin items.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRestore = () => {
    if (!restoreTarget) return;
    startTransition(async () => {
      const res = await adminRestoreRecycleBinItem(restoreTarget.id);
      if (!res.ok) {
        error(res.error);
      } else {
        success(res.message);
        setRestoreTarget(null);
        await load();
      }
    });
  };

  const handlePermanentDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await adminPermanentlyDeleteRecycleBinItem(deleteTarget.id);
      if (!res.ok) {
        error(res.error);
      } else {
        success("Item permanently deleted.");
        setDeleteTarget(null);
        await load();
      }
    });
  };

  const handleEmptyBin = () => {
    startTransition(async () => {
      const res = await adminClearAllRecycleBin();
      if (!res.ok) {
        error(res.error);
      } else {
        success(`Recycle bin cleared (${res.count} item(s) purged).`);
        setEmptyBinOpen(false);
        await load();
      }
    });
  };

  const filteredItems = items.filter((item) => {
    if (tab === "all") return true;
    return item.entityType === tab;
  });

  const formatExpiry = (hours: number) => {
    if (hours <= 0) return "Expiring soon";
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    if (days > 0) {
      return `${days}d ${remHours}h left`;
    }
    return `${hours} hours left`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumbs
            items={[
              { label: "Admin", href: "/admin/dashboard" },
              { label: "Recycle Bin" },
            ]}
          />
          <h1 className="text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">
            Recycle Bin & Rollback
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Deleted products and collections are kept here for 3 days before being permanently purged. You can restore or rollback changes anytime.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            className="admin-btn admin-btn-danger self-start sm:self-auto"
            onClick={() => setEmptyBinOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Empty Recycle Bin
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`admin-btn ${tab === "all" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          onClick={() => setTab("all")}
        >
          All Items ({items.length})
        </button>
        <button
          type="button"
          className={`admin-btn ${tab === "product" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          onClick={() => setTab("product")}
        >
          <Package className="h-3.5 w-3.5" />
          Products ({items.filter((i) => i.entityType === "product").length})
        </button>
        <button
          type="button"
          className={`admin-btn ${tab === "collection" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          onClick={() => setTab("collection")}
        >
          <Layers className="h-3.5 w-3.5" />
          Collections ({items.filter((i) => i.entityType === "collection").length})
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-muted)]" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-fuse-md border border-[var(--admin-border)] bg-[var(--admin-surface)] p-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
          <h3 className="text-base font-semibold text-[var(--admin-heading)]">
            Recycle Bin is empty
          </h3>
          <p className="mt-1 text-xs text-[var(--admin-muted)] max-w-sm mx-auto">
            Any products or collections deleted or updated in the last 3 days will appear here so you can undo changes or restore them.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isDelete = item.actionType === "delete";
            const isProduct = item.entityType === "product";

            return (
              <div
                key={item.id}
                className="admin-card flex flex-col gap-4 p-4 transition-all sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                      isDelete
                        ? "border-red-200 bg-red-50 text-red-600 dark:border-red-950 dark:bg-red-950/40"
                        : "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-950 dark:bg-amber-950/40"
                    }`}
                  >
                    {isDelete ? (
                      <Trash2 className="h-5 w-5" />
                    ) : (
                      <RotateCcw className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate font-semibold text-[var(--admin-heading)]">
                        {item.entityName}
                      </h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isDelete
                            ? "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                        }`}
                      >
                        {item.actionType === "delete"
                          ? `${item.entityType} deleted`
                          : item.actionType === "rename"
                            ? "collection renamed"
                            : `${item.entityType} modified`}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-[var(--admin-muted)]">
                      {item.details || "No details provided"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--admin-muted)]">
                      <span>Changed on {formatDate(item.createdAt)}</span>
                      <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        {formatExpiry(item.hoursRemaining)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary text-xs !py-1.5 !px-3"
                    onClick={() => setRestoreTarget(item)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {isDelete ? "Restore" : "Rollback"}
                  </button>

                  <button
                    type="button"
                    title="Delete permanently"
                    className="admin-btn admin-btn-ghost text-xs !p-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Restore Confirmation Modal */}
      <AdminModal
        open={restoreTarget !== null}
        title={restoreTarget?.actionType === "delete" ? "Restore Item" : "Rollback Changes"}
        onClose={() => setRestoreTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setRestoreTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={pending}
              onClick={handleRestore}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : restoreTarget?.actionType === "delete" ? (
                "Restore to Storefront"
              ) : (
                "Rollback Changes"
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          <p className="text-sm text-[var(--admin-muted)]">
            Are you sure you want to {restoreTarget?.actionType === "delete" ? "restore" : "revert changes for"}{" "}
            <strong className="text-[var(--admin-heading)]">"{restoreTarget?.entityName}"</strong>?
          </p>
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3 text-xs text-[var(--admin-muted)]">
            <p>
              <strong>Action:</strong> {restoreTarget?.details}
            </p>
            <p className="mt-1">
              <strong>Expires in:</strong> {restoreTarget ? formatExpiry(restoreTarget.hoursRemaining) : ""}
            </p>
          </div>
        </div>
      </AdminModal>

      {/* Permanent Delete Modal */}
      <AdminModal
        open={deleteTarget !== null}
        title="Delete Permanently"
        onClose={() => setDeleteTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn bg-red-600 text-white hover:bg-red-700"
              disabled={pending}
              onClick={handlePermanentDelete}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Permanently"}
            </button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          <p className="text-sm text-[var(--admin-muted)]">
            Are you sure you want to permanently delete{" "}
            <strong className="text-[var(--admin-heading)]">"{deleteTarget?.entityName}"</strong> from the recycle bin?
          </p>
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-950 dark:bg-red-950/40">
            This action cannot be undone. Once deleted from the recycle bin, the item can no longer be restored.
          </p>
        </div>
      </AdminModal>

      {/* Empty Bin Modal */}
      <AdminModal
        open={emptyBinOpen}
        title="Empty Entire Recycle Bin"
        onClose={() => setEmptyBinOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setEmptyBinOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn bg-red-600 text-white hover:bg-red-700"
              disabled={pending}
              onClick={handleEmptyBin}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Purge All Items"}
            </button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          <p className="text-sm text-[var(--admin-muted)]">
            Are you sure you want to permanently delete all {items.length} item(s) from the recycle bin?
          </p>
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-950 dark:bg-red-950/40">
            All stored restore snapshots will be purged immediately and cannot be recovered.
          </p>
        </div>
      </AdminModal>
    </div>
  );
}
