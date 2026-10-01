"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Breadcrumbs from "@/admin/components/layout/Breadcrumbs";
import ProductForm from "@/admin/components/products/ProductForm";
import {
  emptyProductInput,
  productToInput,
  type ProductInput,
} from "@/admin/lib/product-mapper";
import { adminGetProduct } from "@/admin/actions/products";

export default function EditProductPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [input, setInput] = useState<ProductInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError("Invalid product id");
      return;
    }
    adminGetProduct(id).then((p) => {
      if (!p) setError("Product not found");
      else setInput(productToInput(p));
    });
  }, [id]);

  if (error) {
    return (
      <div className="admin-card p-10 text-center text-sm text-[var(--admin-muted)]">
        {error}
      </div>
    );
  }

  if (!input) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Products", href: "/admin/products" },
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
      <ProductForm initial={input || emptyProductInput()} productId={id} />
    </div>
  );
}
