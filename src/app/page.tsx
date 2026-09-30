import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Hero from "@/components/home/Hero";
import WatchSequence, { type CameraKey, type SequenceChapter } from "@/components/home/WatchSequence";
import CraftsmanshipSection from "@/components/home/CraftsmanshipSection";
import WatchAnatomy from "@/components/home/WatchAnatomy";
import MaterialSection from "@/components/home/MaterialSection";
import CollectionShowcase from "@/components/home/CollectionShowcase";
import SelectionIndex from "@/components/home/SelectionIndex";
import CollectionsIndex from "@/components/home/CollectionsIndex";
import BrandStory from "@/components/home/BrandStory";
import PrecisionSection from "@/components/home/PrecisionSection";
import FinalCTA from "@/components/home/FinalCTA";
import type { WatchCardData } from "@/components/home/WatchCard";
import { getNewArrivals, getRecommended, type Product } from "@/db/actions";
import { BRAND_IMAGES } from "@/lib/cloudinary";
import { SITE_URL, jsonLdScript } from "@/lib/seo";

/** Re-render the storefront shelves from the catalog at most every 5 minutes. */
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Camera path over the hero photograph (1568 × 2744). Image points are fractions:
   dial centre ≈ (0.50, 0.46), crown ≈ (0.74, 0.47), lower bracelet ≈ (0.50, 0.68). */
const DESKTOP_PATH: CameraKey[] = [
  { at: 0, fx: 0.5, fy: 0.47, sx: 0.66, sy: 0.5, zoom: 1.18 },
  { at: 0.13, fx: 0.5, fy: 0.47, sx: 0.5, sy: 0.5, zoom: 1.3 },
  { at: 0.26, fx: 0.5, fy: 0.455, sx: 0.64, sy: 0.5, zoom: 2.2 },
  { at: 0.4, fx: 0.5, fy: 0.455, sx: 0.64, sy: 0.5, zoom: 2.32 },
  { at: 0.52, fx: 0.745, fy: 0.47, sx: 0.36, sy: 0.52, zoom: 2.6 },
  { at: 0.62, fx: 0.745, fy: 0.47, sx: 0.36, sy: 0.52, zoom: 2.7 },
  { at: 0.74, fx: 0.5, fy: 0.68, sx: 0.64, sy: 0.46, zoom: 2.05 },
  { at: 0.84, fx: 0.5, fy: 0.66, sx: 0.64, sy: 0.48, zoom: 2.05 },
  { at: 0.97, fx: 0.5, fy: 0.47, sx: 0.66, sy: 0.5, zoom: 1.18 },
];

const MOBILE_PATH: CameraKey[] = [
  { at: 0, fx: 0.5, fy: 0.47, sx: 0.5, sy: 0.36, zoom: 1.2 },
  { at: 0.13, fx: 0.5, fy: 0.47, sx: 0.5, sy: 0.4, zoom: 1.3 },
  { at: 0.26, fx: 0.5, fy: 0.455, sx: 0.5, sy: 0.33, zoom: 2.05 },
  { at: 0.4, fx: 0.5, fy: 0.455, sx: 0.5, sy: 0.33, zoom: 2.15 },
  { at: 0.52, fx: 0.72, fy: 0.47, sx: 0.5, sy: 0.33, zoom: 2.4 },
  { at: 0.62, fx: 0.72, fy: 0.47, sx: 0.5, sy: 0.33, zoom: 2.5 },
  { at: 0.74, fx: 0.5, fy: 0.68, sx: 0.5, sy: 0.33, zoom: 1.85 },
  { at: 0.84, fx: 0.5, fy: 0.66, sx: 0.5, sy: 0.34, zoom: 1.85 },
  { at: 0.97, fx: 0.5, fy: 0.47, sx: 0.5, sy: 0.36, zoom: 1.2 },
];

const CHAPTERS: SequenceChapter[] = [
  {
    from: 0.2,
    to: 0.43,
    index: "I",
    eyebrow: "The Dial",
    title: (
      <>
        Read in a <em>single glance.</em>
      </>
    ),
    body: "Baton indices, a Roman twelve and a day–date window — composed so the time arrives before the thought.",
    align: "left",
  },
  {
    from: 0.46,
    to: 0.65,
    index: "II",
    eyebrow: "The Crown",
    title: (
      <>
        Made for the <em>fingertips.</em>
      </>
    ),
    body: "A fluted crown set close to the case: easy to find, easy to turn, quietly out of the way.",
    align: "right",
  },
  {
    from: 0.68,
    to: 0.86,
    index: "III",
    eyebrow: "The Bracelet",
    title: (
      <>
        Steel, and <em>deep blue.</em>
      </>
    ),
    body: "Alternating links in two tones carry the colour of the bezel along the wrist.",
    align: "left",
  },
  {
    from: 0.9,
    to: 1,
    index: "IV",
    eyebrow: "The Whole",
    title: (
      <>
        Every element, <em>in balance.</em>
      </>
    ),
    body: "Proportion, legibility and finish — resolved together, never one at the expense of another.",
    align: "left",
  },
];

function toCard(p: Product): WatchCardData {
  return {
    slug: p.slug,
    name: p.name,
    title: p.title,
    code: p.code,
    price: p.price,
    image: p.image,
    hoverImage: p.hoverImage,
    collection: p.collection,
    gender: p.gender,
    tag: p.tag,
  };
}

export default async function Home() {
  const [arrivals, recommended] = await Promise.all([getNewArrivals(), getRecommended()]);
  const newArrivals = arrivals.filter((p) => p.slug).map(toCard);
  const selection = recommended.filter((p) => p.slug).map(toCard);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "New arrivals",
    itemListElement: newArrivals.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/product/${p.slug}`,
      name: p.name || p.title,
    })),
  };

  return (
    <>
      <Header overlay />
      <main>
        <WatchSequence
          id="top"
          src={BRAND_IMAGES.heroBlue}
          width={1568}
          height={2744}
          alt="Timect watch with a silver dial, deep blue bezel and two-tone steel bracelet, set against dark mist"
          desktopPath={DESKTOP_PATH}
          mobilePath={MOBILE_PATH}
          chapters={CHAPTERS}
          intro={<Hero />}
        />
        <CraftsmanshipSection />
        <WatchAnatomy />
        <MaterialSection />
        <CollectionShowcase products={newArrivals} />
        <SelectionIndex products={selection} />
        <CollectionsIndex />
        <BrandStory />
        <PrecisionSection />
        <FinalCTA />
      </main>
      <Footer />
      <SmoothScroll />
      {newArrivals.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(itemList) }} />
      )}
    </>
  );
}
