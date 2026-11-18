import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/site/ContentPage";
import { ButtonPrimary, ButtonOutline } from "@/components/fuse/buttons";
import { createPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = createPageMetadata({
  title: "About Timect Watches",
  description: "Learn about Timect Watches, our approach to wristwatch design, movement selection, case finishing, product inspection, and clear specifications.",
  path: "/about",
  keywords: ["about Timect Watches", "Timect watch brand", "watch design", "watch manufacturing", "Timect official brand"],
});

const IMAGE =
  "https://res.cloudinary.com/dphscxzb4/image/upload/timect/admin/general/yur96x65jjbxtdx5ff97.png";

const EXPERTISE = [
  {
    number: "01",
    title: "Design & proportion",
    text: "From the shape of the case to the clarity of the dial, we look at how the details come together on the wrist.",
  },
  {
    number: "02",
    title: "The details within",
    text: "Movements, cases, crystals and straps each play a part. Our model specifications help you understand what makes a watch right for you.",
  },
  {
    number: "03",
    title: "A considered choice",
    text: "Clear imagery, practical information and a direct way to ask questions make it easier to find a watch you will enjoy wearing.",
  },
];

export default function AboutPage() {
  const years = new Date().getFullYear() - 2003;
  return (
    <>
      <JsonLd data={webPageSchema({ name: "About Timect Watches", description: "Learn about the Timect Watches brand and its approach to watch design, components, finishing, and product information.", path: "/about", type: "AboutPage" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About Timect Watches", path: "/about" }])} />
    <ContentPage
      title="About Us"
      subtitle="A watch brand focused on clear product information, considered design, and direct customer enquiries."
      width="max-w-site"
      bare
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="relative min-h-[360px] overflow-hidden rounded-fuse bg-placeholder lg:min-h-[560px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGE} alt="Timect Watches chronograph wristwatch" className="img-fill" />
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
      <section className="about-expertise mt-3 overflow-hidden rounded-fuse" aria-labelledby="expertise-title">
        <div className="about-expertise__intro">
          <div className="about-expertise__orbit" aria-hidden="true"><span /><span /><span /></div>
          <div className="relative z-10">
            <p className="about-expertise__eyebrow reveal-rise">The Timect approach <span> / </span> Our expertise</p>
            <h2 id="expertise-title" className="about-expertise__heading reveal-rise">Time is in<br /><em>the details.</em></h2>
            <p className="about-expertise__lead reveal-rise">A watch is more than the sum of its parts. Here is what we pay attention to, from the first glance to everyday wear.</p>
            <p className="about-expertise__heritage reveal-rise"><strong>{years}</strong><span>years since<br />our founding in 2003</span></p>
          </div>
          <span className="about-expertise__index" aria-hidden="true">T / 01—03</span>
        </div>
        <div className="about-expertise__list">
          {EXPERTISE.map(({ number, title, text }) => (
            <div key={number} className="about-expertise__row reveal-rise">
              <span className="about-expertise__number">{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="about-expertise__arrow" aria-hidden="true">↗</span>
            </div>
          ))}
          <div className="about-expertise__footer"><span>Thoughtful watches. Clear details.</span><Link href="/watches">Explore the collection <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
    </ContentPage>
    </>
  );
}
