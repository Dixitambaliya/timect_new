"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "@/admin/lib/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
} from "lucide-react";
import type { ProductInput } from "@/admin/lib/product-mapper";
import { slugify } from "@/admin/lib/slug";
import { GENDER_OPTIONS } from "@/admin/lib/constants";
import { calculateDiscount, parsePriceNumber } from "@/lib/price";
import {
  adminCreateProduct,
  adminUpdateProduct,
} from "@/admin/actions/products";
import { useToast } from "@/admin/hooks/useToast";
import ImageUploader from "./ImageUploader";
import VariantEditor from "./VariantEditor";
import SizeEditor from "./SizeEditor";
import SpecificationBuilder from "./SpecificationBuilder";
import ProductPreview from "./ProductPreview";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectOption } from "@/components/ui/select";
import DropdownWithAdd from "./DropdownWithAdd";
import { adminListCollections, adminListTags } from "@/admin/actions/collections";

const DEFAULT_COLLECTIONS = [
  "Anniversary",
  "Classic",
  "Conquest",
  "Corporate",
  "Dress",
  "Heritage",
  "HydroConquest",
  "Master",
  "Sport",
];

const DEFAULT_TAGS = [
  "NEW",
  "Quartz",
  "Automatic",
  "Mechanical",
  "Chronograph",
  "Best Seller",
  "Limited Edition",
  "Exclusive",
  "Sale",
];

const STEPS = [
  { id: 1, label: "Basic" },
  { id: 2, label: "Flags" },
  { id: 3, label: "Images" },
  { id: 4, label: "Colours" },
  { id: 5, label: "Sizes" },
  { id: 6, label: "Specs" },
  { id: 7, label: "Preview" },
];

