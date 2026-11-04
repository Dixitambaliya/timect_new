import type { Metadata } from "next";
import { publicGetCorporateGiftingItems } from "@/admin/actions/corporate-gifting";
import CorporateGifting from "@/components/gifting/CorporateGifting";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Corporate Watch Gifting",
  description: "Explore TIMECT watches for corporate gifting enquiries, employee recognition, client gifts, and milestone occasions.",
  path: "/corporate-gifting",
});

/** Corporate gifting catalog managed from /admin/corporate-gifting. */
export default async function CorporateGiftingPage() {
  const items = await publicGetCorporateGiftingItems();
  return <CorporateGifting items={items} />;
}
