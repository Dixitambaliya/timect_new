import type { Metadata } from "next";
import { Suspense } from "react";
import { getCatalogFacets, getCatalogFilters, getShopCategories } from "@/db/content";
import WatchesCatalog from "@/components/catalog/WatchesCatalog";
import { createPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, webPageSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = createPageMetadata({
  title: "Watches",
  description: "Browse TIMECT watches and compare collections, movements, case materials, dial colors, sizes, and other available specifications.",
  path: "/watches",
});

export default async function WatchesPage() {
  const [facets, filters, categories] = await Promise.all([
    getCatalogFacets(),
    getCatalogFilters(),
    getShopCategories(),
  ]);
  const filterLabels = Object.fromEntries(Object.values(filters).map((f) => [f.slug, f.label]));

  return (
    <>
      <JsonLd data={webPageSchema({ name: "TIMECT Watches", description: "Browse TIMECT watches and compare available specifications.", path: "/watches", type: "CollectionPage" })} />
      <Suspense fallback={<div className="container-fuse min-h-[70vh]" aria-busy="true" />}>
        <WatchesCatalog facets={facets} filterLabels={filterLabels} categories={categories} />
      </Suspense>
    </>
  );
}
