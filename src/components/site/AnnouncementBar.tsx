"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { ArrowLeft, ArrowRight } from "@/components/fuse/icons";
import { useSite } from "./SiteProvider";

/** Top bar with rotating CMS messages. */
export default function AnnouncementBar() {
  const { storefront } = useSite();
  const messages = storefront.announcement;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || messages.length < 2) return;
    const t = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % messages.length);
    }, 5000);
    return () => clearInterval(t);
  }, [paused, messages.length]);

  if (!messages.length) return <div className="h-[var(--announcement-h)] bg-bg" />;

  const go = (d: number) => {
    setDir(d);
    setIndex((i) => (i + d + messages.length) % messages.length);
  };

  return (
    <div
      className="relative z-[60] h-[var(--announcement-h)] bg-bg text-[14px] md:text-[16px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto flex h-full max-w-site items-center justify-center px-3 lg:px-12">
        <div className="flex w-full max-w-[520px] items-center justify-between gap-3">
          <button type="button" onClick={() => go(-1)} aria-label="Previous announcement" className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="relative h-6 flex-1 overflow-hidden text-center font-semibold" aria-live="polite">
            {messages.map((m, i) => (
              <p
                key={`${m}-${i}`}
                className={cx(
                  "absolute inset-0 truncate transition-[transform,opacity] duration-[600ms] ease-fuse-out",
                  i === index ? "translate-x-0 opacity-100" : dir > 0 ? "-translate-x-8 opacity-0" : "translate-x-8 opacity-0",
                )}
                aria-hidden={i !== index}
              >
                {m}
              </p>
            ))}
          </div>
          <button type="button" onClick={() => go(1)} aria-label="Next announcement" className="p-2">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
