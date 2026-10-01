"use client";

import { useId, useState } from "react";
import { cx } from "@/lib/cx";
import { Plus } from "@/components/fuse/icons";

export type FaqItem = { q: string; a: string };

/** Fuse accordion: white rounded rows, rotating plus, grid-rows height animation. */
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q} className="animate-rise-in rounded-fuse bg-white" style={{ animationDelay: `${i * 50}ms` }}>
            <button
              id={`${baseId}-b${i}`}
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${baseId}-p${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start text-[17px] font-semibold md:px-8 md:py-6 md:text-[20px]"
            >
              {item.q}
              <span
                className={cx(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-fuse-md border transition-[transform,background-color,border-color] duration-400",
                  isOpen ? "rotate-45 border-accent-border bg-accent-soft" : "border-line bg-btn",
                )}
              >
                <Plus className="h-5 w-5" />
              </span>
            </button>
            <div
              id={`${baseId}-p${i}`}
              role="region"
              aria-labelledby={`${baseId}-b${i}`}
              className={cx("grid transition-[grid-template-rows] duration-400 ease-fuse-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-[16px] leading-[1.7] text-[#2b2f38] md:px-8 md:pb-8">{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
