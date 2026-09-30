import type { ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";

type Props = {
  index: string;
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  tone?: "light" | "dark";
  /** Right-aligned slot (e.g. a "view all" link). */
  aside?: ReactNode;
  as?: "h2" | "h1";
};

/** Editorial section opener: numbered eyebrow, display title, measured lede. */
export default function SectionHeading({ index, eyebrow, title, lede, tone = "light", aside, as: H = "h2" }: Props) {
  const muted = tone === "dark" ? "text-[var(--muted-dark)]" : "text-[var(--muted)]";
  return (
    <div className="grid grid-cols-12 gap-x-4 md:gap-x-8 gap-y-8 items-end">
      <div className="col-span-12 lg:col-span-7">
        <Reveal as="p" className="eyebrow flex items-center gap-4 text-[var(--champagne)]">
          <span className="numeral text-[0.95rem] tracking-normal">{index}</span>
          <span className="h-px w-10 bg-current opacity-50" aria-hidden />
          {eyebrow}
        </Reveal>
        <Reveal as={H} delay={80} className="display display-lg mt-7 md:mt-9">
          {title}
        </Reveal>
      </div>
      {(lede || aside) && (
        <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pb-3">
          {lede && (
            <Reveal as="p" delay={160} className={`lede ${muted}`}>
              {lede}
            </Reveal>
          )}
          {aside && (
            <Reveal delay={220} className={lede ? "mt-8" : ""}>
              {aside}
            </Reveal>
          )}
        </div>
      )}
    </div>
  );
}
