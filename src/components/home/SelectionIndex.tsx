"use client";

import { useState } from "react";
import Link from "next/link";
import LuxImage from "@/components/ui/LuxImage";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/home/SectionHeading";
import type { WatchCardData } from "@/components/home/WatchCard";
import { splitProductName } from "@/lib/product-display";

/**
 * Recommended pieces as a typographic index. On desktop the photograph beside it
 * follows the row under the pointer or keyboard focus.
 */
export default function SelectionIndex({ products }: { products: WatchCardData[] }) {
  const [active, setActive] = useState(0);
  if (!products.length) return null;

  return (
    <section data-header-theme="light" className="bg-[var(--paper)] text-[var(--ink)] pb-28 md:pb-40">
      <div className="lux-container">
        <div className="border-t border-[var(--line)] pt-20 md:pt-28">
          <SectionHeading
            index="05"
            eyebrow="The Selection"
            title={
              <>
                Chosen for <em>you.</em>
              </>
            }
            aside={
              <Link href="/watches" className="lux-link">
                View all watches{" "}
                <span className="lux-arrow" aria-hidden>
                  →
                </span>
              </Link>
            }
          />
        </div>

        <div className="mt-16 md:mt-24 grid grid-cols-12 gap-x-4 md:gap-x-8">
          <div className="hidden md:block md:col-span-5 lg:col-span-5">
            <div className="sticky top-[calc(var(--header-h)+2rem)] aspect-[4/5] bg-[#ebe6dc] overflow-hidden">
              {products.map((p, i) => (
                <div
                  key={p.slug}
                  className={`absolute inset-0 transition-[opacity,transform] duration-[1100ms] ease-[var(--ease-lux)] ${
                    i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]"
                  }`}
                  aria-hidden={i !== active}
                >
                  {p.image && (
                    <LuxImage
                      src={p.image}
                      alt=""
                      fill
                      sizes="40vw"
                      loading={i === 0 ? undefined : "lazy"}
                      className="object-cover blend-multiply"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <ol className="col-span-12 md:col-span-7 lg:col-span-6 lg:col-start-7 border-t border-[var(--line)]">
            {products.map((p, i) => {
              const { title, reference } = splitProductName(p.name || p.title, p.code);
              return (
                <Reveal as="li" key={p.slug} delay={i * 60} className="border-b border-[var(--line)]">
                  <Link
                    href={`/product/${p.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group grid grid-cols-[4.5rem_1fr_auto] md:grid-cols-[3rem_1fr_auto] items-center gap-x-5 py-6 md:py-8"
                  >
                    <span className="md:hidden relative block aspect-square bg-[#ebe6dc] overflow-hidden">
                      {p.image && (
                        <LuxImage src={p.image} alt="" fill sizes="72px" className="object-cover blend-multiply" />
                      )}
                    </span>
                    <span
                      className={`hidden md:block numeral text-[0.95rem] transition-colors duration-500 ${
                        i === active ? "text-[var(--champagne)]" : "text-[var(--muted)]"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="display block text-[1.5rem] md:text-[2.1rem] leading-[1.08] transition-transform duration-700 ease-[var(--ease-lux)] md:group-hover:translate-x-2">
                        {title}
                      </span>
                      {reference && (
                        <span className="eyebrow block mt-2 text-[0.6rem] text-[var(--muted)]">{reference}</span>
                      )}
                    </span>
                    <span className="text-right text-[0.85rem] font-light tracking-[0.04em] whitespace-nowrap">
                      {p.price}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
