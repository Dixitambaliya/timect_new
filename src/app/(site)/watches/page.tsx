import type { Metadata } from "next";
import { Suspense } from "react";
import { getCatalogFacets, getCatalogFilters, getShopCategories } from "@/db/content";
import WatchesCatalog from "@/components/catalog/WatchesCatalog";

export const metadata: Metadata = {
  title: "Watches",
  description: "Explore the full Timect collection — filter by category, gender, brand and price.",
};

export default async function WatchesPage() {
  const [facets, filters, categories] = await Promise.all([
    getCatalogFacets(),
    getCatalogFilters(),
    getShopCategories(),
  ]);
  const filterLabels = Object.fromEntries(Object.values(filters).map((f) => [f.slug, f.label]));

  return (
    <Suspense fallback={<div className="container-fuse min-h-[70vh]" aria-busy="true" />}>
      <WatchesCatalog facets={facets} filterLabels={filterLabels} categories={categories} />
    </Suspense>
  );
}
