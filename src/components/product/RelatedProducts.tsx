"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WatchCard from "@/components/home/WatchCard";
import { getRelatedProducts, type Product } from "@/db/actions";

/** "You may also consider" — a quiet rail at the end of the product story. */
export default function RelatedProducts({ excludeSlug }: { excludeSlug?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    getRelatedProducts()
      .then((list) => !cancelled && setProducts(list))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = products.filter((p) => p.slug && p.slug !== excludeSlug).slice(0, 8);
  if (!visible.length) return null;

  return (
    <section aria-labelledby="related-title" className="bg-[var(--ivory)] py-24 md:py-32 overflow-hidden">
      <div className="lux-container flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-[var(--champagne)]">Also consider</p>
          <h2 id="related-title" className="display display-md mt-6">
            From the <em>collection.</em>
          </h2>
        </div>
        <Link href="/watches" className="lux-link">
          All watches{" "}
          <span className="lux-arrow" aria-hidden>
            →
          </span>
        </Link>
      </div>
      <div className="rail gap-5 md:gap-8 mt-14 px-[var(--gutter)] scroll-px-[var(--gutter)]">
        {visible.map((p, i) => (
          <div key={p.slug} className="shrink-0 w-[68vw] sm:w-[42vw] md:w-[30vw] lg:w-[22vw] xl:w-[20rem]">
            <WatchCard
              index={i}
              sizes="(min-width: 1024px) 22vw, 68vw"
              product={{
                slug: p.slug,
                name: p.name,
                title: p.title,
                code: p.code,
                price: p.price,
                image: p.image,
                hoverImage: p.hoverImage,
                collection: p.collection,
                gender: p.gender,
              }}
            />
          </div>
        ))}
        <div className="shrink-0 w-px" aria-hidden />
      </div>
    </section>
  );
}
