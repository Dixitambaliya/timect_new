import type { Metadata } from "next";
import { publicGetCorporateGiftingItems } from "@/admin/actions/corporate-gifting";
import CorporateGifting from "@/components/gifting/CorporateGifting";
import { createPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/lib/seo/structured-data";
import { SEO_IDS, absoluteUrl } from "@/lib/seo/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Corporate Watch Gifts in India",
  description: "Explore Timect corporate watch gifts for employee recognition, client gifting, service awards, company milestones, and bulk watch enquiries in India.",
  path: "/corporate-gifting",
  keywords: ["corporate watch gifts", "corporate gifting watches India", "employee recognition watches", "bulk watch gifts", "client gift watches"],
});

/** Corporate gifting catalog managed from /admin/corporate-gifting. */
export default async function CorporateGiftingPage() {
  const items = await publicGetCorporateGiftingItems();
  return (
    <>
      <JsonLd data={webPageSchema({ name: "Corporate Watch Gifts in India", description: "Timect Watches for employee recognition, client gifts, service awards, and company milestones.", path: "/corporate-gifting", type: "CollectionPage" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Corporate Watch Gifting", path: "/corporate-gifting" }])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${absoluteUrl("/corporate-gifting")}#service`,
        name: "Corporate Watch Gifting",
        serviceType: "Corporate watch gifts and bulk watch gifting",
        provider: { "@id": SEO_IDS.organization },
        areaServed: { "@type": "Country", name: "India" },
        url: absoluteUrl("/corporate-gifting"),
      }} />
      <CorporateGifting items={items} />
    </>
  );
}
