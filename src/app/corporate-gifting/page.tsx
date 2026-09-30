import type { Metadata } from "next";
import CorporateGiftingExperience from "@/components/immersive/CorporateGiftingExperience";
import { GIFT_SAMPLES } from "@/data/giftSamples";

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
 * Corporate gifting uses static sample products only.
 * No database queries, no products.json, no seed/write path.
 */
export default function CorporateGiftingPage() {
  return <CorporateGiftingExperience products={GIFT_SAMPLES} />;
}
