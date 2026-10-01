"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import Breadcrumbs from "@/admin/components/layout/Breadcrumbs";
import {
  adminGetCatalogFilters,
  adminGetShopByCategory,
  adminListCollections,
  adminRenameCollection,
  adminSaveCatalogFilters,
  adminSaveShopByCategory,
  type CollectionSummary,
  type ShopCategoryCard,
} from "@/admin/actions/collections";
import type { CatalogFilter } from "@/data/categoryFilters";
import { useToast } from "@/admin/hooks/useToast";
import { slugify } from "@/admin/lib/slug";
import MediaPicker from "@/admin/components/media/MediaPicker";

type Tab = "collections" | "homepage" | "filters";

export default function CollectionsPage() {
  const { success, error } = useToast();
  const [tab, setTab] = useState<Tab>("collections");
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [cards, setCards] = useState<ShopCategoryCard[]>([]);
  const [filters, setFilters] = useState<Record<string, CatalogFilter>>({});
  const [pending, startTransition] = useTransition();
  const [renameFrom, setRenameFrom] = useState("");
  const [renameTo, setRenameTo] = useState("");
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);

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
      else success("Catalog filters saved");
    });
  };

  const doRename = () => {
    startTransition(async () => {
      const res = await adminRenameCollection(renameFrom, renameTo);
      if (!res.ok) error(res.error);
      else {
        success(`Renamed on ${res.count} product(s)`);
        setRenameFrom("");
        setRenameTo("");
        await load();
      }
    });
  };

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
          Manage product collections, homepage cards, and catalog filters
          without schema changes
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
          <div className="admin-card p-5">
            <h2 className="mb-3 text-sm font-semibold">Rename collection</h2>
            <div className="flex flex-wrap gap-2">
              <select
                className="admin-input max-w-xs"
                value={renameFrom}
                onChange={(e) => setRenameFrom(e.target.value)}
              >
                <option value="">Select collection…</option>
                {collections.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.productCount})
                  </option>
                ))}
              </select>
              <input
                className="admin-input max-w-xs"
                placeholder="New name"
                value={renameTo}
                onChange={(e) => setRenameTo(e.target.value)}
              />
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={pending || !renameFrom || !renameTo}
                onClick={doRename}
              >
                Rename
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collections.length === 0 ? (
              <p className="text-sm text-[var(--admin-muted)]">
                No collections found on products yet. Set the Collection field
                on a product to populate this list.
              </p>
            ) : (
              collections.map((c) => (
                <div key={c.name} className="admin-card flex gap-3 p-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--admin-bg)]">
                    {c.sampleImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.sampleImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-[var(--admin-muted)]">
                      {c.productCount} product
                      {c.productCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
                      next[idx] = {
                        ...card,
                        label: e.target.value,
                        slug: slugify(e.target.value) || card.slug,
                      };
                      setCards(next);
                    }}
                  />
                </div>
                <div>
                  <label className="admin-label">Filter slug</label>
                  <input
                    className="admin-input font-mono text-sm"
                    value={card.slug}
                    onChange={(e) => {
                      const next = [...cards];
                      next[idx] = {
                        ...card,
                        slug: slugify(e.target.value) || card.slug,
                      };
                      setCards(next);
                    }}
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
                          [key]: { ...f, label: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="admin-label">Slug</label>
                    <input
                      className="admin-input font-mono text-sm"
                      value={f.slug}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [key]: {
                            ...f,
                            slug: slugify(e.target.value) || f.slug,
                          },
                        }))
                      }
                    />
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
