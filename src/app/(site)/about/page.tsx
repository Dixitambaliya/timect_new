import type { Metadata } from "next";
import ContentPage from "@/components/site/ContentPage";
import { ButtonPrimary, ButtonOutline } from "@/components/fuse/buttons";
import { Box, Shield, Watch } from "@/components/fuse/icons";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "About TIMECT",
  description: "Learn about TIMECT's approach to watch design, movement selection, case finishing, inspection, and clear product specifications.",
  path: "/about",
});

const IMAGE =
  "https://res.cloudinary.com/dphscxzb4/image/upload/f_auto,q_auto,w_1400/v1784048470/timect/gold_truton_chronograph.jpg";

const PILLARS = [
  {
    icon: Watch,
    title: "Built as instruments",
    text: "We evaluate each watch as a complete instrument: balanced case proportions, a legible dial, a suitable movement, and straps selected for comfort during regular wear. Product pages identify the available specifications for each model.",
  },
  {
    icon: Box,
    title: "From movement to finished watch",
    text: "A watch brings together its movement, case, dial, hands, crystal, and strap or bracelet. We publish the available model specifications so these details can be compared before making an enquiry.",
  },
  {
    icon: Shield,
    title: "Our promise",
    text: "Whether you are comparing a classic dress piece, a daily sports watch, or a refined ladies model, our goal is to provide clear imagery, specifications, and a direct route to ask questions.",
  },
];

export default function AboutPage() {
  return (
    <ContentPage
      title="About Us"
      subtitle="A watch brand focused on clear product information, considered design, and direct customer enquiries."
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
            Timect presents wristwatches for people who value clarity and considered design. Our collections bring together
            different case styles, dials, movements, and straps, with model details available on each product page.
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
          <li key={title} className="hover-lift animate-rise-in rounded-fuse bg-white p-6 md:p-10" style={{ animationDelay: `${150 + i * 80}ms` }}>
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
