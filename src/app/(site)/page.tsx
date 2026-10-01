import { getMainProduct, getNewArrivals, getRecommended } from "@/db/actions";
import { getShopCategories, getStorefront } from "@/db/content";
import HomeHero from "@/components/home/HomeHero";
import {
  CategoryCarousel,
  GridBanner,
  HomeStatement,
  ProductTabs,
  QuoteTicker,
} from "@/components/home/HomeSections";
import FeaturedProduct from "@/components/home/FeaturedProduct";
import { resolveVariants, toCard } from "@/lib/product-view";

export default async function HomePage() {
  const [storefront, categories, arrivals, recommended, mainRaw] = await Promise.all([
    getStorefront(),
    getShopCategories(),
    getNewArrivals(),
    getRecommended(),
    getMainProduct(),
  ]);
  const main = mainRaw ? await resolveVariants(mainRaw) : null;

  const tickerImages = [
    ...storefront.heroSlides.map((s) => s.image),
    ...arrivals.map((p) => p.image || ""),
  ].filter(Boolean);

  return (
    <>
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
      {main && <FeaturedProduct product={main} />}
      <QuoteTicker text={storefront.quote.text} images={tickerImages} />
    </>
  );
}
