import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import ParallaxMedia from "@/components/motion/ParallaxMedia";
import { BRAND_IMAGES } from "@/lib/cloudinary";

/** Closing frame: the product, one line, one way forward. */
export default function FinalCTA() {
  return (
    <section
      data-header-theme="dark"
      aria-labelledby="final-title"
      className="relative bg-black text-[var(--ivory)] overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[100svh]">
        <Reveal variant="mask" className="md:col-span-7 md:order-2 relative min-h-[70svh] md:min-h-full">
          <div className="absolute inset-0">
            <ParallaxMedia
              src={BRAND_IMAGES.goldChronograph}
              alt="Timect chronograph in gold and steel against a dark background with drifting gold dust"
              sizes="(min-width: 768px) 58vw, 100vw"
              position="50% 40%"
              depth={0.07}
              className="h-full w-full"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/10 to-transparent"
            />
          </div>
        </Reveal>

        <div className="md:col-span-5 md:order-1 relative flex items-end md:items-center">
          <div className="lux-container md:pr-0 pb-24 md:py-32 -mt-24 md:mt-0 relative">
            <Reveal as="p" className="eyebrow text-[var(--champagne)]">
              Timect
            </Reveal>
            <Reveal as="h2" delay={100} className="display display-lg mt-7">
              <span id="final-title">
                Crafted for
                <br />
                every <em className="text-[var(--champagne-soft)]">second.</em>
              </span>
            </Reveal>
            <Reveal delay={220} className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
              <Link href="/watches" className="lux-btn lux-btn--light">
                Explore the collection
              </Link>
              <Link
                href="/contact"
                className="lux-link text-[var(--ivory)]/70 hover:text-[var(--ivory)] transition-colors"
              >
                Speak with us
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
