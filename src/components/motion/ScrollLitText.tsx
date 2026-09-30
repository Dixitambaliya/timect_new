"use client";

import { useCallback, useMemo, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { clamp01, useScrollProgress } from "@/hooks/useScrollProgress";

type Props = {
  text: string;
  className?: string;
  as?: "p" | "h2" | "blockquote";
};

/**
 * A statement read at the pace of the scroll: words brighten one after another
 * as the passage crosses the centre of the viewport.
 */
export default function ScrollLitText({ text, className = "", as: Tag = "p" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const words = useMemo(() => text.split(/\s+/), [text]);

  const onProgress = useCallback(
    (p: number) => {
      const el = ref.current;
      if (!el || reduced) return;
      // Light the words between 25% and 65% of the pass.
      const t = clamp01((p - 0.22) / 0.4) * words.length;
      const spans = (el.lastElementChild as HTMLElement | null)?.children ?? [];
      for (let i = 0; i < spans.length; i++) {
        const o = 0.16 + 0.84 * clamp01(t - i);
        (spans[i] as HTMLElement).style.opacity = o.toFixed(3);
      }
    },
    [reduced, words.length],
  );
  useScrollProgress(ref, onProgress, "pass");

  return (
    <Tag ref={ref as never} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i} style={{ opacity: reduced ? 1 : 0.16, transition: "opacity 0.25s linear" }}>
            {w}{" "}
          </span>
        ))}
      </span>
    </Tag>
  );
}
