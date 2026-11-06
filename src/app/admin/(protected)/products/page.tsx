"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumbs from "@/admin/components/layout/Breadcrumbs";
import ProductTable from "@/admin/components/products/ProductTable";
import type { ProductListFilters } from "@/admin/actions/products";
import { TableSkeleton } from "@/admin/components/ui/Skeleton";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const flagParam = searchParams.get("flag") as ProductListFilters["flag"];
  const initialFlag =
    flagParam &&
    ["all", "main", "new", "recommended", "related"].includes(flagParam)
      ? flagParam
      : "all";
  const pageParam = Number(searchParams.get("page"));
  const initialPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const sortParam = searchParams.get("sort") as ProductListFilters["sortBy"];
  const initialSort =
    sortParam && ["newest", "oldest", "name", "price-asc", "price-desc"].includes(sortParam)
      ? sortParam
      : "newest";
  const initialGender = searchParams.get("gender") || undefined;
  const initialSearch = searchParams.get("search") || search;

  // Read navbar search from parent data attribute when present
  useEffect(() => {
    const el = document.querySelector("[data-admin-search]");
    if (!el) return;
    const obs = new MutationObserver(() => {
      setSearch(el.getAttribute("data-admin-search") || "");
    });
    setSearch(el.getAttribute("data-admin-search") || "");
    obs.observe(el, { attributes: true, attributeFilter: ["data-admin-search"] });
    return () => obs.disconnect();
  }, []);

  return (
    <ProductTable
      initialSearch={initialSearch}
      initialFlag={initialFlag}
      initialPage={initialPage}
      initialGender={initialGender}
      initialSort={initialSort}
    />
  );
}

export default function AdminProductsPage() {
  return (
    <div className="space-y-4">
      <div>
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Products" },
          ]}
        />
        <h1 className="text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">Products</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Search, filter, bulk edit, and manage the full catalog
        </p>
      </div>
      <Suspense
        fallback={
          <div className="admin-card">
            <TableSkeleton />
          </div>
        }
      >
        <ProductsContent />
      </Suspense>
    </div>
  );
}
