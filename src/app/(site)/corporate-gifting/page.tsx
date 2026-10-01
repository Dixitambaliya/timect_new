import type { Metadata } from "next";
import { publicGetCorporateGiftingItems } from "@/admin/actions/corporate-gifting";
import CorporateGifting from "@/components/gifting/CorporateGifting";

export const metadata: Metadata = {
  title: "Corporate Gifting",
  description:
    "Find the perfect Timect corporate gift — precision watches for employee recognition, client gifts, and milestone celebrations.",
  openGraph: {
    title: "Find your gift | Timect Corporate Gifting",
    description: "A gallery of Timect timepieces for recognition, clients, and milestones.",
    type: "website",
  },
};

/** Corporate gifting catalog managed from /admin/corporate-gifting. */
export default async function CorporateGiftingPage() {
  const items = await publicGetCorporateGiftingItems();
  return <CorporateGifting items={items} />;
}
