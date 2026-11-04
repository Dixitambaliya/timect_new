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
import { JsonLd, webPageSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  ...createPageMetadata({
  title: "TIMECT | Precision Watches & Refined Timepieces",
  description: "Explore TIMECT watch collections, new arrivals, detailed specifications, and timepieces for everyday wear and gifting.",
  path: "/",
  }),
  title: { absolute: "TIMECT | Precision Watches & Refined Timepieces" },
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
      <JsonLd data={webPageSchema({ name: "TIMECT | Precision Watches & Refined Timepieces", description: "Explore TIMECT watch collections, new arrivals, detailed specifications, and timepieces for everyday wear and gifting.", path: "/" })} />
      <HomeHero slides={storefront.heroSlides} />
      <HomeStatement heading={storefront.statement.heading} text={storefront.statement.text} categories={categories} />
      <ProductTabs
        heading="New this season"
        tabs={[
          { id: "new", label: "New arrivals", href: "/watches?category=new", products: arrivals.map(toCard) },
          { id: "recommended", label: "Recommended", href: "/watches?category=recommended", products: recommended.map(toCard) },
        ]}
      />
      <CategoryCarousel categories={categories} />
      <GridBanner banners={storefront.banners} />
      <QuoteTicker text={storefront.quote.text} images={tickerImages} />
    </>
  );
}
import type { Metadata } from "next";
