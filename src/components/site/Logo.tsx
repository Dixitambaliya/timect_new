import { TIMECT_LOGO } from "@/data/storefront";
import { cx } from "@/lib/cx";

/** Timect mark + wordmark. `light` renders white text for use over imagery. */
export default function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TIMECT_LOGO}
        alt=""
        width={48}
        height={48}
        className={cx(
          "shrink-0 rounded-full bg-white object-contain",
          compact ? "h-8 w-8 md:h-9 md:w-9" : "h-9 w-9 md:h-11 md:w-11",
        )}
      />
      <span
        className={cx(
          "font-chivo font-black uppercase leading-none tracking-[0.18em]",
          compact ? "text-[18px] md:text-[20px]" : "text-[20px] md:text-[26px]",
          light ? "text-white" : "text-heading",
        )}
      >
        Timect
      </span>
    </span>
  );
}
