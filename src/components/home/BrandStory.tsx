import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import ScrollLitText from "@/components/motion/ScrollLitText";
import LuxImage from "@/components/ui/LuxImage";
import { BRAND_IMAGES } from "@/lib/cloudinary";

const PRINCIPLES = [
  {
    title: "Built as instruments",
    body: "A balanced case, a legible dial, a dependable movement and a strap chosen for comfort over long wear.",
  },
  {
    title: "Checked by hand",
    body: "Modern tooling, hand-checked assembly. Every watch is inspected for timekeeping, water-resistance and finish before it is packed.",
  },
  {
    title: "Made for years",
    body: "We build for years of regular wear — not for a season.",
  },
];

/** Why Timect exists, told in the brand's own words. */
export default function BrandStory() {
  return (
    <section
      data-header-theme="light"
      aria-labelledby="story-title"
      className="bg-[var(--paper)] text-[var(--ink)] py-28 md:py-44"
    >
      <div className="lux-container">
        <Reveal as="p" className="eyebrow text-[var(--champagne)] flex items-center gap-4">
          <span className="numeral text-[0.95rem] tracking-normal">07</span>
          <span className="h-px w-10 bg-current opacity-50" aria-hidden />
          Our Story
        </Reveal>
        <h2 id="story-title" className="sr-only">
          Our story
        </h2>

        <ScrollLitText
          className="display display-lg mt-10 md:mt-14 max-w-[18ch] md:max-w-[22ch] leading-[1.04]"
          text="Timect designs and manufactures wristwatches for people who value clarity, reliability and lasting quality."
        />

        <div className="mt-20 md:mt-32 grid grid-cols-12 gap-x-4 md:gap-x-8 gap-y-16 items-end">
          <Reveal
            variant="focus"
            className="col-span-12 md:col-span-5 relative aspect-[4/5] bg-[var(--ivory)] overflow-hidden"
          >
            <LuxImage
              src={BRAND_IMAGES.blackWhite}
              alt="Timect watch with a black case and bracelet and a pale dial"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-contain blend-multiply p-[12%]"
            />
          </Reveal>

          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <ol className="border-t border-[var(--line)]">
              {PRINCIPLES.map((p, i) => (
                <Reveal
                  as="li"
                  key={p.title}
                  delay={i * 90}
                  className="grid grid-cols-[3rem_1fr] gap-x-4 py-8 border-b border-[var(--line)]"
                >
                  <span className="numeral italic text-[1.05rem] text-[var(--champagne)]">
                    {["I", "II", "III"][i]}.
                  </span>
                  <span>
                    <span className="display block text-[1.6rem] md:text-[1.9rem] leading-tight">{p.title}</span>
                    <span className="block mt-3 text-[0.95rem] font-light leading-[1.75] text-[var(--muted)] max-w-[30rem]">
                      {p.body}
                    </span>
                  </span>
                </Reveal>
              ))}
            </ol>
            <Reveal className="mt-10">
              <Link href="/about" className="lux-link">
                Read our story{" "}
                <span className="lux-arrow" aria-hidden>
                  →
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