export default function ProductForm({
  initial,
  productId,
  returnTo = "/admin/products",
}: {
  initial: ProductInput;
  productId?: number;
  returnTo?: string;
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ProductInput>(initial);
  const [pending, startTransition] = useTransition();

  const [collectionOptions, setCollectionOptions] = useState<string[]>(() =>
    Array.from(new Set([...DEFAULT_COLLECTIONS, ...(initial.collection ? [initial.collection] : [])]))
  );
  const [tagOptions, setTagOptions] = useState<string[]>(() =>
    Array.from(new Set([...DEFAULT_TAGS, ...(initial.tag ? [initial.tag] : [])]))
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminListCollections(), adminListTags()])
      .then(([cols, tags]) => {
        if (cancelled) return;
        if (cols.length) {
          const names = cols.map((c) => c.name).filter(Boolean);
          setCollectionOptions((prev) => Array.from(new Set([...prev, ...names])));
        }
        if (tags.length) {
          setTagOptions((prev) => Array.from(new Set([...prev, ...tags])));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = (p: Partial<ProductInput>) =>
    setData((prev) => ({ ...prev, ...p }));

  // Slug is always derived from the name on the server; this is only a preview.
  const autoSlug = useMemo(() => {
    const base = data.name || data.title || "";
    return slugify(base);
  }, [data.name, data.title]);

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!(data.name || data.title)?.trim()) return "Product name is required.";
      if (!data.price?.trim()) return "Price is required.";
    }
    if (s === 4) {
      const incomplete = (data.variants || []).find((variant) => !variant.name.trim() || !variant.slug);
      if (incomplete) return "Every colour variant needs a name and a linked product.";
      const invalidSwatch = (data.variants || []).find(
        (variant) => variant.colorHex && !/^#[0-9a-f]{6}$/i.test(variant.colorHex),
      );
      if (invalidSwatch) return "Colour swatches must use a six-digit hex value such as #1F4E79.";
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) {
      error(err);
      return;
    }
    setStep((x) => Math.min(7, x + 1));
  };

  const save = () => {
    const err = validateStep(1);
    if (err) {
      error(err);
      setStep(1);
      return;
    }
    const variantErr = validateStep(4);
    if (variantErr) {
      error(variantErr);
      setStep(4);
      return;
    }

    const payload: ProductInput = {
      ...data,
      image: data.image || data.images?.[0] || "",
      name: data.name,
      title: data.name,
      subtitle: data.subtitle,
      originalPrice: data.originalPrice || data.priceSubtext,
      priceSubtext: data.originalPrice || data.priceSubtext,
    };

    startTransition(async () => {
      const res = productId
        ? await adminUpdateProduct(productId, payload)
        : await adminCreateProduct(payload);

      if (!res.ok) {
        error(res.error);
        return;
      }
      success(productId ? "Product updated" : "Product created");
      router.push(returnTo);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="admin-card overflow-x-auto p-3">
        <ol className="flex min-w-max items-center gap-1">
          {STEPS.map((s) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <li key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-[var(--admin-accent-border)] bg-[var(--admin-accent-soft)] text-[var(--admin-heading)] font-semibold shadow-xs"
                      : done
                        ? "border-[var(--admin-line)] bg-[var(--admin-surface)] text-[var(--admin-ink)]"
                        : "border-transparent text-[var(--admin-muted)] hover:bg-[var(--admin-bg)]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      active
                        ? "bg-[var(--admin-accent)] text-white"
                        : done
                          ? "bg-emerald-600 text-white"
                          : "bg-[var(--admin-line)] text-[var(--admin-muted)]"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3 stroke-[2.5]" /> : s.id}
                  </span>
                  {s.label}
                </button>
                {s.id < 7 && (
                  <span className="mx-1 h-px w-4 bg-[var(--admin-line)]" />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="admin-card p-5 lg:p-6">
        {step === 1 && (
          <div className="space-y-6">
            {/* Section 1: General Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                General Information
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="admin-label" htmlFor="status">
                    Visibility
                  </label>
                  <Select
                    id="status"
                    className="admin-input"
                    value={data.status || "published"}
                    onChange={(e) => patch({ status: e.target.value as "published" | "draft" })}
                  >
                    <SelectOption value="published">Published - visible on storefront</SelectOption>
                    <SelectOption value="draft">Draft - hidden from storefront</SelectOption>
                  </Select>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    Draft products remain editable in admin but cannot be opened or found by customers.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label" htmlFor="name">
                    Product name *
                  </label>
                  <input
                    id="name"
                    className="admin-input text-base font-medium"
                    value={data.name || ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      patch({ name, title: name });
                    }}
                    placeholder="e.g. Timect Two-Tone Black & Silver"
                    autoFocus
                  />
                  <p className="mt-1 font-mono text-[11px] text-[var(--admin-muted)]">
                    /product/{autoSlug || "…"} · URL is generated from the name
                  </p>
                </div>

                <div>
                  <label className="admin-label" htmlFor="brand">
                    Brand
                  </label>
                  <input
                    id="brand"
                    className="admin-input"
                    value={data.brand || ""}
                    onChange={(e) => patch({ brand: e.target.value })}
                    placeholder="e.g. Timect"
                  />
                </div>

                <div>
                  <DropdownWithAdd
                    id="collection"
                    label="Collection"
                    value={data.collection || ""}
                    options={collectionOptions}
                    onChange={(collection) => patch({ collection })}
                    onAddOption={(newCol) =>
                      setCollectionOptions((prev) => Array.from(new Set([...prev, newCol])))
                    }
                    placeholder="-- Select collection --"
                  />
                </div>

                <div>
                  <DropdownWithAdd
                    id="tag"
                    label="Tag / Badge"
                    value={data.tag || ""}
                    options={tagOptions}
                    onChange={(tag) => patch({ tag })}
                    onAddOption={(newTag) =>
                      setTagOptions((prev) => Array.from(new Set([...prev, newTag])))
                    }
                    placeholder="-- Select badge (e.g. Quartz, Automatic) --"
                  />
                </div>

                <div>
                  <label className="admin-label" htmlFor="code">
                    Product Code / Ref. SKU
                  </label>
                  <input
                    id="code"
                    className="admin-input"
                    value={data.code || ""}
                    onChange={(e) => patch({ code: e.target.value })}
                    placeholder="e.g. Ref. L3.788.4.98.6"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label" htmlFor="gender">
                    Gender
                  </label>
                  <Select
                    id="gender"
                    className="admin-input"
                    value={data.gender || "Unisex"}
                    onChange={(e) => patch({ gender: e.target.value })}
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <SelectOption key={g} value={g}>
                        {g}
                      </SelectOption>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Discounts */}
            <div className="border-t border-[var(--admin-border)] pt-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Pricing & Discounts
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="admin-label" htmlFor="price">
                    Selling Price *
                  </label>
                  <input
                    id="price"
                    className="admin-input text-base font-semibold"
                    value={data.price || ""}
                    onChange={(e) => patch({ price: e.target.value })}
                    placeholder="e.g. ₹2,700"
                  />
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    The actual price the customer pays at checkout.
                  </p>
                </div>

                <div>
                  <label className="admin-label" htmlFor="originalPrice">
                    Original Price / MRP (optional)
                  </label>
                  <input
                    id="originalPrice"
                    className="admin-input"
                    value={data.originalPrice || data.priceSubtext || ""}
                    onChange={(e) =>
                      patch({
                        originalPrice: e.target.value,
                        priceSubtext: e.target.value,
                      })
                    }
                    placeholder="e.g. 5500 or ₹5,500"
                  />
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    Shown crossed out (e.g. ~~₹5,500~~) to display savings to customers.
                  </p>
                </div>

                {(() => {
                  const orig = data.originalPrice || data.priceSubtext;
                  const discount = orig ? calculateDiscount(data.price, orig) : 0;
                  const diff = orig ? parsePriceNumber(orig) - parsePriceNumber(data.price) : 0;
                  if (discount <= 0 || diff <= 0) return null;
                  return (
                    <div className="md:col-span-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800">
                      <span>✓ Discount Active: {discount}% OFF — Customer saves ₹{diff.toLocaleString("en-IN")}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Section 3: Content & Highlights */}
            <div className="border-t border-[var(--admin-border)] pt-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Content & Description
              </h3>
              <div className="grid gap-4">
                <div>
                  <label className="admin-label" htmlFor="subtitle">
                    Subtitle / Key Highlights (optional)
                  </label>
                  <input
                    id="subtitle"
                    className="admin-input"
                    value={data.subtitle || ""}
                    onChange={(e) => patch({ subtitle: e.target.value })}
                    placeholder="e.g. Quartz watch, Ø 40mm, steel case"
                  />
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    Short one-line summary displayed directly under the watch title on the storefront.
                  </p>
                </div>

                <div>
                  <label className="admin-label" htmlFor="description">
                    Full Description
                  </label>
                  <textarea
                    id="description"
                    className="admin-input min-h-[120px] leading-relaxed"
                    value={data.description || ""}
                    onChange={(e) => patch({ description: e.target.value })}
                    placeholder="Detailed description of the watch, materials, movement, and design features…"
                  />
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    Displayed in the Description accordion drawer on the product page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["isMainProduct", "Main product", "Featured as primary PDP"],
                ["isNewArrival", "New arrival", "Homepage New Arrivals shelf"],
                [
                  "isRecommended",
                  "Recommended",
                  "Homepage Recommended / best sellers",
                ],
                [
                  "isRelated",
                  "Related product",
                  "Related / premium collection shelf",
                ],
              ] as const
            ).map(([key, label, hint]) => (
              <label
                key={key}
                className="admin-card flex cursor-pointer items-start gap-3 p-4 transition hover:border-[var(--admin-accent)]"
              >
                <Checkbox
                  className="mt-1 h-4 w-4 accent-[var(--admin-accent)]"
                  checked={Boolean(data[key])}
                  onChange={(e) => patch({ [key]: e.target.checked })}
                />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="text-xs text-[var(--admin-muted)]">
                    {hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <ImageUploader
            images={data.images || []}
            primaryImage={data.image}
            hoverImage={data.hoverImage}
            onChange={(images) =>
              patch({
                images,
                image: data.image && images.includes(data.image)
                  ? data.image
                  : images[0] || "",
              })
            }
            onPrimaryChange={(url) => patch({ image: url })}
            onHoverChange={(url) => patch({ hoverImage: url })}
          />
        )}

        {step === 4 && (
          <VariantEditor
            variants={data.variants || []}
            onChange={(variants) => patch({ variants })}
            currentSlug={initial.slug || autoSlug}
          />
        )}

        {step === 5 && (
          <SizeEditor
            sizes={data.sizes || []}
            onChange={(sizes) => patch({ sizes })}
          />
        )}

        {step === 6 && (
          <SpecificationBuilder
            value={data.specifications || []}
            onChange={(specifications) => patch({ specifications })}
          />
        )}

        {step === 7 && <ProductPreview data={{ ...data, slug: autoSlug }} />}
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          disabled={step === 1 || pending}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            disabled={pending}
            onClick={save}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {productId ? "Save changes" : "Save product"}
          </button>
          {step < 7 ? (
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={goNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={pending}
              onClick={save}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {data.status === "draft" ? "Save draft" : "Publish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
