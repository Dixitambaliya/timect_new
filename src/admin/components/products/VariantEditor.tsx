"use client";

import { useState, useEffect, useRef } from "react";
import { GripVertical, Plus, Trash2, ImagePlus, ChevronDown, Search, X } from "lucide-react";
import type { Variant } from "@/db/actions";
import MediaPicker from "@/admin/components/media/MediaPicker";
import { adminGetAllProductsQuick } from "@/admin/actions/products";

interface ProductOption {
  slug: string;
  name: string;
  image: string;
}

export default function VariantEditor({
  variants,
  onChange,
  currentSlug,
}: {
  variants: Variant[];
  onChange: (v: Variant[]) => void;
  currentSlug?: string;
}) {
  const [pickerFor, setPickerFor] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await adminGetAllProductsQuick();
        setProducts(list);
      } catch (err) {
        console.error("Failed to load products list for variants", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const update = (idx: number, patch: Partial<Variant>) => {
    const next = variants.map((v, i) => (i === idx ? { ...v, ...patch } : v));
    onChange(next);
  };

  const add = () => {
    onChange([
      ...variants,
      {
        id: `v${Date.now()}`,
        name: "",
        image: "",
      },
    ]);
  };

  const remove = (idx: number) => {
    onChange(variants.filter((_, i) => i !== idx));
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...variants];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--admin-muted)]">
          Link existing products as color / finish variants. On save, this
          product is added to each linked product, and they are linked to each
          other.
        </p>
        <button type="button" className="admin-btn admin-btn-primary" onClick={add}>
          <Plus className="h-4 w-4" />
          Add variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-fuse-md border border-dashed border-[var(--admin-line)] py-12 text-center text-sm text-[var(--admin-muted)]">
          No variants yet. Add Blue, Green, Gold, etc.
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div
              key={v.id}
              draggable
              onDragStart={() => setDragIndex(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex != null) reorder(dragIndex, idx);
                setDragIndex(null);
              }}
              className="admin-card flex flex-wrap items-center gap-3 p-3"
            >
              <span className="admin-drag-handle">
                <GripVertical className="h-4 w-4" />
              </span>
              <button
                type="button"
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--admin-line)] bg-[var(--admin-bg)]"
                onClick={() => setPickerFor(idx)}
                title="Variant image"
              >
                {v.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus className="mx-auto h-5 w-5 text-[var(--admin-muted)]" />
                )}
              </button>
              <div className="min-w-[140px] flex-1">
                <label className="admin-label">Variant name</label>
                <input
                  className="admin-input"
                  value={v.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  placeholder="e.g. Blue"
                />
              </div>
              <div className="min-w-[200px] flex-1">
                <label className="admin-label">Linked Product (optional)</label>
                <ProductSelect
                  value={v.slug || ""}
                  onChange={(slug, name, image) => {
                    update(idx, {
                      slug,
                      name: v.name ? v.name : (name || ""),
                      image: v.image ? v.image : (image || ""),
                    });
                  }}
                  products={products}
                  loading={loading}
                  excludeSlugs={[
                    currentSlug || "",
                    ...variants
                      .map((other, otherIdx) =>
                        otherIdx === idx ? "" : other.slug || "",
                      )
                      .filter(Boolean),
                  ]}
                />
              </div>
              <div className="min-w-[180px] flex-[1.5]">
                <label className="admin-label">Image URL</label>
                <input
                  className="admin-input"
                  value={v.image}
                  onChange={(e) => update(idx, { image: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-danger px-2"
                onClick={() => remove(idx)}
                aria-label="Delete variant"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <MediaPicker
        open={pickerFor != null}
        onClose={() => setPickerFor(null)}
        onSelect={(url) => {
          if (pickerFor != null) update(pickerFor, { image: url });
          setPickerFor(null);
        }}
      />
    </div>
  );
}

function ProductSelect({
  value,
  onChange,
  products,
  loading,
  excludeSlugs = [],
}: {
  value: string;
  onChange: (slug: string, name?: string, image?: string) => void;
  products: ProductOption[];
  loading: boolean;
  excludeSlugs?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const excluded = new Set(excludeSlugs.filter(Boolean));
  const selectedProduct = products.find((p) => p.slug === value);
  const q = search.toLowerCase();

  const filteredProducts = products.filter((p) => {
    if (p.slug !== value && excluded.has(p.slug)) return false;
    return (
      p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  });

  const toggleOpen = () => {
    setIsOpen((open) => !open);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="admin-input flex items-center justify-between gap-2 min-h-[42px]">
        <button
          type="button"
          onClick={toggleOpen}
          className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left cursor-pointer bg-transparent p-0 border-0"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {selectedProduct ? (
            <>
              {selectedProduct.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedProduct.image}
                  alt=""
                  className="h-6 w-6 rounded object-cover shrink-0"
                />
              ) : (
                <div className="h-6 w-6 rounded bg-[var(--admin-bg)] shrink-0" />
              )}
              <span className="truncate text-sm font-medium">{selectedProduct.name}</span>
            </>
          ) : value ? (
            <span className="truncate text-sm italic text-[var(--admin-muted)]">
              Custom: {value}
            </span>
          ) : (
            <span className="text-sm text-[var(--admin-muted)]">Select product...</span>
          )}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-0.5 hover:bg-[var(--admin-bg)] rounded text-[var(--admin-muted)] hover:text-[var(--admin-ink)]"
              title="Clear selection"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleOpen}
            className="p-0.5 bg-transparent border-0 cursor-pointer text-[var(--admin-muted)]"
            aria-label={isOpen ? "Close product list" : "Open product list"}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-fuse-md border border-[var(--admin-line)] bg-[var(--admin-surface)] p-2 shadow-lg max-h-80 overflow-hidden flex flex-col">
          <div className="relative mb-2 shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--admin-muted)]" />
            <input
              type="text"
              className="admin-input py-1.5 text-sm"
              style={{ paddingLeft: "2.25rem" }}
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="overflow-y-auto flex-1 max-h-56 divide-y divide-[var(--admin-line)]">
            {search && !products.some((p) => p.slug === search) && (
              <button
                type="button"
                onClick={() => {
                  onChange(search);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 hover:bg-[var(--admin-accent-soft)] text-left text-xs font-semibold text-[var(--admin-accent)] transition-colors"
              >
                Use custom slug: &ldquo;{search}&rdquo;
              </button>
            )}
            {loading ? (
              <div className="py-3 text-center text-xs text-[var(--admin-muted)]">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-3 text-center text-xs text-[var(--admin-muted)]">
                No products found
              </div>
            ) : (
              filteredProducts.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => {
                    onChange(p.slug, p.name, p.image);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 hover:bg-[var(--admin-accent-soft)] text-left transition-colors"
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt=""
                      className="h-8 w-8 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-[var(--admin-bg)] shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate text-[var(--admin-ink)]">
                      {p.name}
                    </div>
                    <div className="text-xs text-[var(--admin-muted)] truncate">
                      {p.slug}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
