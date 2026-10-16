"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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

const STEPS = [
  { id: 1, label: "Basic" },
  { id: 2, label: "Flags" },
  { id: 3, label: "Images" },
  { id: 4, label: "Variants" },
  { id: 5, label: "Sizes" },
  { id: 6, label: "Specs" },
  { id: 7, label: "Preview" },
];

export default function ProductForm({
  initial,
  productId,
}: {
  initial: ProductInput;
  productId?: number;
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ProductInput>(initial);
  const [pending, startTransition] = useTransition();

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

    const payload: ProductInput = {
      ...data,
      image: data.image || data.images?.[0] || "",
      title: data.title || data.name,
      subtitle: data.subtitle || data.description,
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
      router.push("/admin/products");
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
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-[var(--admin-accent)] text-white"
                      : done
                        ? "bg-[var(--admin-accent-soft)] text-[var(--admin-ink)]"
                        : "text-[var(--admin-muted)] hover:bg-[var(--admin-bg)]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      active
                        ? "bg-white/20"
                        : done
                          ? "bg-[var(--admin-accent)] text-white"
                          : "bg-[var(--admin-line)]"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" /> : s.id}
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
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="admin-label" htmlFor="name">
                Product name *
              </label>
              <input
                id="name"
                className="admin-input"
                value={data.name || ""}
                onChange={(e) => {
                  const name = e.target.value;
                  patch({
                    name,
                    title: data.title === data.name ? name : data.title,
                  });
                }}
                placeholder="HYDROCONQUEST EXCLUSIVE EDITION"
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
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="collection">
                Collection
              </label>
              <input
                id="collection"
                className="admin-input"
                value={data.collection || ""}
                onChange={(e) => patch({ collection: e.target.value })}
                placeholder="HYDROCONQUEST"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="code">
                Product code
              </label>
              <input
                id="code"
                className="admin-input"
                value={data.code || ""}
                onChange={(e) => patch({ code: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="tag">
                Tag
              </label>
              <input
                id="tag"
                className="admin-input"
                value={data.tag || ""}
                onChange={(e) => patch({ tag: e.target.value })}
                placeholder="NEW"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                className="admin-input"
                value={data.gender || "Unisex"}
                onChange={(e) => patch({ gender: e.target.value })}
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label" htmlFor="price">
                Price *
              </label>
              <input
                id="price"
                className="admin-input"
                value={data.price || ""}
                onChange={(e) => patch({ price: e.target.value })}
                placeholder="₹ 1,10,000"
              />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label" htmlFor="priceSubtext">
                Price subtext
              </label>
              <input
                id="priceSubtext"
                className="admin-input"
                value={data.priceSubtext || ""}
                onChange={(e) => patch({ priceSubtext: e.target.value })}
                placeholder="Recommended Retail Price…"
              />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label" htmlFor="title">
                Long title (optional)
              </label>
              <input
                id="title"
                className="admin-input"
                value={data.title || ""}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="admin-input min-h-[100px]"
                value={data.description || ""}
                onChange={(e) =>
                  patch({
                    description: e.target.value,
                    subtitle: e.target.value,
                  })
                }
              />
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
                <input
                  type="checkbox"
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
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
