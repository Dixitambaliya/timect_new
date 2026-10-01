"use client";

import Breadcrumbs from "@/admin/components/layout/Breadcrumbs";
import ProductForm from "@/admin/components/products/ProductForm";
import { emptyProductInput } from "@/admin/lib/product-mapper";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <div>
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Products", href: "/admin/products" },
            { label: "New" },
          ]}
        />
        <h1 className="text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">New product</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Multi-step editor · matches storefront product model
        </p>
      </div>
      <ProductForm initial={emptyProductInput()} />
    </div>
  );
}
