import type { Metadata } from "next";
import CorporateGiftingExperience from "@/components/immersive/CorporateGiftingExperience";
import { publicGetCorporateGiftingItems } from "@/admin/actions/corporate-gifting";

export const metadata: Metadata = {
  title: "Corporate Gifting",
  alternates: { canonical: "/corporate-gifting" },
  description:
    "Find the perfect Timect corporate gift — infinite collection of precision watches for employee recognition, client gifts, and milestone celebrations.",
  openGraph: {
    title: "Find your gift | Timect Corporate Gifting",
    description:
      "An endless gallery of Timect timepieces for recognition, clients, and milestones.",
    type: "website",
  },
};

/**
 * Corporate gifting catalog dynamically loaded from admin management,
 * with zero-config fallback to default static samples.
 */
export default async function CorporateGiftingPage() {
  const products = await publicGetCorporateGiftingItems();
  return <CorporateGiftingExperience products={products} />;
}
