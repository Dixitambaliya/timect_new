import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import WatchesCatalog from "@/components/catalog/WatchesCatalog";
import { getCatalogFacets, getCatalogFilters, getShopCategories, resolveCatalogFilter } from "@/db/content";
import { createPageMetadata } from "@/lib/seo/metadata";
import { FIXED_CATALOG_LANDINGS, filterCatalogLanding } from "@/lib/seo/catalog-pages";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/lib/seo/structured-data";

type Props = { params: Promise<{ category: string }> };

async function getLanding(slug: string) {
  const fixed = FIXED_CATALOG_LANDINGS[slug];
  if (fixed) return fixed;
  const filter = await resolveCatalogFilter(slug);
  return filter ? filterCatalogLanding(filter) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const landing = await getLanding(category);
  if (!landing) return createPageMetadata({ title: "Watch collection not found", description: "This Timect watch collection could not be found.", path: `/watches/${category}`, noIndex: true });
  return createPageMetadata({
    title: landing.title,
    description: landing.description,
    path: `/watches/${landing.slug}`,
    keywords: landing.keywords,
  });
}

export default async function WatchCategoryPage({ params }: Props) {
  const { category } = await params;
  const landing = await getLanding(category);
  if (!landing) notFound();
  const [facets, filters, categories] = await Promise.all([getCatalogFacets(), getCatalogFilters(), getShopCategories()]);
  const filterLabels = Object.fromEntries(Object.values(filters).map((filter) => [filter.slug, filter.label]));
  const path = `/watches/${landing.slug}`;

  return (
    <>
      <JsonLd data={webPageSchema({ name: landing.heading, description: landing.description, path, type: "CollectionPage" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Watches", path: "/watches" }, { name: landing.heading, path }])} />
      <Suspense fallback={<div className="container-fuse min-h-[70vh]" aria-busy="true" />}>
        <WatchesCatalog
          facets={facets}
          filterLabels={filterLabels}
          categories={categories}
          initialCategory={landing.initialCategory}
          initialFilter={landing.initialFilter}
          initialGenders={landing.initialGenders}
          seoHeading={landing.heading}
          seoDescription={landing.description}
        />
      </Suspense>
    </>
  );
}
