import Link from "next/link";
import LuxImage from "@/components/ui/LuxImage";
import { displayCase, splitProductName } from "@/lib/product-display";

export type WatchCardData = {
  slug: string;
  name?: string;
  title?: string;
  code?: string;
  price: string;
  image?: string;
  hoverImage?: string;
  collection?: string;
  gender?: string;
  tag?: string;
};

type Props = {
  product: WatchCardData;
  index?: number;
  featured?: boolean;
  sizes?: string;
  onClickCapture?: (e: React.MouseEvent) => void;
};

/**
 * Editorial product card: the photograph owns the frame, metadata stays quiet.
 * White studio backgrounds melt into the warm ground via multiply.
 */
export default function WatchCard({ product, index, featured = false, sizes, onClickCapture }: Props) {
  const split = splitProductName(product.name || product.title, product.code);
  const wearer = product.gender && product.gender !== "Unisex" ? `For ${product.gender === "Men" ? "Him" : "Her"}` : "Timect";
  // Some catalog rows carry only a collection name — let it become the title.
  const title = displayCase(split.title || product.collection || "Timect");
  const reference = split.reference;
  const kicker = split.title && product.collection ? product.collection : wearer;
  const hover = product.hoverImage && product.hoverImage !== product.image ? product.hoverImage : undefined;

  return (
    <Link
      href={`/product/${product.slug}`}
      onClickCapture={onClickCapture}
      draggable={false}
      className="group block focus-visible:outline-offset-8"
    >
      <div
        className={`relative overflow-hidden bg-[#ebe6dc] ${featured ? "aspect-[4/5] md:aspect-[5/6]" : "aspect-[4/5]"}`}
      >
        {product.image && (
          <LuxImage
            src={product.image}
            alt={title}
            fill
            sizes={sizes || "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 80vw"}
            draggable={false}
            className="object-cover blend-multiply transition-[transform,opacity] duration-[1600ms] ease-[var(--ease-lux)] group-hover:scale-[1.035]"
          />
        )}
        {hover && (
          <LuxImage
            src={hover}
            alt=""
            fill
            sizes={sizes || "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 80vw"}
            draggable={false}
            className="object-cover blend-multiply opacity-0 transition-opacity duration-[900ms] ease-[var(--ease-lux)] group-hover:opacity-100"
          />
        )}
        {product.tag && (
          <span className="absolute left-5 top-5 eyebrow text-[0.6rem] text-[var(--ink)]/70">{product.tag}</span>
        )}
        <span
          className="absolute right-5 bottom-5 eyebrow text-[0.6rem] text-[var(--ink)] opacity-0 translate-y-2 transition-all duration-700 ease-[var(--ease-lux)] group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100"
          aria-hidden
        >
          Discover →
        </span>
      </div>

      <div className="mt-6 grid grid-cols-[auto_1fr] gap-x-5">
        {index !== undefined && (
          <span className="numeral text-[0.95rem] text-[var(--champagne)] leading-[1.6]">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        <div className={index === undefined ? "col-span-2" : ""}>
          <p className="eyebrow text-[0.62rem] text-[var(--muted)]">{kicker}</p>
          <h3
            className={`display mt-2.5 line-clamp-2 ${featured ? "text-[1.7rem] md:text-[2rem]" : "text-[1.45rem]"} leading-[1.12]`}
          >
            {title}
          </h3>
          <div className="mt-3 flex items-baseline justify-between gap-4 text-[0.82rem] font-light text-[var(--muted)]">
            <span className="tracking-[0.08em] truncate">{reference}</span>
            <span className="text-[var(--ink)] whitespace-nowrap tracking-[0.04em]">{product.price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
