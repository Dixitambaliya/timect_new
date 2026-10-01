"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { useScrollY } from "@/components/fuse/hooks";
import { ArrowUp } from "@/components/fuse/icons";

/** Floating back-to-top button with circular scroll-progress ring. */
export default function BackToTop() {
  const y = useScrollY();
  const [max, setMax] = useState(1);
  useEffect(() => {
    setMax(Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
  }, [y]);
  const progress = Math.min(1, y / max);
  const show = y > 800;
  const r = 25;
  const c = 2 * Math.PI * r;
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cx(
        "group fixed bottom-4 right-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_30px_rgba(0,0,0,.12)] transition-[transform,opacity] duration-400 ease-fuse-out md:bottom-6 md:right-6",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e6e8ea" strokeWidth="2" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="#343d50"
          strokeWidth="2"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          strokeLinecap="round"
        />
      </svg>
      <ArrowUp className="h-5 w-5 transition-transform duration-400 group-hover:-translate-y-0.5" />
    </button>
  );
}
