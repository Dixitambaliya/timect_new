import Link from "next/link";

/**
 * Opening scene typography. Rendered inside <WatchSequence/> so the watch
 * (not the text) owns the frame; everything here recedes as the camera moves in.
 */
export default function Hero() {
  return (
    <div className="relative h-full lux-container flex flex-col justify-end landscape:justify-center pb-[10svh] landscape:pb-0">
      <div className="relative max-w-[40rem] md:max-w-[34rem] lg:max-w-[40rem]">
        <p className="eyebrow text-[var(--champagne)] hero-rise" style={{ ["--d" as string]: "0.7s" }}>
          Timect — Wristwatches
        </p>
        <h1 className="display display-xl mt-6 md:mt-8 hero-rise" style={{ ["--d" as string]: "0.85s" }}>
          Crafted for
          <br />
          every <em className="text-[var(--champagne-soft)]">second.</em>
        </h1>
        <p
          className="lede mt-6 md:mt-8 text-[var(--ivory)]/65 max-w-[26rem] hero-rise"
          style={{ ["--d" as string]: "1.05s" }}
        >
          Precision wristwatches engineered with care — from movement to case, built for lasting craftsmanship.
        </p>
        <div
          className="mt-9 md:mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 hero-rise"
          style={{ ["--d" as string]: "1.2s" }}
        >
          <Link href="/watches" className="lux-link text-[var(--ivory)]">
            Explore the collection
            <span className="lux-arrow" aria-hidden>
              →
            </span>
          </Link>
          <a
            href="#craftsmanship"
            className="lux-link text-[var(--ivory)]/60 hover:text-[var(--ivory)] transition-colors"
          >
            The craft
          </a>
        </div>
      </div>

      <div
        className="absolute left-[var(--gutter)] bottom-8 hidden landscape:md:flex items-end gap-5 hero-rise"
        style={{ ["--d" as string]: "1.6s" }}
        aria-hidden
      >
        <span className="relative block h-12 w-px bg-[var(--ivory)]/15 overflow-hidden">
          <span className="scroll-cue-line absolute inset-0 bg-[var(--ivory)]/70" />
        </span>
        <span className="eyebrow text-[0.6rem] text-[var(--ivory)]/45">Scroll to discover</span>
      </div>
    </div>
  );
}
