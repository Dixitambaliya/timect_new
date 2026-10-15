import { TIMECT_LOGO } from "@/data/storefront";
import { cx } from "@/lib/cx";

/** Timect logo (mark + wordmark in one image). `light` renders it white for use over dark/photo headers. */
export default function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={TIMECT_LOGO}
      alt="Timect"
      width={1552}
      height={889}
      className={cx(
        "block w-auto shrink-0 object-contain",
        // Artwork is black-on-transparent — knock it out to white on dark backgrounds.
        light && "brightness-0 invert",
        compact ? "h-9 md:h-10" : "h-10 md:h-12",
      )}
    />
  );
}
