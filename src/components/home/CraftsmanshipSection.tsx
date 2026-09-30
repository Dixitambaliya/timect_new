import Reveal from "@/components/motion/Reveal";
import ParallaxMedia from "@/components/motion/ParallaxMedia";
import SectionHeading from "@/components/home/SectionHeading";
import { BRAND_IMAGES } from "@/lib/cloudinary";

const plates = [
  {
    src: BRAND_IMAGES.roseGentsDate,
    alt: "Close view of a rose-tone Timect dial with vertical lines, raised batons and a day–date window",
    label: "The Dial",
    caption: "Vertical lines cut across a rose-tone dial. Raised batons catch the light as the wrist turns.",
    position: "42% 45%",
  },
  {
    src: BRAND_IMAGES.dayDateBlue,
    alt: "Timect two-tone watch with a blue bezel and steel-and-blue bracelet, seen at an angle",
    label: "The Case",
    caption: "A deep blue bezel meets polished steel — the line between them drawn with intent.",
    position: "28% 50%",
  },
  {
    src: BRAND_IMAGES.goldChronograph,
    alt: "Timect chronograph in gold and steel with a white dial and three sub-dials",
    label: "The Chronograph",
    caption: "Three sub-dials held in balance around a single centre seconds hand.",
    position: "50% 42%",
  },
];

/** Macro editorial: from the complete watch into the details that make it. */
export default function CraftsmanshipSection() {
  return (
    <section
      id="craftsmanship"
      data-header-theme="light"
      className="relative bg-[var(--ivory)] text-[var(--ink)] py-28 md:py-40 scroll-mt-0"
    >
      <div className="lux-container">
        <SectionHeading
          index="01"
          eyebrow="Craftsmanship"
          title={
            <>
              Every detail
              <br />
              has a <em>purpose.</em>
            </>
          }
          lede="A watch is read in a glance and worn for years. Between those two moments sits every decision we make — proportion, finish, legibility, feel."
        />

        <div className="mt-20 md:mt-32 grid grid-cols-12 gap-x-4 md:gap-x-8 gap-y-20 md:gap-y-0">
          {/* Plate I — dominant */}
          <figure className="col-span-12 md:col-span-7">
            <Reveal variant="mask">
              <ParallaxMedia
                src={plates[0].src}
                alt={plates[0].alt}
                sizes="(min-width: 768px) 58vw, 100vw"
                position={plates[0].position}
                className="aspect-[4/5] bg-[var(--stone)]"
              />
            </Reveal>
            <PlateCaption n="I" {...plates[0]} />
          </figure>

          {/* Plate II — offset, smaller */}
          <figure className="col-span-10 col-start-3 md:col-span-4 md:col-start-9 md:mt-[38%]">
            <Reveal variant="mask" delay={120}>
              <ParallaxMedia
                src={plates[1].src}
                alt={plates[1].alt}
                sizes="(min-width: 768px) 32vw, 84vw"
                position={plates[1].position}
                depth={0.12}
                className="aspect-[3/4] bg-[var(--stone)]"
              />
            </Reveal>
            <PlateCaption n="II" {...plates[1]} />
          </figure>

          {/* Plate III — wide, stepped in */}
          <figure className="col-span-12 md:col-span-6 md:col-start-3 md:mt-32">
            <Reveal variant="mask">
              <ParallaxMedia
                src={plates[2].src}
                alt={plates[2].alt}
                sizes="(min-width: 768px) 50vw, 100vw"
                position={plates[2].position}
                className="aspect-[5/4] bg-[var(--noir)]"
              />
            </Reveal>
            <PlateCaption n="III" {...plates[2]} />
          </figure>
        </div>
      </div>
    </section>
  );
}

function PlateCaption({ n, label, caption }: { n: string; label: string; caption: string }) {
  return (
    <Reveal as="figcaption" className="mt-6 md:mt-8 grid grid-cols-[3rem_1fr] gap-x-2 max-w-[30rem]">
      <span className="numeral italic text-[1.05rem] text-[var(--champagne)] leading-none pt-[2px]">{n}.</span>
      <span>
        <span className="eyebrow block">{label}</span>
        <span className="block mt-3 text-[0.95rem] font-light leading-[1.75] text-[var(--muted)]">{caption}</span>
      </span>
    </Reveal>
  );
}
