import Link from "next/link";
import { SHOP_BY_CATEGORY } from "@/data/categoryFilters";

export default function ShopByCategory() {
  return (
    <section className="max-w-[1400px] mx-auto px-8 py-16">
      <h2 className="text-center tracked-sm text-[15px] mb-10">
        SHOP BY CATEGORY
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {SHOP_BY_CATEGORY.map((cat) => (
          <Link
            key={cat.slug}
            href={`/watches?filter=${cat.slug}`}
            className="cat-tile group cursor-pointer"
            style={{ background: cat.bg }}
          >
            <img src={cat.image} alt={cat.label} />
            <div className="label transition-transform duration-300 group-hover:translate-y-[-2px]">
              {cat.label}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
