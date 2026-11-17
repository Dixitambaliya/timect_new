"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Check,
  Edit2,
  Layers,
  Loader2,
  PackagePlus,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Breadcrumbs from "@/admin/components/layout/Breadcrumbs";
import {
  adminAddProductsToCollection,
  adminCreateCollection,
  adminDeleteCollection,
  adminGetCatalogFilters,
  adminGetCollectionProducts,
  adminGetShopByCategory,
  adminListCollections,
  adminRemoveProductFromCollection,
  adminRenameCollection,
  adminSaveCatalogFilters,
  adminSaveShopByCategory,
  adminSearchProductsForCollection,
  type CollectionProductItem,
  type CollectionSummary,
  type ShopCategoryCard,
} from "@/admin/actions/collections";
import type { CatalogFilter } from "@/data/categoryFilters";
import { useToast } from "@/admin/hooks/useToast";
import { slugify } from "@/admin/lib/slug";
import MediaPicker from "@/admin/components/media/MediaPicker";
import AdminSelect from "@/admin/components/ui/AdminSelect";
import AdminModal from "@/admin/components/ui/AdminModal";
import { displayPrice } from "@/lib/price";

type Tab = "collections" | "homepage" | "filters";

export default function CollectionsPage() {
  const { success, error } = useToast();
  const [tab, setTab] = useState<Tab>("collections");
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [cards, setCards] = useState<ShopCategoryCard[]>([]);
  const [filters, setFilters] = useState<Record<string, CatalogFilter>>({});
  const [pending, startTransition] = useTransition();

  // Search & Filter
  const [search, setSearch] = useState("");

  // Create Collection Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  // Rename Collection Modal
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameFrom, setRenameFrom] = useState("");
  const [renameTo, setRenameTo] = useState("");

  // Delete Collection Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CollectionSummary | null>(null);

  // Manage Items in Collection Modal
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [activeProducts, setActiveProducts] = useState<CollectionProductItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Add Items Modal
  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [candidates, setCandidates] = useState<CollectionProductItem[]>([]);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Homepage card media picker
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const [newFilterKeys, setNewFilterKeys] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, shop, f] = await Promise.all([
        adminListCollections(),
        adminGetShopByCategory(),
        adminGetCatalogFilters(),
      ]);
      setCollections(c);
      setCards(shop);
      setFilters(f);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveCards = () => {
    startTransition(async () => {
      const res = await adminSaveShopByCategory(cards);
      if (!res.ok) error(res.error);
      else success("Homepage category cards saved");
    });
  };

  const saveFilters = () => {
    startTransition(async () => {
      const res = await adminSaveCatalogFilters(filters);
      if (!res.ok) error(res.error);
      else {
        success("Catalog filters saved");
        setNewFilterKeys(new Set());
        await load();
      }
    });
  };

  const handleCreate = () => {
    const trimmed = newCollectionName.trim();
    if (!trimmed) {
      error("Please enter a collection name.");
      return;
    }
    startTransition(async () => {
      const res = await adminCreateCollection(trimmed);
      if (!res.ok) {
        error(res.error);
      } else {
        success(`Collection "${res.name}" created`);
        setNewCollectionName("");
        setCreateModalOpen(false);
        await load();
        // Immediately open to add items
        openManageItems(res.name);
      }
    });
  };

  const handleRename = () => {
    if (!renameFrom || !renameTo.trim()) {
      error("Both names are required.");
      return;
    }
    startTransition(async () => {
      const res = await adminRenameCollection(renameFrom, renameTo);
      if (!res.ok) {
        error(res.error);
      } else {
        success(`Renamed to "${renameTo}" on ${res.count} product(s)`);
        if (activeCollection === renameFrom) {
          setActiveCollection(renameTo.trim());
        }
        setRenameModalOpen(false);
        setRenameFrom("");
        setRenameTo("");
        await load();
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await adminDeleteCollection(deleteTarget.name);
      if (!res.ok) {
        error(res.error);
      } else {
        success(`Collection "${deleteTarget.name}" deleted (${res.unassignedCount} watch(es) unassigned)`);
        setDeleteModalOpen(false);
        setDeleteTarget(null);
        if (activeCollection === deleteTarget.name) {
          setActiveCollection(null);
        }
        await load();
      }
    });
  };

  const openManageItems = async (collectionName: string) => {
    setActiveCollection(collectionName);
    setLoadingItems(true);
    try {
      const items = await adminGetCollectionProducts(collectionName);
      setActiveProducts(items);
    } catch {
      error("Failed to load products for collection.");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    const res = await adminRemoveProductFromCollection(productId);
    if (!res.ok) {
      error(res.error);
    } else {
      success("Watch removed from collection");
      setActiveProducts((prev) => prev.filter((p) => p.id !== productId));
      await load();
    }
  };

  const openAddItemsModal = async () => {
    if (!activeCollection) return;
    setAddItemsOpen(true);
    setSelectedIds([]);
    setCandidateSearch("");
    setLoadingCandidates(true);
    try {
      const products = await adminSearchProductsForCollection("", activeCollection);
      setCandidates(products);
    } catch {
      error("Failed to load available watches.");
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleAddSelected = async () => {
    if (!activeCollection || !selectedIds.length) return;
    startTransition(async () => {
      const res = await adminAddProductsToCollection(activeCollection, selectedIds);
      if (!res.ok) {
        error(res.error);
      } else {
        success(`${res.count} watch(es) added to "${activeCollection}"`);
        setAddItemsOpen(false);
        setSelectedIds([]);
        // Reload items
        await openManageItems(activeCollection);
        await load();
      }
    });
  };

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim()),
  );

  const filteredCandidates = candidates.filter((p) =>
    p.name.toLowerCase().includes(candidateSearch.toLowerCase().trim()),
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Collections" },
          ]}
        />
        <h1 className="text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">
          Collections & categories
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Manage product collections, add/remove watches, and configure categories.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["collections", "Product collections"],
            ["homepage", "Homepage cards"],
            ["filters", "Catalog filters"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`admin-btn ${tab === id ? "admin-btn-primary" : "admin-btn-secondary"}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "collections" && (
        <div className="space-y-4">
          {/* Action Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
              <input
                className="admin-input pl-9"
                placeholder="Search collections…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="admin-btn admin-btn-primary self-start sm:self-auto"
              onClick={() => {
                setNewCollectionName("");
                setCreateModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New collection
            </button>
          </div>

          {/* Collections Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCollections.length === 0 ? (
              <div className="col-span-full rounded-fuse-md border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 text-center">
                <Layers className="mx-auto mb-2 h-8 w-8 text-[var(--admin-muted)]" />
                <p className="font-semibold">No collections found</p>
                <p className="mt-1 text-xs text-[var(--admin-muted)]">
                  {search ? "No collections match your search." : "Create your first collection to group your watches."}
                </p>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary mt-4"
                  onClick={() => {
                    setNewCollectionName("");
                    setCreateModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create collection
                </button>
              </div>
            ) : (
              filteredCollections.map((c) => (
                <div
                  key={c.name}
                  className="admin-card group flex flex-col justify-between p-4 transition-all hover:border-[var(--admin-accent)]"
                >
                  <div className="flex gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)]">
                      {c.sampleImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.sampleImage}
                          alt=""
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <Layers className="h-6 w-6 text-[var(--admin-muted)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-[var(--admin-heading)]" title={c.name}>
                        {c.name}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--admin-muted)]">
                        {c.productCount} {c.productCount === 1 ? "watch" : "watches"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--admin-border)] pt-3">
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary text-xs !py-1 !px-2.5"
                      onClick={() => openManageItems(c.name)}
                    >
                      <PackagePlus className="h-3.5 w-3.5" />
                      Manage watches
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Rename"
                        className="admin-btn admin-btn-ghost text-xs !p-1.5 hover:text-[var(--admin-accent)]"
                        onClick={() => {
                          setRenameFrom(c.name);
                          setRenameTo(c.name);
                          setRenameModalOpen(true);
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete collection"
                        className="admin-btn admin-btn-ghost text-xs !p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          setDeleteTarget(c);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Collection Modal */}
      <AdminModal
        open={createModalOpen}
        title="Create New Collection"
        onClose={() => setCreateModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={pending || !newCollectionName.trim()}
              onClick={handleCreate}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create collection"}
            </button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          <label className="admin-label" htmlFor="newColName">
            Collection Name *
          </label>
          <input
            id="newColName"
            className="admin-input"
            placeholder="e.g. HydroConquest, Classic Dress, Sport"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <p className="text-xs text-[var(--admin-muted)]">
            After creating, you will be able to select and add watches directly into this collection.
          </p>
        </div>
      </AdminModal>

      {/* Rename Collection Modal */}
      <AdminModal
        open={renameModalOpen}
        title="Rename Collection"
        onClose={() => setRenameModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setRenameModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={pending || !renameTo.trim() || renameTo.trim() === renameFrom}
              onClick={handleRename}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          <div>
            <label className="admin-label">Current Name</label>
            <input className="admin-input bg-[var(--admin-bg)]" value={renameFrom} disabled />
          </div>
          <div>
            <label className="admin-label" htmlFor="renameInput">
              New Name *
            </label>
            <input
              id="renameInput"
              className="admin-input"
              value={renameTo}
              onChange={(e) => setRenameTo(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRename();
                }
              }}
            />
          </div>
          <p className="text-xs text-[var(--admin-muted)]">
            This will update the collection name across all assigned watches.
          </p>
        </div>
      </AdminModal>

      {/* Delete Collection Modal */}
      <AdminModal
        open={deleteModalOpen}
        title="Delete Collection"
        onClose={() => setDeleteModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn bg-red-600 text-white hover:bg-red-700"
              disabled={pending}
              onClick={handleDelete}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete collection"}
            </button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          <p className="text-sm text-[var(--admin-muted)]">
            Are you sure you want to delete the collection{" "}
            <span className="font-semibold text-[var(--admin-heading)]">
              "{deleteTarget?.name}"
            </span>
            ?
          </p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <strong>Note:</strong> Watches currently belonging to this collection will have their collection
            unassigned. The watches themselves will <strong>not</strong> be deleted.
          </p>
        </div>
      </AdminModal>

      {/* Manage Watches in Collection Modal */}
      <AdminModal
        open={activeCollection !== null}
        title={`Collection: ${activeCollection || ""}`}
        onClose={() => setActiveCollection(null)}
        width="max-w-2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-[var(--admin-muted)]">
              {activeProducts.length} {activeProducts.length === 1 ? "watch" : "watches"} in collection
            </span>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setActiveCollection(null)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--admin-muted)]">
              Watches currently assigned to this collection:
            </p>
            <button
              type="button"
              className="admin-btn admin-btn-primary text-xs !py-1.5 !px-3"
              onClick={openAddItemsModal}
            >
              <Plus className="h-3.5 w-3.5" />
              Add watches
            </button>
          </div>

          {loadingItems ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-muted)]" />
            </div>
          ) : activeProducts.length === 0 ? (
            <div className="rounded-fuse-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-bg)] p-8 text-center">
              <Layers className="mx-auto mb-2 h-8 w-8 text-[var(--admin-muted)]" />
              <p className="font-semibold text-sm">No watches in this collection yet</p>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">
                Click "+ Add watches" above to assign products to this collection.
              </p>
            </div>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto divide-y divide-[var(--admin-border)] rounded-fuse-md border border-[var(--admin-border)] bg-[var(--admin-bg)]">
              {activeProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[var(--admin-border)] bg-white p-1">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--admin-muted)]">
                          None
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--admin-heading)]" title={p.name}>
                        {p.name}
                      </p>
                      <p className="text-xs text-[var(--admin-muted)]">
                        {p.price ? displayPrice(p.price) : "No price set"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Remove from collection"
                    className="admin-btn text-xs text-red-500 hover:bg-red-50 hover:text-red-600 !py-1 !px-2 shrink-0"
                    onClick={() => handleRemoveItem(p.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminModal>

      {/* Add Watches to Collection Modal */}
      <AdminModal
        open={addItemsOpen}
        title={`Add Watches to "${activeCollection}"`}
        onClose={() => setAddItemsOpen(false)}
        width="max-w-xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-[var(--admin-muted)]">
              {selectedIds.length} watch(es) selected
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setAddItemsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={pending || !selectedIds.length}
                onClick={handleAddSelected}
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Add Selected (${selectedIds.length})`
                )}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
            <input
              className="admin-input pl-9"
              placeholder="Filter watches by name…"
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              autoFocus
            />
          </div>

          {loadingCandidates ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-muted)]" />
            </div>
          ) : filteredCandidates.length === 0 ? (
            <p className="py-6 text-center text-xs text-[var(--admin-muted)]">
              No matching watches found.
            </p>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto divide-y divide-[var(--admin-border)] rounded-fuse-md border border-[var(--admin-border)] bg-[var(--admin-bg)]">
              {filteredCandidates.map((p) => {
                const isChecked = selectedIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center justify-between p-3 gap-3 transition-colors hover:bg-[var(--admin-surface)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, p.id]);
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== p.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                      />
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-[var(--admin-border)] bg-white p-0.5">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-[var(--admin-muted)]">
                            None
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--admin-heading)]" title={p.name}>
                          {p.name}
                        </p>
                        <p className="text-xs text-[var(--admin-muted)]">
                          {p.price ? displayPrice(p.price) : "No price"}
                          {p.collection && p.collection !== activeCollection && (
                            <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                              Currently in: {p.collection}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </AdminModal>

      {tab === "homepage" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() =>
                setCards((prev) => [
                  ...prev,
                  {
                    slug: "new-category",
                    label: "New category",
                    image: "",
                    bg: "linear-gradient(160deg,#161616,#000)",
                  },
                ])
              }
            >
              <Plus className="h-4 w-4" />
              Add card
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={pending}
              onClick={saveCards}
            >
              <Save className="h-4 w-4" />
              Save cards
            </button>
          </div>

          <div className="space-y-3">
            {cards.map((card, idx) => (
              <div
                key={idx}
                className="admin-card grid gap-3 p-4 md:grid-cols-[80px_1fr_1fr_auto]"
              >
                <button
                  type="button"
                  className="h-20 w-20 overflow-hidden rounded-lg border border-[var(--admin-line)] bg-[var(--admin-bg)]"
                  onClick={() => setPickerIdx(idx)}
                >
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-[var(--admin-muted)]">
                      Image
                    </span>
                  )}
                </button>
                <div>
                  <label className="admin-label">Label</label>
                  <input
                    className="admin-input"
                    value={card.label}
                    onChange={(e) => {
                      const next = [...cards];
                      next[idx] = { ...card, label: e.target.value };
                      setCards(next);
                    }}
                  />
                </div>
                <div>
                  <label className="admin-label">Links to filter</label>
                  <AdminSelect
                    value={card.slug}
                    onChange={(value) => {
                      const next = [...cards];
                      next[idx] = { ...card, slug: value };
                      setCards(next);
                    }}
                    placeholder="Select catalog filter…"
                    searchPlaceholder="Search filters…"
                    options={[
                      ...(!filters[card.slug]
                        ? [{ value: card.slug, label: card.label || card.slug, description: "Current link" }]
                        : []),
                      ...Object.values(filters).map((filter) => ({
                        value: filter.slug,
                        label: filter.label,
                        description: `/watches?filter=${filter.slug}`,
                      })),
                    ]}
                  />
                </div>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger self-end px-2"
                  onClick={() =>
                    setCards((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <MediaPicker
            open={pickerIdx != null}
            onClose={() => setPickerIdx(null)}
            onSelect={(url) => {
              if (pickerIdx != null) {
                const next = [...cards];
                next[pickerIdx] = { ...next[pickerIdx], image: url };
                setCards(next);
              }
              setPickerIdx(null);
            }}
          />
        </div>
      )}

      {tab === "filters" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                const slug = `filter-${Date.now()}`;
                setNewFilterKeys((prev) => new Set(prev).add(slug));
                setFilters((prev) => ({
                  ...prev,
                  [slug]: {
                    slug,
                    label: "New filter",
                    description: "",
                    keywordsAny: [],
                  },
                }));
              }}
            >
              <Plus className="h-4 w-4" />
              Add filter
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={pending}
              onClick={saveFilters}
            >
              <Save className="h-4 w-4" />
              Save filters
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(filters).map(([key, f]) => (
              <div key={key} className="admin-card space-y-3 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="admin-label">Label</label>
                    <input
                      className="admin-input"
                      value={f.label}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [key]: {
                            ...f,
                            label: e.target.value,
                            slug: newFilterKeys.has(key)
                              ? slugify(e.target.value) || f.slug
                              : f.slug,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="admin-label">URL</label>
                    <p className="admin-input truncate bg-[var(--admin-bg)] font-mono text-sm text-[var(--admin-muted)]">
                      /watches?filter={f.slug}
                    </p>
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => {
                        setFilters((prev) => {
                          const next = { ...prev };
                          delete next[key];
                          return next;
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
                <div>
                  <label className="admin-label">
                    Keywords (comma-separated, any match)
                  </label>
                  <input
                    className="admin-input"
                    value={(f.keywordsAny || []).join(", ")}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [key]: {
                          ...f,
                          keywordsAny: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      }))
                    }
                    placeholder="Chronograph, Sports, Diving"
                  />
                </div>
                <div>
                  <label className="admin-label">Description</label>
                  <input
                    className="admin-input"
                    value={f.description || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [key]: { ...f, description: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--admin-muted)]">
            Filters are stored in <code>cms_settings</code> as JSONB. The
            storefront continues to use static recipes as fallback until you
            wire published CMS filters into the catalog loader.
          </p>
        </div>
      )}
    </div>
  );
}
