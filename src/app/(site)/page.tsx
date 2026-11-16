import { getNewArrivals, getRecommended } from "@/db/actions";
import { getShopCategories, getStorefront } from "@/db/content";
import HomeHero from "@/components/home/HomeHero";
import {
  CategoryCarousel,
  GridBanner,
  HomeStatement,
  ProductTabs,
  QuoteTicker,
} from "@/components/home/HomeSections";
import { toCard } from "@/lib/product-view";
import { createPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  ...createPageMetadata({
  title: "Timect Watches | Official Website",
  description: "Visit the official Timect Watches website for men's and women's wristwatches, quartz watches, chronographs, new arrivals, and corporate watch gifts.",
  path: "/",
  keywords: ["Timect Watches", "Timect Watch", "Timect", "Timect Watches official website", "wrist watches in India"],
  }),
  title: { absolute: "Timect Watches | Official Website" },
};

export default async function HomePage() {
  const [storefront, categories, arrivals, recommended] = await Promise.all([
    getStorefront(),
    getShopCategories(),
    getNewArrivals(),
    getRecommended(),
  ]);

  const tickerImages = [
    ...storefront.heroSlides.map((s) => s.image),
    ...arrivals.map((p) => p.image || ""),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={webPageSchema({ name: "Timect Watches | Official Website", description: "The official Timect Watches website for wristwatch collections, specifications, new arrivals, and corporate gifting.", path: "/" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Timect Watches", path: "/" }])} />
      <HomeHero slides={storefront.heroSlides} />
      <HomeStatement heading={storefront.statement.heading} text={storefront.statement.text} categories={categories} />
      <ProductTabs
        heading="New this season"
        tabs={[
          { id: "new", label: "New arrivals", href: "/watches/new-arrivals", products: arrivals.map(toCard) },
          { id: "recommended", label: "Recommended", href: "/watches/recommended-watches", products: recommended.map(toCard) },
        ]}
      />
      <CategoryCarousel categories={categories} />
      <GridBanner banners={storefront.banners} />
      <QuoteTicker text={storefront.quote.text} images={tickerImages} />
    </>
  );
}
import type { Metadata } from "next";
