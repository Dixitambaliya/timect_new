import type { Metadata } from "next";
import ContentPage from "@/components/site/ContentPage";
import { ButtonPrimary, ButtonOutline } from "@/components/fuse/buttons";
import { Box, Shield, Watch } from "@/components/fuse/icons";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover Timect — a wristwatch manufacturer dedicated to precision movements, refined design, and enduring craftsmanship.",
};

const IMAGE =
  "https://res.cloudinary.com/dphscxzb4/image/upload/f_auto,q_auto,w_1400/v1784048470/timect/gold_truton_chronograph.jpg";

const PILLARS = [
  {
    icon: Watch,
    title: "Built as instruments",
    text: "We approach each watch as a complete instrument: a balanced case proportion, a legible dial, a dependable movement, and straps chosen for comfort over long wear. Our manufacturing process balances modern tooling with hand-checked assembly so every piece meets a consistent standard of finish and performance.",
  },
  {
    icon: Box,
    title: "From movement to finished watch",
    text: "Inside each Timect timepiece, the movement is selected for accuracy and serviceability. Cases are machined and finished to resist daily wear. Dials and hands are aligned for clean reading at a glance. Before packing, every watch is inspected for timekeeping, water-resistance integrity, and cosmetic finish.",
  },
  {
    icon: Shield,
    title: "Our promise",
    text: "Whether you choose a classic dress piece, a daily sports watch, or a refined ladies model, Timect stands behind the workmanship of every watch we produce. We build for years of regular wear — not for a season.",
  },
];

export default function AboutPage() {
  return (
    <ContentPage
      title="About Us"
      subtitle="A watch manufacturer devoted to the quiet precision of timekeeping and the craft of building instruments for the wrist."
      width="max-w-site"
      bare
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="relative min-h-[360px] overflow-hidden rounded-fuse bg-placeholder lg:min-h-[560px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGE} alt="Timect chronograph" className="img-fill" />
        </div>
        <div className="flex flex-col justify-center rounded-fuse bg-white p-6 md:p-14">
          <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-muted">Timect</p>
          <h2 className="fuse-h3 mt-4">Clarity, reliability and lasting quality</h2>
          <p className="mt-6 text-[16px] leading-[1.7] text-[#2b2f38] md:text-[18px]">
            Timect designs and manufactures wristwatches for people who value clarity, reliability, and lasting quality.
            Every collection begins on the drawing board and moves through case design, dial finishing, movement
            selection, and rigorous testing before it reaches your wrist.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonPrimary href="/watches" bg="#f0f2f4">
              Explore the collection
            </ButtonPrimary>
            <ButtonOutline href="/contact">Contact us</ButtonOutline>
          </div>
        </div>
      </div>
      <ul className="mt-3 grid gap-3 md:grid-cols-3">
        {PILLARS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="animate-rise-in rounded-fuse bg-white p-6 md:p-10" style={{ animationDelay: `${150 + i * 80}ms` }}>
            <span className="flex h-14 w-14 items-center justify-center rounded-fuse-md bg-bg text-heading">
              <Icon />
            </span>
            <h3 className="mt-6 text-[22px] font-bold md:text-[24px]">{title}</h3>
            <p className="mt-4 text-[16px] leading-[1.7] text-[#2b2f38]">{text}</p>
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}
