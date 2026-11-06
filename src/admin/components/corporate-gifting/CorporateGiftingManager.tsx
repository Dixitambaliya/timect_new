"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Gift,
  Plus,
  Search,
  Edit2,
  Trash2,
  ImageIcon,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import type { GiftSample } from "@/data/giftSamples";
import {
  adminCreateCorporateGiftingItem,
  adminDeleteCorporateGiftingItem,
  adminUpdateCorporateGiftingItem,
  type GiftItemInput,
} from "@/admin/actions/corporate-gifting";
import MediaPicker from "@/admin/components/media/MediaPicker";
import ConfirmDialog from "@/admin/components/ui/ConfirmDialog";
import { useToast } from "@/admin/hooks/useToast";
import Breadcrumbs from "@/admin/components/layout/Breadcrumbs";
import Pagination from "@/admin/components/ui/Pagination";
import { Select, SelectOption } from "@/components/ui/select";

type Props = {
  initialItems: GiftSample[];
};

const GENDER_OPTIONS = ["All", "Men", "Women", "Unisex"] as const;
const PAGE_SIZE = 20;

export default function CorporateGiftingManager({ initialItems }: Props) {
  const { success, error } = useToast();
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<GiftSample[]>(initialItems);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "price-asc" | "price-desc">("newest");
  const [page, setPage] = useState(1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GiftSample | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<GiftItemInput>({
    name: "",
    title: "",
    price: "₹ 1,25,000",
    image: "",
    hoverImage: "",
    brand: "Timect",
    collection: "Heritage",
    gender: "Unisex",
    accentColor: "#4a5d6e",
    caseSize: "40mm",
    subtitle: "",
    specifications: [
      { label: "Movement", value: "Automatic" },
      { label: "Case", value: "40mm steel" },
    ],
  });

  // Media Picker state for form
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"image" | "hoverImage" | null>(null);

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.collection && item.collection.toLowerCase().includes(q)) ||
      (item.title && item.title.toLowerCase().includes(q));

    const matchesGender =
      genderFilter === "All" ||
      (item.gender && item.gender.toLowerCase() === genderFilter.toLowerCase());

    return matchesSearch && matchesGender;
  });

  const parsePrice = (value: string) => {
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "oldest") return a.id - b.id;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price-asc") return parsePrice(a.price) - parsePrice(b.price);
    if (sortBy === "price-desc") return parsePrice(b.price) - parsePrice(a.price);
    return b.id - a.id;
  });
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const paginatedItems = sortedItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, genderFilter, sortBy]);
  useEffect(() => setPage((current) => Math.min(current, totalPages)), [totalPages]);

  useEffect(() => {
    if (!isFormOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending && !mediaPickerTarget) setIsFormOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFormOpen, isPending, mediaPickerTarget]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      title: "",
      price: "₹ 1,25,000",
      image: "",
      hoverImage: "",
      brand: "Timect",
      collection: "Heritage",
      gender: "Unisex",
      accentColor: "#4a5d6e",
      caseSize: "40mm",
      subtitle: "",
      specifications: [
        { label: "Movement", value: "Automatic" },
        { label: "Case", value: "40mm steel" },
      ],
    });
    setIsFormOpen(true);
  };

  const openEditModal = (item: GiftSample) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      title: item.title || "",
      price: item.price,
      image: item.image,
      hoverImage: item.hoverImage || "",
      brand: item.brand || "Timect",
      collection: item.collection || "",
      gender: item.gender || "Unisex",
      accentColor: item.accentColor || "#4a5d6e",
      caseSize: item.caseSize || "",
      subtitle: item.subtitle || "",
      specifications: item.specifications?.length
        ? [...item.specifications]
        : [
            { label: "Movement", value: "Automatic" },
            { label: "Case", value: "40mm steel" },
          ],
    });
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error("Product name is required.");
      return;
    }
    if (!formData.price.trim()) {
      error("Price is required.");
      return;
    }
    if (!formData.image.trim()) {
      error("Product Image URL is required.");
      return;
    }

    startTransition(async () => {
      if (editingItem) {
        const res = await adminUpdateCorporateGiftingItem(editingItem.id, formData);
        if (res.ok) {
          setItems((prev) =>
            prev.map((i) => (i.id === editingItem.id ? res.item : i))
          );
          success(`Updated "${res.item.name}"`);
          setIsFormOpen(false);
        } else {
          error(res.error);
        }
      } else {
        const res = await adminCreateCorporateGiftingItem(formData);
        if (res.ok) {
          setItems((prev) => [res.item, ...prev]);
          success(`Created corporate gift "${res.item.name}"`);
          setIsFormOpen(false);
        } else {
          error(res.error);
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await adminDeleteCorporateGiftingItem(deletingId);
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== deletingId));
        success("Corporate gift item removed");
      } else {
        error(res.error);
      }
      setDeletingId(null);
    });
  };

  const handleAddSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...(prev.specifications || []), { label: "", value: "" }],
    }));
  };

  const handleRemoveSpec = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: (prev.specifications || []).filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateSpec = (idx: number, field: "label" | "value", val: string) => {
    setFormData((prev) => {
      const specs = [...(prev.specifications || [])];
      specs[idx] = { ...specs[idx], [field]: val };
      return { ...prev, specifications: specs };
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div>
        <div>
          <Breadcrumbs
            items={[
              { label: "Admin", href: "/admin/dashboard" },
              { label: "Corporate Gifting" },
            ]}
          />
          <h1 className="text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">
            Corporate Gifting Catalog
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Create, edit, and manage luxury corporate gifting items shown on the storefront Corporate Gifting page.
          </p>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            className="admin-input w-auto"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            {GENDER_OPTIONS.map((gender) => (
              <SelectOption key={gender} value={gender}>{gender === "All" ? "All genders" : gender}</SelectOption>
            ))}
          </Select>
          <Select
            className="admin-input w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <SelectOption value="newest">Newest</SelectOption>
            <SelectOption value="oldest">Oldest</SelectOption>
            <SelectOption value="name">Name</SelectOption>
            <SelectOption value="price-asc">Price ↑</SelectOption>
            <SelectOption value="price-desc">Price ↓</SelectOption>
          </Select>
          <div className="relative min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input
            type="text"
            placeholder="Search by gift name or collection..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-9"
          />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/corporate-gifting" target="_blank" rel="noreferrer" className="admin-btn admin-btn-secondary">
            Preview storefront
          </a>
          <button type="button" onClick={openCreateModal} className="admin-btn admin-btn-primary">
            <Plus className="h-4 w-4" /> Add gift item
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="admin-card overflow-hidden">
        {sortedItems.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--admin-muted)]">
            No corporate gift items found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[var(--admin-line)] bg-[var(--admin-bg)] text-xs uppercase tracking-wider text-[var(--admin-muted)]">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Collection</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Accent</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--admin-line)] last:border-0 hover:bg-[var(--admin-bg)]/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--admin-bg)]">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt="" className="h-full w-full object-cover" />
                          ) : <ImageIcon className="m-3 h-6 w-6 text-[var(--admin-muted)]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.name}</p>
                          <p className="truncate text-xs text-[var(--admin-muted)]">{item.slug}{item.caseSize ? ` · ${item.caseSize}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{item.price}</td>
                    <td className="px-4 py-3 text-[var(--admin-muted)]">{item.collection || "—"}</td>
                    <td className="px-4 py-3 text-[var(--admin-muted)]">{item.gender || "—"}</td>
                    <td className="px-4 py-3">
                      {item.accentColor ? (
                        <span className="inline-flex items-center gap-2 font-mono text-xs text-[var(--admin-muted)]">
                          <span className="h-4 w-4 rounded-full border border-black/20" style={{ backgroundColor: item.accentColor }} />
                          {item.accentColor}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => openEditModal(item)} className="admin-btn admin-btn-ghost px-2" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setDeletingId(item.id)} className="admin-btn admin-btn-ghost px-2 text-[var(--admin-danger)]" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} total={sortedItems.length} onChange={setPage} />

      <div className="hidden">
        <div className="border-b border-[var(--admin-line)] px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Gift className="h-4 w-4 text-[var(--admin-accent)]" />
            Corporate Gift Items ({filteredItems.length})
          </h2>
          <a
            href="/corporate-gifting"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[var(--admin-muted)] hover:text-[var(--admin-ink)] underline"
          >
            Preview gifting page ↗
          </a>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--admin-muted)]">
            No corporate gift items found matching your filters.
          </div>
        ) : (
          <div className="divide-y divide-[var(--admin-line)]">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 transition hover:bg-[var(--admin-bg)]"
              >
                <div className="flex items-center gap-4 min-w-[280px] flex-1">
                  {/* Thumbnail */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-fuse-md border border-[var(--admin-line)] bg-[#faf9f6]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 m-4 text-[var(--admin-muted)]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[var(--admin-ink)] truncate">
                        {item.name}
                      </h3>
                      {item.collection && (
                        <span className="rounded bg-[var(--admin-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--admin-muted)]">
                          {item.collection}
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-xs text-[var(--admin-muted)]">
                      {item.price}
                      {item.caseSize ? ` · ${item.caseSize}` : ""}
                      {item.gender ? ` · ${item.gender}` : ""}
                    </p>
                  </div>
                </div>

                {/* Accent swatch preview */}
                <div className="flex items-center gap-3">
                  {item.accentColor && (
                    <div
                      className="flex items-center gap-1.5 rounded-full border border-black/10 px-2.5 py-1 text-[11px]"
                      title="Gift overlay accent color"
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-black/20"
                        style={{ backgroundColor: item.accentColor }}
                      />
                      <span className="text-xs text-[var(--admin-muted)] font-mono">
                        {item.accentColor}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="admin-btn admin-btn-ghost px-2.5 text-xs"
                      title="Edit item"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(item.id)}
                      className="admin-btn admin-btn-ghost px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                      title="Delete item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#23232314] backdrop-blur-[12px]"
            onClick={() => setIsFormOpen(false)}
          />

          <div className="admin-card relative z-10 flex max-h-[90vh] w-full max-w-2xl animate-rise-in flex-col overflow-hidden shadow-[var(--admin-shadow-lg)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--admin-line)] px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {editingItem ? `Edit Gift Item: ${editingItem.name}` : "Create New Corporate Gift"}
                </h3>
                <p className="text-xs text-[var(--admin-muted)]">
                  Fill in gift details to display in the corporate gifting animation.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1 hover:bg-[var(--admin-bg)]"
                onClick={() => setIsFormOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="admin-scrollbar flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="admin-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heritage Blue Automatic"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">Price *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹ 1,25,000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Main Image */}
              <div>
                <label className="admin-label">Main Image URL *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://res.cloudinary.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="admin-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("image")}
                    className="admin-btn admin-btn-secondary shrink-0"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Pick Image
                  </button>
                </div>
                {formData.image && (
                  <div className="mt-2 h-16 w-16 overflow-hidden rounded-lg border border-[var(--admin-line)] bg-[#faf9f6]">
                    <img src={formData.image} alt="" className="h-full w-full object-contain p-1" />
                  </div>
                )}
              </div>

              {/* Hover Image */}
              <div>
                <label className="admin-label">Hover Image URL (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://res.cloudinary.com/..."
                    value={formData.hoverImage || ""}
                    onChange={(e) => setFormData({ ...formData, hoverImage: e.target.value })}
                    className="admin-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("hoverImage")}
                    className="admin-btn admin-btn-secondary shrink-0"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Pick Image
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="admin-label">Collection</label>
                  <input
                    type="text"
                    placeholder="e.g. Heritage"
                    value={formData.collection || ""}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">Gender</label>
                  <Select
                    value={formData.gender || "Unisex"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="admin-input"
                  >
                    <SelectOption value="Men">Men</SelectOption>
                    <SelectOption value="Women">Women</SelectOption>
                    <SelectOption value="Unisex">Unisex</SelectOption>
                  </Select>
                </div>

                <div>
                  <label className="admin-label">Case Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 40mm"
                    value={formData.caseSize || ""}
                    onChange={(e) => setFormData({ ...formData, caseSize: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="admin-label">Overlay Accent Circle Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accentColor || "#4a5d6e"}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded border border-[var(--admin-line)] p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      placeholder="#4a5d6e"
                      value={formData.accentColor || ""}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="admin-input font-mono text-xs flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">Subtitle Subtext</label>
                  <input
                    type="text"
                    placeholder="e.g. 40mm · Automatic · Heritage Blue"
                    value={formData.subtitle || ""}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Dynamic Specifications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="admin-label mb-0">Specifications</label>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="text-xs font-medium text-[var(--admin-accent)] hover:underline"
                  >
                    + Add spec line
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.specifications?.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Label (e.g. Movement)"
                        value={spec.label}
                        onChange={(e) => handleUpdateSpec(idx, "label", e.target.value)}
                        className="admin-input flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Automatic)"
                        value={spec.value}
                        onChange={(e) => handleUpdateSpec(idx, "value", e.target.value)}
                        className="admin-input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--admin-line)]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="admin-btn admin-btn-secondary"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {editingItem ? "Save Changes" : "Create Gift Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Dialog */}
      {mediaPickerTarget && (
        <MediaPicker
          open={!!mediaPickerTarget}
          onClose={() => setMediaPickerTarget(null)}
          onSelect={(url) => {
            if (mediaPickerTarget === "image") {
              setFormData((prev) => ({ ...prev, image: url }));
            } else if (mediaPickerTarget === "hoverImage") {
              setFormData((prev) => ({ ...prev, hoverImage: url }));
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Corporate Gift Item"
        description="Are you sure you want to remove this gift product? It will be removed from the corporate gifting animation page."
        danger
        loading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
