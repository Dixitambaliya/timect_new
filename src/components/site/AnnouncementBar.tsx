"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { ArrowLeft, ArrowRight, WhatsApp } from "@/components/fuse/icons";
import { UTILITY_LINKS } from "./navigation";
import { useSite, whatsappLink } from "./SiteProvider";

/** Top bar: utility links · rotating CMS messages · WhatsApp concierge. */
export default function AnnouncementBar() {
  const { storefront, whatsappNumber } = useSite();
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
      <div className="mx-auto grid h-full max-w-site grid-cols-[1fr] items-center px-3 lg:grid-cols-[1fr_auto_1fr] lg:px-12">
        <nav className="hidden gap-8 lg:flex" aria-label="Utility">
          {UTILITY_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="link-hover">
              {l.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-3 lg:w-[520px]">
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

        <div className="hidden items-center justify-end lg:flex">
          <a
            href={whatsappLink(whatsappNumber, "Hi Timect, I have a question about your watches.")}
            target="_blank"
            rel="noreferrer"
            className="link-hover flex items-center gap-2"
          >
            <WhatsApp className="h-4 w-4 text-whatsapp" />
            Chat with a watch specialist
          </a>
        </div>
      </div>
    </div>
  );
}
