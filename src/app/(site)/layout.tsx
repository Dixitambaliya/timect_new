import { Suspense } from "react";
import { getShopCategories, getStorefront } from "@/db/content";
import SmoothScroll from "@/components/site/SmoothScroll";
import ScrollMotion from "@/components/site/ScrollMotion";
import { SiteProvider } from "@/components/site/SiteProvider";
import AnnouncementBar from "@/components/site/AnnouncementBar";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MenuDrawer from "@/components/site/MenuDrawer";
import SearchDrawer from "@/components/site/SearchDrawer";
import QuickView from "@/components/site/QuickView";
import BackToTop from "@/components/site/BackToTop";

// Storefront content is edited live from the admin panel.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, storefront] = await Promise.all([getShopCategories(), getStorefront()]);
  const whatsappNumber = storefront.contact.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

  return (
    <SiteProvider categories={categories} storefront={storefront} whatsappNumber={whatsappNumber}>
      <a
        href="#main"
        className="sr-only z-[100] rounded-fuse bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Suspense fallback={null}>
        <SmoothScroll />
      </Suspense>
      <ScrollMotion />
      <AnnouncementBar />
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <MenuDrawer />
      <SearchDrawer />
      <QuickView />
      <BackToTop />
    </SiteProvider>
  );
}
