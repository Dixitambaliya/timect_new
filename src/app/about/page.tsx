import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "About Us | Timect",
  description:
    "Discover Timect — a wristwatch manufacturer dedicated to precision movements, refined design, and enduring craftsmanship.",
};

export default function AboutPage() {
  return (
    <StaticPage
      title="About Us"
      subtitle="A watch manufacturer devoted to the quiet precision of timekeeping and the craft of building instruments for the wrist."
    >
      <section className="space-y-6">
        <p>
          Timect designs and manufactures wristwatches for people who value
          clarity, reliability, and lasting quality. Every collection begins on
          the drawing board and moves through case design, dial finishing,
          movement selection, and rigorous testing before it reaches your wrist.
        </p>

        <h2 className="serif text-[24px] font-medium text-[#111] pt-4">
          Built as instruments
        </h2>
        <p>
          We approach each watch as a complete instrument: a balanced case
          proportion, a legible dial, a dependable movement, and straps chosen
          for comfort over long wear. Our manufacturing process balances modern
          tooling with hand-checked assembly so every piece meets a consistent
          standard of finish and performance.
        </p>

        <h2 className="serif text-[24px] font-medium text-[#111] pt-4">
          From movement to finished watch
        </h2>
        <p>
          Inside each Timect timepiece, the movement is selected for accuracy
          and serviceability. Cases are machined and finished to resist daily
          wear. Dials and hands are aligned for clean reading at a glance. Before
          packing, every watch is inspected for timekeeping, water-resistance
          integrity, and cosmetic finish.
        </p>

        <h2 className="serif text-[24px] font-medium text-[#111] pt-4">
          Our promise
        </h2>
        <p>
          Whether you choose a classic dress piece, a daily sports watch, or a
          refined ladies model, Timect stands behind the workmanship of every
          watch we produce. We build for years of regular wear — not for a
          season.
        </p>
      </section>
    </StaticPage>
  );
}
