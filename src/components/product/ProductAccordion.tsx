"use client";

import { useId, useState } from "react";

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface ProductAccordionProps {
  items: AccordionItem[];
}

export default function ProductAccordion({ items }: ProductAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const uid = useId();

  return (
    <div className="w-full border-t border-[var(--line)]">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={index} className="border-b border-[var(--line)]">
            <h3>
              <button
                id={`${uid}-h-${index}`}
                type="button"
                aria-expanded={open}
                aria-controls={`${uid}-p-${index}`}
                onClick={() => setOpenIndex(open ? null : index)}
                className="group w-full py-6 md:py-7 flex justify-between items-center gap-6 text-left"
              >
                <span className="flex items-baseline gap-5">
                  <span className="numeral text-[0.9rem] text-[var(--champagne)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="display text-[1.5rem] md:text-[1.75rem] leading-none transition-transform duration-700 ease-[var(--ease-lux)] group-hover:translate-x-1">
                    {item.title}
                  </span>
                </span>
                <span className="relative w-4 h-4 shrink-0" aria-hidden>
                  <span className="absolute left-0 top-1/2 w-4 h-px bg-current" />
                  <span
                    className={`absolute left-0 top-1/2 w-4 h-px bg-current transition-transform duration-500 ease-[var(--ease-lux)] ${
                      open ? "rotate-0" : "rotate-90"
                    }`}
                  />
                </span>
              </button>
            </h3>
            <div
              id={`${uid}-p-${index}`}
              role="region"
              aria-labelledby={`${uid}-h-${index}`}
              className="grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-lux)]"
              style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
            >
              <div className="overflow-hidden" inert={!open}>
                <div className="pb-8 md:pl-[2.9rem] text-[var(--ink)]/85">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
