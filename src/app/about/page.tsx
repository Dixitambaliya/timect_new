import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";
import ParallaxMedia from "@/components/motion/ParallaxMedia";
import ScrollLitText from "@/components/motion/ScrollLitText";
import PageReady from "@/components/PageReady";
import { BRAND_IMAGES } from "@/lib/cloudinary";

export const metadata: Metadata = {
  title: "About Us",
  alternates: { canonical: "/about" },
  description:
    "Discover Timect — a wristwatch manufacturer dedicated to precision movements, refined design, and enduring craftsmanship.",
};

const CHAPTERS = [
  {
    title: "Built as instruments",
    body: "We approach each watch as a complete instrument: a balanced case proportion, a legible dial, a dependable movement, and straps chosen for comfort over long wear. Our manufacturing process balances modern tooling with hand-checked assembly so every piece meets a consistent standard of finish and performance.",
    image: BRAND_IMAGES.roseGentsDate,
    alt: "Rose-tone Timect watch dial in close-up",
  },
  {
    title: "From movement to finished watch",
    body: "Inside each Timect timepiece, the movement is selected for accuracy and serviceability. Cases are machined and finished to resist daily wear. Dials and hands are aligned for clean reading at a glance. Before packing, every watch is inspected for timekeeping, water-resistance integrity, and cosmetic finish.",
    image: BRAND_IMAGES.dayDateBlue,
    alt: "Timect two-tone watch with a blue bezel, seen at an angle",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <PageReady />
      <Header />
      <main>
        <section className="lux-container pt-16 md:pt-28 pb-20 md:pb-28">
          <Reveal as="p" className="eyebrow text-[var(--champagne)]">
            About Timect
          </Reveal>
          <Reveal as="h1" delay={80} className="display display-xl mt-8 max-w-[12ch]">
            The quiet precision of <em>time.</em>
          </Reveal>
          <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-12 gap-8">
            <Reveal as="p" delay={160} className="md:col-span-5 md:col-start-8 lede text-[var(--muted)]">
              A watch manufacturer devoted to the quiet precision of timekeeping and the craft of building
              instruments for the wrist.
            </Reveal>
          </div>
        </section>

        <Reveal variant="mask">
          <ParallaxMedia
            src={BRAND_IMAGES.heroBlue}
            alt="Timect watch with a silver dial and deep blue bezel against dark mist"
            sizes="100vw"
            position="50% 46%"
            depth={0.1}
            preload
            className="h-[70svh] md:h-[88svh] bg-black"
          />
        </Reveal>

        <section className="lux-container py-24 md:py-40">
          <ScrollLitText
            className="display display-lg max-w-[22ch]"
            text="Timect designs and manufactures wristwatches for people who value clarity, reliability, and lasting quality."
          />
          <Reveal as="p" className="lede mt-12 md:mt-16 md:ml-[40%] text-[var(--muted)]">
            Every collection begins on the drawing board and moves through case design, dial finishing, movement
            selection, and rigorous testing before it reaches your wrist.
          </Reveal>
        </section>

        {CHAPTERS.map((c, i) => (
          <section key={c.title} className={i % 2 ? "bg-[var(--paper)]" : "bg-[var(--ivory)]"}>
            <div className="lux-container py-24 md:py-36 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-12 items-center">
              <Reveal variant="mask" className={`md:col-span-6 ${i % 2 ? "md:order-2 md:col-start-7" : ""}`}>
                <ParallaxMedia
                  src={c.image}
                  alt={c.alt}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-[4/5] bg-[var(--stone)]"
                />
              </Reveal>
              <div className={`md:col-span-5 ${i % 2 ? "md:order-1" : "md:col-start-8"}`}>
                <Reveal as="p" className="eyebrow text-[var(--champagne)] flex items-center gap-4">
                  <span className="numeral text-[0.95rem] tracking-normal">{`0${i + 1}`}</span>
                  <span className="h-px w-10 bg-current opacity-50" aria-hidden />
                  Chapter
                </Reveal>
                <Reveal as="h2" delay={80} className="display display-md mt-7">
                  {c.title}
                </Reveal>
                <Reveal as="p" delay={160} className="lede mt-7 text-[var(--muted)]">
                  {c.body}
                </Reveal>
              </div>
            </div>
          </section>
        ))}

        <section className="bg-[var(--noir)] text-[var(--ivory)]" data-header-theme="dark">
          <div className="lux-container py-28 md:py-40 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7">
              <Reveal as="p" className="eyebrow text-[var(--champagne)]">
                Our promise
              </Reveal>
              <Reveal as="h2" delay={80} className="display display-lg mt-8">
                Built for years, <em>not for a season.</em>
              </Reveal>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <Reveal as="p" delay={160} className="lede text-[var(--muted-dark)]">
                Whether you choose a classic dress piece, a daily sports watch, or a refined ladies model, Timect
                stands behind the workmanship of every watch we produce.
              </Reveal>
              <Reveal delay={240} className="mt-10">
                <Link href="/watches" className="lux-btn lux-btn--light">
                  Explore the collection
                </Link>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
