"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/fuse/ui";
import ProductCard, { type CardProduct } from "@/components/site/ProductCard";

const KEY = "timect-recent";

/** Stores the current product and shows the last viewed ones (Fuse "Recently viewed"). */
export default function RecentlyViewed({ current }: { current: CardProduct }) {
  const [items, setItems] = useState<CardProduct[]>([]);

  useEffect(() => {
    try {
      const list: CardProduct[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      const others = list.filter((p) => p && p.slug && p.slug !== current.slug);
      setItems(others.slice(0, 4));
      localStorage.setItem(KEY, JSON.stringify([current, ...others].slice(0, 8)));
    } catch {
      /* storage unavailable */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.slug]);

  if (!items.length) return null;
  return (
    <section className="mt-16">
      <Reveal as="h2" type="wipe" className="fuse-h3 mb-8 text-center">
        Recently viewed
      </Reveal>
      <ul className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
        {items.map((p) => (
          <li key={p.slug}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
