import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watches",
  description: "Explore the Timect collection — precision wristwatches for him and for her, filtered by collection, price and style.",
  alternates: { canonical: "/watches" },
};

export default function WatchesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
