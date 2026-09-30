"use client";

import { useId, useState } from "react";
import LuxImage from "@/components/ui/LuxImage";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/home/SectionHeading";
import { BRAND_IMAGES } from "@/lib/cloudinary";

const MATERIALS = [
  {
    name: "Steel",
    detail: "Brushed links and polished edges alternate along the bracelet, so the light moves as you do.",
    src: BRAND_IMAGES.dayDateBlue,
    alt: "Macro of a steel and blue Timect bracelet and bezel",
    position: "18% 88%",
    zoom: 1.45,
  },
  {
    name: "Gold tone",
    detail: "Warm centre links set between steel — gold as an accent, never the whole.",
    src: BRAND_IMAGES.goldChronograph,
    alt: "Macro of a gold and steel Timect chronograph bracelet",
    position: "50% 74%",
    zoom: 1.7,
  },
  {
    name: "Rose tone",
    detail: "One warm hue carried from case to dial to bracelet, softened by a brushed finish.",
    src: BRAND_IMAGES.roseGentsDate,
    alt: "Macro of a rose-tone Timect case and dial",
    position: "30% 30%",
    zoom: 1.2,
  },
  {
    name: "Dial",
    detail: "Deep green meets a field of sparkle, divided by a single diagonal line.",
    src: BRAND_IMAGES.roseLadies,
    alt: "Macro of a Timect ladies dial in green with a sparkling lower half",
    position: "38% 30%",
    zoom: 1.9,
  },
  {
    name: "Black finish",
    detail: "A black case and bracelet framing a calm, pale dial with a date at three.",
    src: BRAND_IMAGES.blackWhite,
    alt: "Timect watch with a black case and bracelet and a pale dial",
    position: "50% 42%",
    zoom: 1.5,
  },
];

export default function MaterialSection() {
  const [active, setActive] = useState(0);
  const uid = useId();

  return (
    <section
      data-header-theme="light"
      aria-labelledby={`${uid}-title`}
      className="bg-[var(--ivory)] text-[var(--ink)] py-28 md:py-40"
    >
      <div className="lux-container">
        <SectionHeading
          index="03"
          eyebrow="Materials & Finish"
          title={
            <span id={`${uid}-title`}>
              Made to be <em>touched.</em>
            </span>
          }
          lede="Surfaces decide how a watch feels long before it tells the time. Each finish is chosen for how it wears, and how it ages."
        />

        <div className="mt-16 md:mt-24 grid grid-cols-12 gap-x-4 md:gap-x-8 gap-y-10 items-start">
          <Reveal variant="mask" className="col-span-12 md:col-span-7 md:order-2">
            <div className="relative aspect-[4/5] md:aspect-[5/6] bg-[var(--stone)] overflow-hidden">
              {MATERIALS.map((m, i) => (
                <div
                  key={m.name}
                  id={`${uid}-panel-${i}`}
                  role="tabpanel"
                  aria-labelledby={`${uid}-tab-${i}`}
                  aria-hidden={i !== active}
                  className={`absolute inset-0 transition-[opacity,filter] duration-[1200ms] ease-[var(--ease-lux)] ${
                    i === active ? "opacity-100 blur-0" : "opacity-0 blur-[6px]"
                  }`}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-[2400ms] ease-[var(--ease-lux)]"
                    style={{
                      transform: `scale(${i === active ? m.zoom : m.zoom * 1.06})`,
                      transformOrigin: m.position,
                    }}
                  >
                    <LuxImage
                      src={m.src}
                      alt={m.alt}
                      fill
                      sizes="(min-width: 768px) 58vw, 100vw"
                      className="object-cover blend-multiply"
                      style={{ objectPosition: m.position }}
                      loading={i === 0 ? undefined : "lazy"}
                    />
                  </div>
                </div>
              ))}
              <span
                className="absolute left-5 bottom-5 numeral text-[0.95rem] text-[var(--ivory)] mix-blend-difference"
                aria-hidden
              >
                {String(active + 1).padStart(2, "0")} / {String(MATERIALS.length).padStart(2, "0")}
              </span>
            </div>
          </Reveal>

          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label="Materials"
            className="col-span-12 md:col-span-5 md:order-1 border-t border-[var(--line)]"
          >
            {MATERIALS.map((m, i) => {
              const selected = i === active;
              return (
                <div key={m.name} className="border-b border-[var(--line)]">
                  <button
                    id={`${uid}-tab-${i}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls={`${uid}-panel-${i}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                        e.preventDefault();
                        const next = (i + (e.key === "ArrowDown" ? 1 : -1) + MATERIALS.length) % MATERIALS.length;
                        setActive(next);
                        document.getElementById(`${uid}-tab-${next}`)?.focus();
                      }
                    }}
                    className="w-full text-left py-6 md:py-7 grid grid-cols-[2.5rem_1fr] items-baseline gap-x-3"
                  >
                    <span
                      className={`numeral text-[0.95rem] transition-colors duration-500 ${selected ? "text-[var(--champagne)]" : "text-[var(--muted)]"}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`display text-[1.9rem] md:text-[2.4rem] leading-none transition-[color,transform] duration-700 ease-[var(--ease-lux)] ${
                        selected ? "text-[var(--ink)] translate-x-1" : "text-[var(--ink)]/40 hover:text-[var(--ink)]/70"
                      }`}
                    >
                      {m.name}
                    </span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-700 ease-[var(--ease-lux)]"
                    style={{ gridTemplateRows: selected ? "1fr" : "0fr" }}
                  >
                    <p className="overflow-hidden pl-[2.75rem] pr-4 text-[0.95rem] font-light leading-[1.75] text-[var(--muted)]">
                      <span className="block pb-7">{m.detail}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
