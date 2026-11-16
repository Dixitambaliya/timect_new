import type { Metadata } from "next";
import { Suspense } from "react";
import { getCatalogFacets, getCatalogFilters, getShopCategories } from "@/db/content";
import WatchesCatalog from "@/components/catalog/WatchesCatalog";
import { createPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = createPageMetadata({
  title: "Timect Watches for Men & Women",
  description: "Browse Timect watches for men and women. Compare quartz watches, chronographs, dress watches, case sizes, dial colours, prices, and specifications.",
  path: "/watches",
  keywords: ["Timect watches", "watches for men", "watches for women", "quartz watches", "chronograph watches", "wrist watches online"],
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
      <JsonLd data={webPageSchema({ name: "Timect Watches for Men and Women", description: "Browse Timect wristwatches and compare movements, materials, case sizes, dial colours, and specifications.", path: "/watches", type: "CollectionPage" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Watches", path: "/watches" }])} />
      <Suspense fallback={<div className="container-fuse min-h-[70vh]" aria-busy="true" />}>
        <WatchesCatalog
          facets={facets}
          filterLabels={filterLabels}
          categories={categories}
          seoHeading="Timect watches"
          seoDescription="Explore Timect wristwatches for men and women, including quartz watches, chronographs, dress watches, and new arrivals. Compare prices, images, movements, materials, and case specifications."
        />
      </Suspense>
    </>
  );
}
