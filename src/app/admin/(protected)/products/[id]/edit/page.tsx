"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Breadcrumbs from "@/admin/components/layout/Breadcrumbs";
import ProductForm from "@/admin/components/products/ProductForm";
import {
  emptyProductInput,
  productToInput,
  type ProductInput,
} from "@/admin/lib/product-mapper";
import {
  adminGetAllProductsQuick,
  adminGetProduct,
} from "@/admin/actions/products";

type VariantProduct = {
  id: number;
  slug: string;
  name: string;
  image: string;
};

export default function EditProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Number(params?.id);
  const requestedReturnTo = searchParams.get("returnTo") || "";
  const returnTo = requestedReturnTo.startsWith("/admin/products") && !requestedReturnTo.startsWith("//")
    ? requestedReturnTo
    : "/admin/products";
  const [input, setInput] = useState<ProductInput | null>(null);
  const [variantProducts, setVariantProducts] = useState<VariantProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<number | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) return;

    let cancelled = false;
    Promise.all([adminGetProduct(id), adminGetAllProductsQuick()]).then(
      ([product, products]) => {
        if (cancelled) return;
        if (!product) {
          setError("Product not found");
          setLoadedId(id);
          return;
        }

        const linkedSlugs = new Set([
          product.slug,
          ...(product.variants || []).map((variant) => variant.slug).filter(Boolean),
        ]);
        setVariantProducts(
          products.filter((candidate) => linkedSlugs.has(candidate.slug)),
        );
        setError(null);
        setInput(productToInput(product));
        setLoadedId(id);
      },
    ).catch(() => {
      if (!cancelled) {
        setError("Could not load this product");
        setLoadedId(id);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id || Number.isNaN(id)) {
    return (
      <div className="admin-card p-10 text-center text-sm text-[var(--admin-muted)]">
        Invalid product id
      </div>
    );
  }

  if (loadedId !== id) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card p-10 text-center text-sm text-[var(--admin-muted)]">
        {error}
      </div>
    );
  }

  if (!input) return null;

  return (
    <div className="space-y-4">
      <div>
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Products", href: returnTo },
            { label: "Edit" },
          ]}
        />
        <h1 className="text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">
          Edit product
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          {input.name || input.title || `#${id}`}
        </p>
      </div>

      {variantProducts.length > 1 && (
        <div className="admin-card p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold">Edit product variants</p>
            <p className="text-xs text-[var(--admin-muted)]">
              Select a variant to edit all of its product details.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {variantProducts.map((variant) => {
              const active = variant.id === id;
              return (
                <Link
                  key={variant.id}
                  href={`/admin/products/${variant.id}/edit?returnTo=${encodeURIComponent(returnTo)}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-w-[180px] items-center gap-2 rounded-fuse-md border px-3 py-2 transition ${
                    active
                      ? "border-[var(--admin-accent)] bg-[var(--admin-accent-soft)]"
                      : "border-[var(--admin-line)] hover:border-[var(--admin-accent)] hover:bg-[var(--admin-bg)]"
                  }`}
                >
                  <span className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-[var(--admin-bg)]">
                    {variant.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={variant.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {variant.name}
                    </span>
                    <span className="block truncate text-[11px] text-[var(--admin-muted)]">
                      {active ? "Currently editing" : "Edit this variant"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <ProductForm
        key={id}
        initial={input || emptyProductInput()}
        productId={id}
        returnTo={returnTo}
      />
    </div>
  );
}
